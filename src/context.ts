import type { Context, Next } from "@components/grammy.ts";
import { MiddlewareObject } from "@components/grammy.ts";
// import { ClientError } from "@components/errors.ts";

export class Logger extends MiddlewareObject {
  middleware = () => async (context: Context, next: Next) => {
    const before = Date.now();
    try {
      await next();
    } catch (err) {
      console.log(err.message || err);
      context.reply(err.message || err);
    }

    const after = Date.now();

    console.log(
      `User identity: ${context.from?.id} Response time: ${after - before} ms`,
    );
  };
}

export class Initial extends MiddlewareObject {
  middleware = () => async (context: Context, next: Next) => {
    context.user = {
      identifier: context.from?.id || 0,
    };

    context.conversation = {
      reply: async (message: string) => {
        try {
          return await context.reply(message, {
            reply_to_message_id: context.message?.message_id,
            parse_mode: "Markdown",
          });
        } catch {
          return await context.reply(message);
        }
      },

      splitTextMessage: (separator = " ", limit?: number) => {
        return context.message?.text
          ? context.message.text.toString().split(separator, limit)
          : [];
      },
    };

    await next();
  };
}
