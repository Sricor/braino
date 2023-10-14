import type { Context, NextFunction } from "@components/grammy.ts";
import Base from "@controller/base.ts";

class Handler extends Base {
  handleRequest = async () => {
    const database = this.instanceDatabase()?.openai;
    if (!database) return await this.context.reply("Error.");

    const data = await database.select();
    return await this.editCallbackQueryText(String(data.baseurl));
  };
}

export default async (context: Context, _next: NextFunction) => {
  return await (new Handler(context)).handleRequest();
};
