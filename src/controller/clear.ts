import type { Context, NextFunction } from "@components/grammy.ts";
import Base from "@controller/base.ts";

class Handler extends Base {
  handleRequest = async () => {
    const database = this.instanceDatabase()?.openai.chat;
    const history = await database?.select()
    if(history?.messages?.length === 0){ return this.context.reply("history is empty.")}
    
    const update = await database?.update({messages: []});
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
