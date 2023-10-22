import type { Context, NextFunction } from "@components/grammy.ts";
import { digestMessageWithSHA256 } from "@components/utils.ts";
import { Core } from "../core.ts";

class Handler extends Core {
  handleRequest = async () => {
    const params = this.textMessageParams();
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
