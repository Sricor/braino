import type { Context, NextFunction } from "@components/grammy.ts";
import Base from "./base.ts";

class Handler extends Base {
  handleRequest = async () => {
    await this.context.reply(JSON.stringify(this.context.from, undefined, " "));
  };
}

export default async (context: Context, _next: NextFunction) => {
  return await (new Handler(context)).handleRequest();
};