import type { Context, NextFunction } from "@components/grammy.ts";
import Base from "./base.ts";

class Handler extends Base {
  userMessage = this.context.message?.text || "Hello";

  handleRequest = async () => {
    // Chat with Large Language Model
    const assistantMessage = await this.chatWithOpenAIChatGPT();

    // Reply Message
    this.context.reply(assistantMessage);
  };

  chatWithOpenAIChatGPT = async () => {
    const openai = await this.instanceOpenAI();
    if (!openai) return "No Token.";

    // Get History
    const listMessage = await this.#getHistoryMessages();
    listMessage.push({ role: "user", content: this.userMessage });

    // Get Chat Config
    const config = (await this.database.OpenAIConfig.select(this.identity))
      ?.chat;

    // Chat
    const chat = await openai.chat.completions.create({
      model: config?.model || "gpt-3.5-turbo",
      messages: listMessage,
      temperature: config?.temperature || 0.75,
      top_p: config?.top_p,
      presence_penalty: config?.presence_penalty,
      frequency_penalty: config?.frequency_penalty,
    });

    if (chat.error) {
      return String(JSON.stringify(chat.error, undefined, " "));
    }

    if (chat.choices) {
      const assistantMessage = chat.choices[0].message.content;
      listMessage.push({ role: "assistant", content: assistantMessage });
      await this.database.ChatMessages.update({
        userid: this.identity,
        messages: listMessage,
      });
      return assistantMessage;
    }

    return "Something Error.";
  };

  #getHistoryMessages = async () => {
    const history = await this.database.ChatMessages.select(this.identity);
    if (!history) {
      await this.database.ChatMessages.insert({ userid: this.identity });
      return [];
    }
    if (!history.messages) {
      history.messages = [];
    }
    return history.messages;
  };
}

export default async (context: Context, _next: NextFunction) => {
  return await (new Handler(context)).handleRequest();
};
