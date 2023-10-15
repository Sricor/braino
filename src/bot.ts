import { Bot, BotConfig, Context } from "@components/grammy.ts";

import Mid from "@middleware/middleware.ts";
import Controller, { Menu } from "@controller/controller.ts";

let client: Deno.HttpClient;

const proxy = Deno.env.get("HTTP_PROXY");

if (proxy) {
  client = Deno.createHttpClient({
    proxy: { url: proxy },
  });
}

const config: BotConfig<Context> = {
  client: {
    baseFetchConfig: {
      // deno-lint-ignore ban-ts-comment
      // @ts-ignore
      client,
    },
  },
};

export const bot = new Bot(String(Deno.env.get("BOT_TOKEN")), config);

// Middleware
bot.use(Mid.Logger);

// Menu
bot.use(Menu.SettingMenu);

// Command
bot.command("start", Controller.Start);
bot.command("clear", Controller.Clear);
bot.command("settings", Controller.Setting);
bot.command("userinfo", Controller.UserInfo);
bot.command("base64decode", Controller.Base64Decode);
bot.command("base64encode", Controller.Base64Encode);
bot.command("sha256", Controller.SHA256);
bot.command("hmacsha256", Controller.HMACSHA256);

bot.command("editopenaitoken", Controller.EditOpenAIToken);
bot.command("editopenaibaseurl", Controller.EditOpenAIBaseUrl);

await bot.api.setMyCommands([
  { command: "start", description: "Start the bot." },
  { command: "clear", description: "Clear history chat." },
  { command: "settings", description: "Open settings." },
  { command: "userinfo", description: "User information." },
  { command: "base64decode", description: "base64Decode <content>." },
  { command: "base64encode", description: "base64Encode <content>." },
  { command: "sha256", description: "SHA256 <message>." },
  { command: "hmacsha256", description: "HMAC-SHA256 <key> <message>." },
  { command: "editopenaitoken", description: "Edit OpenAI Token <Token>." },
  { command: "editopenaibaseurl", description: "Edit OpenAI Base URL <URL>." },
]);

// Chat with bot
bot.on("message", Controller.Chat);
