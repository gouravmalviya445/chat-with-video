import express from "express";
import { globalErrorHandlerMiddleware } from "@/middleware/errorHandler.middleware";
import cors from "cors";
import { env } from "@config/env";

import { auth } from "@/lib/auth";

const app = express();

// cors configuration middleware
app.use(
  cors({
    origin: env?.CORS_ORIGIN ?? "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // Allow credentials (cookies, auth headers etc)
  })
);

// all routes imported here
import videoRouter from "@/routes/video.routes";
import { toNodeHandler } from "better-auth/node";

// better auth routes handler
app.all("/api/auth/*splat", toNodeHandler(auth));

// express middleware
app.use(express.json());

// health check route
app.get("/api/health", (_, res) => {
  res
    .status(200)
    .json({ status: "ok" });
});

// application specific routes
app.use("/api/videos", videoRouter);


// global error handler middleware
app.use(globalErrorHandlerMiddleware)

export { app };
