import { ApiResponse } from "@/utils/ApiResponse";
import type { Request, Response, NextFunction } from "express";
import { HttpError } from "http-errors";


function globalErrorHandlerMiddleware(
  err: HttpError,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  let { statusCode, message } = err;
  // If the error is an instance of HttpError, it will have a statusCode and message.
  // Otherwise, we'll default to 500 and "Internal Server Error".
  if (!(err instanceof HttpError)) {
    statusCode = 500;
    message = "Internal Server Error";
  }
  console.log()

  res
    .status(statusCode)
    .json(new ApiResponse(
      statusCode,
      message,
      null,
      err
    ));
}

export {
  globalErrorHandlerMiddleware
}