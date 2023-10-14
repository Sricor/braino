import type { Context, NextFunction } from "@components/grammy.ts";
import Base from "@controller/base.ts";

class Handler extends Base {
  handleRequest = async () => {
    const openai = await this.instantiateOpenAI();
    if (!openai) return this.context.reply("u have no openai token.");
    const content = this.context.message?.text || "Hello";
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ content: content, role: "user" }],
    });
    await this.context.reply(completion.choices[0].message.content);
  };
}

export default async (context: Context, _next: NextFunction) => {
  return await (new Handler(context)).handleRequest();
};
