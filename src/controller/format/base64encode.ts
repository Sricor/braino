import type { Context, NextFunction } from "@components/grammy.ts";
import { base64encode } from "@components/utils.ts";
import Base from "../base.ts";

class Handler extends Base {
  handleRequest = async () => {
    const content = this.context.match?.toString() || undefined;
    if (content) {
      return await this.context.reply(base64encode(content));
    }
    return await this.context.reply("Parameter error.");
  };
}

export default async (context: Context, _next: NextFunction) => {
  return await (new Handler(context)).handleRequest();
};
