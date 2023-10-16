import type { Context, NextFunction } from "@components/grammy.ts";
import { digestMessageWithHMACSHA256 } from "@components/utils.ts";
import Base from "@controller/base.ts";

class Handler extends Base {
  handleRequest = async () => {
    const params = this.textMessageParams()
    if(params.length === 2){
      const target = await digestMessageWithHMACSHA256(params[0].toString(), params[1].toString())
      return await this.context.reply(target);
    }
    return await this.context.reply("Parameter error.")
  };
}

export default async (context: Context, _next: NextFunction) => {
  return await (new Handler(context)).handleRequest();
};
