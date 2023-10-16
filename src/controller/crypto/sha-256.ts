import type { Context, NextFunction } from "@components/grammy.ts";
import { digestMessageWithSHA256 } from "@components/utils.ts";
import Base from "@controller/base.ts";

class Handler extends Base {
  handleRequest = async () => {
    const params = this.textMessageParams();
    console.log(params[0].toString());
    if (params.length === 1) {
      const target = await digestMessageWithSHA256(params[0].toString());
      return await this.context.reply(target);
    }
    return await this.context.reply("Parameter error.");
  };
}

export default async (context: Context, _next: NextFunction) => {
  return await (new Handler(context)).handleRequest();
};
