import type { Context, NextFunction } from "@components/grammy.ts";
import { ChatClient, Core, OpenAIClient } from "./core.ts";
import { ClientError } from "@components/errors.ts";

class Handler extends Core {
  readonly #chat = new ChatClient(this.identity);
  readonly #openai = new OpenAIClient(this.identity);

  handleRequest = async () => {
    // Chat with Large Language Model
    const assistantMessage = await this.chatWithOpenAIChatGPT();

    // Reply Message
    await this.#chat.update();
    return await this.reply(assistantMessage);
  };

  chatWithOpenAIChatGPT = async () => {
    const content = this.context.message?.text || "Hello";
    const messages = await this.#chat.selectMessages();

    // Add Prompt Messages
    const prompt = await this.#chat.selectPrompt();
    prompt.forEach(async (element) => {
      await this.#chat.insertSystemMessage(element);
    });

    // Add User Messages
    await this.#chat.insertUserMessage(content);
    const response = await this.#openai.chat(messages);

    // Remove Prompt Messages
    messages.splice(messages.length - (prompt.length + 1), prompt.length);

    // Response Messages
    if (response.choices) {
      const assistantMessage = response.choices[0].message.content;
      await this.#chat.insertAssistantMessage(assistantMessage);
      return assistantMessage;
    }

    throw new ClientError(
      JSON.stringify(response.error, undefined, " ") || "Error.",
    );
  };
}

export default async (context: Context, _next: NextFunction) => {
  return await (new Handler(context)).handleRequest();
};
