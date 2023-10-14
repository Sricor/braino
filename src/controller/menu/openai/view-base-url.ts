import type { Context, NextFunction } from "@components/grammy.ts";
import Base from "@controller/base.ts";

class Handler extends Base {
  handleRequest = async () => {
    const database = this.instantiateDatabase();
    if (!database) return await this.editCallbackQueryText("Error.");
    const data = await database.openai.config.get();
    return await this.editCallbackQueryText(String(data?.baseURL));
  };
}

export default async (context: Context, _next: NextFunction) => {
  return await (new Handler(context)).handleRequest();
};
