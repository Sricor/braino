import type { Context } from "@components/grammy.ts";
import { Database } from "@components/mongo.ts";
import { OpenAI } from "@components/openai.ts";

export default abstract class Base {
  protected readonly identity: string;
  protected readonly database: Database;

  constructor(protected readonly context: Context) {
    this.identity = this.#getIndentity();
    this.database = this.#instanceDatabase();
  }

  #getIndentity = () => {
    return this.context.from?.id
      ? this.context.from.id.toString()
      : this.throwError("Access denied.");
  };

  #instanceDatabase = () => {
    return this.identity
      ? new Database(this.identity)
      : this.throwError("Access denied.");
  };

  protected instanceOpenAI = async () => {
    const config = await this.database.openai.select();
    if (config?.token) {
      const openai = new OpenAI(config.token);
      openai.baseURL = config.baseurl ? config.baseurl : openai.baseURL;
      return openai;
    }
    return this.throwError("OpenAI token is empty.");
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
