import type { Context, NextFunction } from "@components/grammy.ts";
import Base from "@controller/base.ts";

class Handler extends Base {
  handleRequest = async () => {
    const history = await this.database.openai.chat?.select();
    if (history?.messages?.length === 0) {
      return this.context.reply("History is empty.");
    }

    const update = await this.database.openai.chat?.update({ messages: [] });
    if (update) {
      if (update.modifiedCount === 1) {
        return this.context.reply("Clear history message success.");
      }
    }
    return this.context.reply("Error.");
  };
}

export default async (context: Context, _next: NextFunction) => {
  return await (new Handler(context)).handleRequest();
};
