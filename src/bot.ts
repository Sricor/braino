import { Bot, BotConfig as Config, Context as CT } from "@components/grammy.ts";

import Context from "@context";
import Controller from "@controller";

export class Braino {
  #core: Bot;

  constructor(token: string, config?: Config<CT>) {
    this.#core = new Bot(token, config);
    this.setMyCommands();
    this.context();
    this.command();
    this.chat();
  }

  context = () => {
    this.#core.use(Context.Logger);
  };

  command = () => {
    this.#core.command("me", Controller.Me);
    this.#core.command("start", Controller.Start);
    this.#core.command("clear", Controller.Clear);
    this.#core.command("prompt", Controller.Prompt);
    this.#core.command("openai", Controller.OpenAI);
    this.#core.command("base64decode", Controller.Base64Decode);
    this.#core.command("base64encode", Controller.Base64Encode);
    this.#core.command("sha256", Controller.SHA256);
    this.#core.command("hmacsha256", Controller.HMACSHA256);
  };

  setMyCommands = async () => {
    await this.#core.api.setMyCommands([
      { command: "me", description: "Information about me." },
      { command: "start", description: "Start the bot." },
      { command: "clear", description: "Clear history chat." },
      { command: "prompt", description: "add/view prompt" },
      { command: "openai", description: "Edit OpenAI" },
      { command: "base64decode", description: "base64Decode <content>." },
      { command: "base64encode", description: "base64Encode <content>." },
      { command: "sha256", description: "SHA256 <message>." },
      { command: "hmacsha256", description: "HMAC-SHA256 <key> <message>." },
    ]);
  };

  chat = () => {
    this.#core.on("message", Controller.Chat);
  };

  start = async () => {
    return await this.#core.start();
  };
}
