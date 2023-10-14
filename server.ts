import { bot } from "@bot";

await bot.api.deleteWebhook();
await bot.start();
