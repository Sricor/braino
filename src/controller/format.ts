import type { Context, Next } from "@components/grammy.ts";
import { MiddlewareObject } from "@components/grammy.ts";
import { base64decode, base64encode } from "@components/utils.ts";

export class Base64Decode extends MiddlewareObject {
  middleware = () => async (context: Context, _next: Next) => {
    const parameters = context.conversation.splitTextMessage();

    parameters.length === 2
      ? await context.conversation.reply(base64decode(parameters[1].toString()))
      : await context.conversation.reply("Parameter error.");
  };
}

export class Base64Encode extends MiddlewareObject {
  middleware = () => async (context: Context, _next: Next) => {
    const parameters = context.conversation.splitTextMessage();

    parameters.length === 2
      ? await context.conversation.reply(base64encode(parameters[1].toString()))
      : await context.conversation.reply("Parameter error.");
  };
}

export class UserInfomation extends MiddlewareObject {
  middleware = () => async (context: Context, _next: Next) => {
    await context.conversation.reply("Hello");
  };
}

export class Start extends MiddlewareObject {
  middleware = () => async (context: Context, _next: Next) => {
    await context.conversation.reply("Hello! How can I assist you today?");
  };
}
