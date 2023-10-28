import type { Context, Next } from "@components/grammy.ts";
import { MiddlewareObject } from "@components/grammy.ts";
import {
  digestMessageWithHMACSHA256,
  digestMessageWithSHA256,
} from "@components/utils.ts";

export class SHA256 extends MiddlewareObject {
  middleware = () => async (context: Context, _next: Next) => {
    const parameters = context.conversation.splitTextMessage();

    parameters.length === 2
      ? await context.conversation.reply(
        await digestMessageWithSHA256(
          parameters[1].toString(),
        ),
      )
      : await context.conversation.reply("Parameter error.");
  };
}

export class HMACSHA256 extends MiddlewareObject {
  middleware = () => async (context: Context, _next: Next) => {
    const parameters = context.conversation.splitTextMessage();

    parameters.length === 3
      ? await context.conversation.reply(
        await digestMessageWithHMACSHA256(
          parameters[1].toString(),
          parameters[2].toString(),
        ),
      )
      : await context.conversation.reply("Parameter error.");
  };
}
