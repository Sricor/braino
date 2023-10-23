import type { Context, NextFunction } from "@components/grammy.ts";
import { ChatClient, Core } from "./core.ts";

class Handler extends Core {
  readonly #chat = new ChatClient(this.identity);

  handleRequest = async () => {
    const params = this.context.match?.toString();
    if (params) {
      return await this.handleParams(params);
    } else {
      return await this.handleNoParams();
    }
  };

  handleNoParams = async () => {
    const prompt = await this.#chat.selectPrompt();
    if (prompt.length === 0) return this.context.reply("Prompt is empty.");

    let result = `Chat Prompt: \n`;
    prompt.forEach((element, index) => {
      const formattedValue = `\n Prompt${index + 1}: ${element} \n`;
      result += formattedValue;
    });
    return await this.context.reply(result);
  };

  handleParams = async (params: string) => {
    await this.#chat.insertPrompt(params) ===
        (await this.#chat.schema).prompts?.length
      ? await this.context.reply("All Set.")
      : await this.context.reply("Error.");
    await this.#chat.update();
    return;
  };
}

export default async (context: Context, _next: NextFunction) => {
  return await (new Handler(context)).handleRequest();
};
