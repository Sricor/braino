import type { Context, NextFunction } from "@components/grammy.ts";
import { ChatClient, Core, OpenAIClinet } from "./core.ts";

class Handler extends Core {
  userChatClient = new ChatClient(this.identity);
  openaiClient = new OpenAIClinet(this.identity);

  handleRequest = async () => {
    // Chat with Large Language Model
    const userMessage = this.context.message?.text || "Hello";
    await this.userChatClient.insertUserMessage(userMessage);
    const assistantMessage = await this.chatWithOpenAIChatGPT();

    // Reply Message
    await this.userChatClient.update();
    await this.context.reply(assistantMessage);
  };

  chatWithOpenAIChatGPT = async () => {
    // Get History
    const message = await this.userChatClient.selectMessages()
    const chat = await this.openaiClient.chat(message);

    if (chat.error) {
      return String(JSON.stringify(chat.error, undefined, " "));
    }

    if (chat.choices) {
      const assistantMessage = chat.choices[0].message.content;
      await this.userChatClient.insertAssistantMessage(assistantMessage);
      return assistantMessage;
    }

    return "Something Error.";
  };
}

export default async (context: Context, _next: NextFunction) => {
  return await (new Handler(context)).handleRequest();
};
