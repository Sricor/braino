import type { Context, NextFunction } from "@components/grammy.ts";
import Base from "@controller/base.ts";

class Handler extends Base {
  handleRequest = async () => {
    const target = this.textMessageParams()[0];
    const database = this.instanceDatabase()?.openai;

    if (database) {
      const data = await database.select();
      data.token = target;
      const { modifiedCount } = await database.update(data);
      if (modifiedCount === 1) {
        return await this.context.reply(`All set.`);
      }
    }

    return await this.context.reply("Error.");
  };
}

export default async (context: Context, _next: NextFunction) => {
  return await (new Handler(context)).handleRequest();
};
