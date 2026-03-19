import type { CorsOptions } from "cors";

const allowedOrigins = [
  process.env.WEB_APP_URL || "http://localhost:3000",
];

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // allow server-to-server requests (no origin) and listed origins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin '${origin}' not allowed`));
    }
  },
  credentials: true,
};
