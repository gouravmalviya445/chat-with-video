import { env } from "@/config/env";
import { ApiResponse } from "@/utils/ApiResponse";
import type { Request, Response, NextFunction } from "express";
import { HttpError } from "http-errors";


function globalErrorHandlerMiddleware(
  err: HttpError,
  _r: Request,
  res: Response,
  _n: NextFunction,
) {
  let statusCode = 500;
  let message = "Internal Server Error";

  if (err instanceof HttpError) {
    statusCode = err.statusCode
    message = err.message;
  }

  res
    .status(statusCode)
    .json({
      success: statusCode < 400,
      statusCode,
      message,
      ...(env?.NODE_ENV === "development" ? { stack: err?.stack } : {})
    });
}

export {
  globalErrorHandlerMiddleware
}