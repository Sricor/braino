import type { Context, NextFunction } from "@components/grammy.ts";
import Base from "@controller/base.ts";

class Handler extends Base {
  handleRequest = async () => {
    const database = this.instantiateDatabase();
    if (!database) return await this.context.reply("Error.");
    const data = await database.openai.config.get() || {};
    data.token = this.textParams[0];
    database.openai.config.set(data);
    await this.context.reply(`Set to ${this.textParams[0]}`);
  };
}

export default async (context: Context, _next: NextFunction) => {
  return await (new Handler(context)).handleRequest();
};
