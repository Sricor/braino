import type { Context } from "@components/grammy.ts";
import { Database } from "@components/mongo.ts";
import { OpenAI } from "@components/openai.ts";

export default abstract class Base {
  protected readonly identity: number;
  protected readonly database = Database.instance();

  constructor(protected readonly context: Context) {
    this.identity = this.#getIndentity();
  }

  #getIndentity = () => {
    return this.context.from?.id
      ? this.context.from.id
      : this.throwError("Access denied.");
  };

  protected instanceOpenAI = async () => {
    const config = await this.database.OpenAIConfig.select(this.identity);
    if (!config?.token) {
      return;
    }
    const openai = new OpenAI(config.token);
    config.api ? openai.api = config.api : undefined;

    return openai;
  };

  protected textMessageParams = () => {
    return this.context.match ? this.context.match.toString().split(" ") : [];
  };

  protected editCallbackQueryText = async <S extends string>(content: S) => {
    return this.context.callbackQuery?.message?.text !== content
      ? await this.context.editMessageText(content)
      : undefined;
  };

  protected throwError = (message?: string) => {
    throw Error(message);
  };
}
