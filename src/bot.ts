import { BotConfig, TelegramBot } from "@components/grammy.ts";
import * as Context from "./context.ts";
import * as Model from "@controller/model.ts";
import * as Format from "@controller/format.ts";
import * as Crypto from "@controller/crypto.ts";
import * as Conversation from "@controller/conversation.ts";

export class Braino {
  #bot: TelegramBot;

  constructor(token: string, config?: BotConfig) {
    this.#bot = new TelegramBot(token, config);
    this.setMyCommands();
    this.context();
    this.command();
    this.conversation();
  }

  context = () => {
    this.#bot.use(new Context.Logger(), new Context.Initial());
  };

  command = () => {
    this.#bot.command("start", new Format.Start());
    this.#bot.command("info", new Format.UserInfomation());
    this.#bot.command("messages", new Conversation.Messages());
    this.#bot.command("clear", new Conversation.Clear());
    this.#bot.command("openai", new Model.OpenAI());
    this.#bot.command("prompt", new Conversation.Prompt());
    this.#bot.command("base64encode", new Format.Base64Encode());
    this.#bot.command("base64decode", new Format.Base64Decode());
    this.#bot.command("sha256", new Crypto.SHA256());
    this.#bot.command("hmacsha256", new Crypto.HMACSHA256());
  };

  conversation = () => {
    this.#bot.on("message", new Conversation.Chat());
  };

  setMyCommands = async () => {
    await this.#bot.api.setMyCommands([
      { command: "info", description: "Information about me." },
      { command: "clear", description: "Clear history chat." },
      { command: "prompt", description: "add/view prompt" },
      {
        command: "messages",
        description: "view messages history on telegraph",
      },
      { command: "openai", description: "Edit OpenAI" },
      { command: "base64decode", description: "base64Decode <content>." },
      { command: "base64encode", description: "base64Encode <content>." },
      { command: "sha256", description: "SHA256 <message>." },
      { command: "hmacsha256", description: "HMAC-SHA256 <key> <message>." },
    ]);
  };

  start = async () => {
    return await this.#bot.start();
  };
}
