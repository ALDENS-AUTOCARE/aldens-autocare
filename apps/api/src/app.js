const crypto = require("crypto");
const express = require("express");
const mysql = require("mysql2/promise");

const app = express();
const PORT = Number(process.env.PORT || 3000);
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || "";

const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "aldens_autocare",
  waitForConnections: true,
  connectionLimit: 10,
});

const PLAN_FEATURES = {
  essential: {
    allowsPremiumServices: false,
    allowsFleetDashboard: false,
  },
  premium: {
    allowsPremiumServices: true,
    allowsFleetDashboard: false,
  },
  executive: {
    allowsPremiumServices: true,
    allowsFleetDashboard: true,
  },
};

const PREMIUM_SERVICE_SLUGS = new Set([
  "ceramic-coating",
  "paint-protection-film",
  "premium-detailing",
]);

app.use("/paystack/webhook", express.raw({ type: "application/json" }));
app.use(express.json());

app.use(async (req, res, next) => {
  const userIdHeader = req.header("x-user-id");
  if (!userIdHeader) {
    return next();
  }

  const userId = Number(userIdHeader);
  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(400).json({ error: "Invalid x-user-id header" });
  }

  try {
    const [rows] = await pool.execute(
      `
      SELECT
        u.id,
        u.full_name,
        COALESCE(p.code, 'essential') AS plan
      FROM users u
      LEFT JOIN subscriptions s
        ON s.user_id = u.id
        AND s.status IN ('active', 'trialing')
        AND s.renewal_date >= CURDATE()
      LEFT JOIN plans p
        ON p.id = s.plan_id
      WHERE u.id = ?
      ORDER BY s.renewal_date DESC
      LIMIT 1
      `,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    req.user = {
      id: rows[0].id,
      fullName: rows[0].full_name,
      plan: rows[0].plan,
    };

    return next();
  } catch (error) {
    console.error("Failed to attach user plan", error);
    return res.status(500).json({ error: "Unable to load user context" });
  }
});

function verifyPaystackSignature(req) {
  if (!PAYSTACK_SECRET_KEY) {
    return false;
  }

  const signature = req.header("x-paystack-signature") || "";
  if (!signature) {
    return false;
  }

  const expected = crypto
    .createHmac("sha512", PAYSTACK_SECRET_KEY)
    .update(req.body)
    .digest("hex");

  try {
    const signatureBuffer = Buffer.from(signature, "hex");
    const expectedBuffer = Buffer.from(expected, "hex");

    if (signatureBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
  } catch (error) {
    return false;
  }
}

function hidePremiumServices(services) {
  return services.filter((service) => !service.isPremium);
}

function requireExecutivePlan(req, res, next) {
  const plan = req.user?.plan || "essential";

  if (plan !== "executive") {
    return res.status(403).json({
      error: "Upgrade required",
    });
  }

  return next();
}

function requireFeature(featureName) {
  return (req, res, next) => {
    const plan = req.user?.plan || "essential";
    const features = PLAN_FEATURES[plan] || PLAN_FEATURES.essential;

    if (!features[featureName]) {
      return res.status(403).json({
        error: "Upgrade required",
      });
    }

    return next();
  };
}

app.post("/paystack/webhook", async (req, res) => {
  if (!verifyPaystackSignature(req)) {
    return res.sendStatus(401);
  }

  let event;
  try {
    event = JSON.parse(req.body.toString("utf8"));
  } catch (error) {
    return res.sendStatus(400);
  }

  if (event.event === "charge.success") {
    const data = event.data || {};
    const bookingId = Number(data.metadata?.booking_id);
    const userId = Number(data.metadata?.user_id) || null;
    const amount = Number(data.amount || 0) / 100;
    const currency = data.currency || "NGN";
    const providerReference = data.reference;

    if (!Number.isInteger(bookingId) || bookingId <= 0 || !providerReference) {
      return res.sendStatus(200);
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [bookingRows] = await connection.execute(
        `
        SELECT c.user_id
        FROM bookings b
        INNER JOIN customers c ON c.id = b.customer_id
        WHERE b.id = ?
        LIMIT 1
        `,
        [bookingId]
      );

      if (bookingRows.length === 0) {
        await connection.rollback();
        return res.sendStatus(200);
      }

      const effectiveUserId =
        Number.isInteger(userId) && userId > 0 ? userId : bookingRows[0].user_id;

      await connection.execute(
        `
        INSERT INTO payments (
          user_id,
          booking_id,
          subscription_id,
          provider,
          provider_reference,
          amount,
          currency,
          status,
          payment_type,
          paid_at
        )
        VALUES (?, ?, NULL, 'paystack', ?, ?, ?, 'success', 'booking', NOW())
        ON DUPLICATE KEY UPDATE
          status = VALUES(status),
          paid_at = VALUES(paid_at),
          amount = VALUES(amount),
          currency = VALUES(currency),
          updated_at = NOW()
        `,
        [effectiveUserId, bookingId, providerReference, amount, currency]
      );

      await connection.execute(
        `
        UPDATE bookings
        SET
          payment_status = 'paid',
          status = IF(status = 'pending', 'confirmed', status),
          updated_at = NOW()
        WHERE id = ?
        `,
        [bookingId]
      );

      await connection.execute(
        `
        INSERT INTO audit_logs (
          actor_user_id,
          action,
          entity_type,
          entity_id,
          metadata_json
        )
        VALUES (?, 'payment.charge_success', 'booking', ?, ?)
        `,
        [
          effectiveUserId,
          String(bookingId),
          JSON.stringify({ provider: "paystack", providerReference }),
        ]
      );

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      console.error("Webhook processing failed", error);
      return res.sendStatus(500);
    } finally {
      connection.release();
    }
  }

  return res.sendStatus(200);
});

app.get("/services", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `
      SELECT
        id,
        slug,
        name,
        description,
        base_price,
        duration_minutes
      FROM services
      WHERE is_active = 1
      ORDER BY name ASC
      `
    );

    let services = rows.map((service) => ({
      ...service,
      isPremium: PREMIUM_SERVICE_SLUGS.has(service.slug),
    }));

    if ((req.user?.plan || "essential") === "essential") {
      services = hidePremiumServices(services);
    }

    return res.json({
      plan: req.user?.plan || "essential",
      services,
    });
  } catch (error) {
    console.error("Unable to load services", error);
    return res.status(500).json({ error: "Unable to load services" });
  }
});

app.get("/fleet/dashboard", requireExecutivePlan, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `
      SELECT
        id,
        company_id,
        vehicle_plate,
        vehicle_type,
        vehicle_make,
        vehicle_model,
        service_level,
        status,
        created_at,
        updated_at
      FROM fleet_vehicles
      WHERE status = 'active'
      ORDER BY updated_at DESC
      `
    );

    return res.json({
      plan: req.user?.plan || "essential",
      vehicles: rows,
    });
  } catch (error) {
    console.error("Unable to load fleet dashboard", error);
    return res.status(500).json({ error: "Unable to load fleet dashboard" });
  }
});

app.get(
  "/premium-services",
  requireFeature("allowsPremiumServices"),
  async (req, res) => {
    try {
      const [rows] = await pool.execute(
        `
        SELECT
          id,
          slug,
          name,
          description,
          base_price,
          duration_minutes
        FROM services
        WHERE is_active = 1
          AND slug IN ('ceramic-coating', 'paint-protection-film', 'premium-detailing')
        ORDER BY name ASC
        `
      );

      return res.json({ services: rows });
    } catch (error) {
      console.error("Unable to load premium services", error);
      return res.status(500).json({ error: "Unable to load premium services" });
    }
  }
);

app.get("/health", (req, res) => {
  return res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});
