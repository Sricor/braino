import type { Context } from "@components/grammy.ts";
import { Database } from "@components/mongo.ts";
import { OpenAI } from "@components/openai.ts";

export default abstract class Base {
  protected readonly identity?: string;

  public constructor(protected readonly context: Context) {
    this.identity = this.context.from?.id.toString();
  }

  protected readonly instanceDatabase = () => {
    if (this.identity) return new Database(this.identity);
  };

  protected readonly instanceOpenAI = async () => {
    const database = this.instanceDatabase();
    const config = await database?.openai.select();
    if (config?.token) {
      const openai = new OpenAI(config.token);
      config.baseurl ? openai.baseURL = config.baseurl : undefined;
      return openai;
    }
  };

  protected textMessageParams = () => {
    if (this.context.match) return String(this.context.match).split(" ");
    return [];
  };

  protected editCallbackQueryText = async <S extends string>(content: S) => {
    if (this.context.callbackQuery?.message?.text !== content) {
      await this.context.editMessageText(content);
    }
  };
}
