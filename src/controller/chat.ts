import type { Context, NextFunction } from "@components/grammy.ts";
import Base from "@controller/base.ts";

class Handler extends Base {
  handleRequest = async () => {
    const openai = await this.instanceOpenAI();
    if (!openai) return this.context.reply("u have no openai token.");

    const content = this.context.message?.text || "Hello";
    const messages = (await this.database.openai.chat.select())?.messages || [];
    messages.push({ content: content, role: "user" });
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      temperature: 0.5,
      messages: messages,
    });
    messages.push(completion.choices[0].message);
    await this.database.openai.chat.update({ messages: messages });
    await this.context.reply(completion.choices[0].message.content);
  };
}

export default async (context: Context, _next: NextFunction) => {
  return await (new Handler(context)).handleRequest();
};
