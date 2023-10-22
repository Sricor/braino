import type { Context, NextFunction } from "@components/grammy.ts";
import { base64decode } from "@components/utils.ts";
import { Core } from "../core.ts";

class Handler extends Core {
  handleRequest = async () => {
    const content = this.context.match?.toString() || undefined;
    if (content) {
      return await this.context.reply(base64decode(content));
    }
    return await this.context.reply("Parameter error.");
  };
}

export default async (context: Context, _next: NextFunction) => {
  return await (new Handler(context)).handleRequest();
};
