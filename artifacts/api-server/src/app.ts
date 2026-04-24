import express, { type Express, type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import pinoHttp from "pino-http";

import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

/**
 * =========================
 * CORS CONFIG
 * =========================
 */
const allowedOrigins = (process.env.CORS_ORIGIN ?? "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // allow server-to-server or mobile apps (no origin)
      if (!origin) return callback(null, true);

      // allow all if not configured
      if (allowedOrigins.length === 0) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      logger.warn({ origin }, "Blocked by CORS");
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(helmet());
app.use(compression());

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url,
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.use("/api", router);

app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
  });
});

app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
  logger.error(
    {
      err,
      req: {
        method: req.method,
        url: req.originalUrl,
      },
    },
    "Unhandled server error"
  );

  res.status(500).json({
    error: "Internal server error",
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

export default app;