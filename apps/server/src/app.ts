import express from "express";
import { globalErrorHandlerMiddleware } from "@/middleware/errorHandler.middleware";
import cors from "cors";
import morgan from "morgan";
import { env } from "@config/env";

import { auth } from "@/lib/auth";

const app = express();

// cors configuration middleware
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      ...(env?.CORS_ORIGIN ? [env.CORS_ORIGIN] : []),
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true, // Allow credentials (cookies, auth headers etc)
  })
);

// all routes imported here
import { toNodeHandler } from "better-auth/node";
import videoRoutes from "@/routes/video.routes";
import conversationRoutes from "@/routes/conversation.routes";
import chatRoutes from "@/routes/chat.routes";

// logger middleware
app.use(morgan(env?.NODE_ENV === "development" ? "dev" : "combined"))

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
app.use("/api/videos", videoRoutes);
app.use("/api", conversationRoutes);
app.use("/api", chatRoutes);

// global error handler middleware
app.use(globalErrorHandlerMiddleware)

export { app };
