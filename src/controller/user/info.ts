import type { Context, NextFunction } from "@components/grammy.ts";
import Base from "@controller/base.ts";

class Handler extends Base {
  handleRequest = async () => {
    await this.context.reply(String(this.identity || 0));
  };
}

export default async (context: Context, _next: NextFunction) => {
  return await (new Handler(context)).handleRequest();
};
