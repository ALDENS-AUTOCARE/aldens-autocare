import express from "express";
import cors from "cors";
import routes from "./routes";
import { env } from "./config/env";
import { errorMiddleware } from "./middlewares/error.middleware";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: env.WEB_APP_URL,
      credentials: true,
    })
  );

  app.use(express.json());

  app.use("/api", routes);

  app.use(errorMiddleware);

  return app;
}
