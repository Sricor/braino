import type { Context, NextFunction } from "@components/grammy.ts";
import { ChatClient, Core } from "./core.ts";

class Handler extends Core {
  chatClient = new ChatClient(this.identity);

  handleRequest = async () => {
    const params = this.textMessageParams();
    switch (params[0]) {
      case "prompt":
        return await this.clearPrompt();
      default:
        return await this.clearMessages();
    }
  };

  clearPrompt = async () => {
    const prompt = await this.chatClient.selectPrompt();
    if (prompt.length === 0) {
      return this.context.reply("Prompt is empty.");
    }

    await this.chatClient.clearPrompt();
    const update = await this.chatClient.update();
    if (update) {
      if (update.modifiedCount === 1) {
        return this.context.reply("Clear prompt success.");
      }
    }
    return this.context.reply("Error.");
  };

  clearMessages = async () => {
    const messages = await this.chatClient.selectMessages();
    if (messages.length === 0) {
      return this.context.reply("History is empty.");
    }

    await this.chatClient.clearMessages();
    const update = await this.chatClient.update();
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
