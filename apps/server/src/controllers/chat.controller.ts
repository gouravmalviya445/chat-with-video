import type {
  Request,
  NextFunction,
  Response,
} from "express";

import createHttpError from "http-errors";

import { chatWithVideo } from "@/services/chat.service";
import { sendMessageSchema } from "@/validators/chat.schema";

import { pipeUIMessageStreamToResponse, toUIMessageStream } from "ai";

async function sendMessage(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const conversationId = req.params.conversationId as (string | undefined);

    if (!conversationId) {
      next(
        createHttpError(
          400,
          "Conversation ID is required",
        ),
      );
      return;
    }

    const parsed = sendMessageSchema.safeParse(req.body);

    if (!parsed.success) {
      next(
        createHttpError(
          400,
          parsed.error.issues
            .map((issue) => issue.message)
            .join("\n"),
        ),
      );
      return;
    }

    const {
      result,
      sources,
    } = await chatWithVideo({
      userId: req.user.id,
      conversationId,
      content: parsed.data.content,
    });

    res.status(200);

    // will attach source metadata later.
    pipeUIMessageStreamToResponse({
      response: res,
      stream: toUIMessageStream({
        stream: result.stream,
      })
    })
  } catch (error) {
    next(error);
  }
}

export { sendMessage }