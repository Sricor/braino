import { Menu } from "@components/grammy.ts";

import ViewOpenAIToken from "@controller/menu/openai/view-token.ts";
import ViewOpenAIBaseURL from "@controller/menu/openai/view-base-url.ts";

const main = new Menu("setting-menu")
  .text("Welcome", (ctx) => ctx.reply("Hi!"))
  .submenu("OpenAI", "setting-menu-openai");

const settings = new Menu("setting-menu-openai")
  .text("Token", ViewOpenAIToken)
  .text("Base URL", ViewOpenAIBaseURL)
  .back("Go Back");

main.register(settings);

export default main;