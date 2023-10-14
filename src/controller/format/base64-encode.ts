import type { Context, NextFunction } from "@components/grammy.ts";
import { base64encode } from "@components/utils.ts";
import Base from "@controller/base.ts";

class Handler extends Base {
  handleRequest = async () => {
    return await this.context.reply(base64encode(String(this.context.match)));
  };
}

export default async (context: Context, _next: NextFunction) => {
  return await (new Handler(context)).handleRequest();
};
