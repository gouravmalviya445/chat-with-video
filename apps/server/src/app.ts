import express from "express";
import { globalErrorHandlerMiddleware } from "@/middleware/errorHandler.middleware";

const app = express();

app.use(express.json());

// health check route
app.get("/api/health", (_, res) => {
  res
    .status(200)
    .json({ status: "ok" });
});

// all routes imported here
import videoRouter from "@/routes/video.routes";

app.use("/api/videos", videoRouter);


// global error handler middleware
app.use(globalErrorHandlerMiddleware)

export { app };
