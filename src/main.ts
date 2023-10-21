import { Database } from "@components/mongo.ts";
import { Braino } from "./bot.ts";

const databaseURL = Deno.env.get("DATABASE");
const botToken = Deno.env.get("BOT_TOKEN");
const proxy = Deno.env.get("HTTP_PROXY");

if (!databaseURL || !botToken) throw new Error("NO DATABASE");

const client = proxy
  ? Deno.createHttpClient({
    proxy: { url: proxy },
  })
  : undefined;

await Database.connect(databaseURL);

export const braino = new Braino(botToken, {
  // deno-lint-ignore ban-ts-comment
  // @ts-ignore
  client: { baseFetchConfig: { client } },
});
