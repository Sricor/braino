import type { Context, NextFunction } from "@components/grammy.ts";
import Base from "@controller/base.ts";

class Handler extends Base {
  handleRequest = async () => {
    const target = this.textMessageParams()[0];
    const data = await this.database?.openai.select() || {};
    data.baseurl = target;
    const { modifiedCount } = await this.database?.openai.update(data);
    if (modifiedCount === 1) {
      return await this.context.reply(`All set.`);
    }
    return await this.context.reply("Error.");
  };
}

export default async (context: Context, _next: NextFunction) => {
  return await (new Handler(context)).handleRequest();
};
