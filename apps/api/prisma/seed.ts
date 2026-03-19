import bcrypt from "bcryptjs";
import {
  PrismaClient,
  Role,
  UserStatus,
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("ChangeImmediately123!", 10);

  await prisma.user.upsert({
    where: { email: "admin@aldensautocare.com" },
    update: {},
    create: {
      fullName: "Alden's AutoCare Admin",
      email: "admin@aldensautocare.com",
      phone: null,
      passwordHash,
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  const services = [
    {
      slug: "essential-care",
      name: "Essential Care",
      description: "Routine exterior and light interior refresh.",
      basePrice: 250,
      durationMinutes: 60,
      isPremium: false,
      isActive: true,
    },
    {
      slug: "signature-detail",
      name: "Signature Detail",
      description: "Interior and exterior maintenance detail.",
      basePrice: 700,
      durationMinutes: 120,
      isPremium: false,
      isActive: true,
    },
    {
      slug: "executive-finish",
      name: "Executive Finish",
      description: "Premium detail with paint enhancement and deep interior care.",
      basePrice: 2000,
      durationMinutes: 300,
      isPremium: true,
      isActive: true,
    },
  ];

  for (const service of services) {
    await prisma.service.upsert({
      where: { slug: service.slug },
      update: service,
      create: service,
    });
  }

  const plans = [
    {
      code: "SIGNATURE",
      name: "Signature Membership",
      description: "Monthly maintenance plan for regular private customers.",
      monthlyPrice: 900,
      yearlyPrice: 9000,
      includedBookings: 1,
      allowsPremiumServices: false,
      allowsPriorityBooking: true,
      allowsFleetDashboard: false,
      isActive: true,
    },
    {
      code: "EXECUTIVE",
      name: "Executive Membership",
      description: "Premium concierge plan with advanced detailing access.",
      monthlyPrice: 2500,
      yearlyPrice: 25000,
      includedBookings: 2,
      allowsPremiumServices: true,
      allowsPriorityBooking: true,
      allowsFleetDashboard: false,
      isActive: true,
    },
    {
      code: "FLEETCARE",
      name: "FleetCare",
      description: "Corporate maintenance plan for fleet clients.",
      monthlyPrice: 6000,
      yearlyPrice: null,
      includedBookings: 20,
      allowsPremiumServices: false,
      allowsPriorityBooking: true,
      allowsFleetDashboard: true,
      isActive: true,
    },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { code: plan.code },
      update: plan,
      create: plan,
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Phase 2 seed complete.");
  })
  .catch(async (error) => {
    console.error("Seed failed:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
