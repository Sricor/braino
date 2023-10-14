import type { Context } from "@components/grammy.ts";
import { UserData } from "@components/database.ts";
import { OpenAI } from "@components/openai.ts";

export default abstract class Base {
  protected readonly identity: number | undefined;
  protected readonly textMessage: string | undefined;
  protected readonly textParams: string[];

  constructor(protected readonly context: Context) {
    this.identity = this.context.from?.id;
    this.textMessage = this.context.message?.text;
    this.textParams = String(this.context.match).split(" ");
  }

  protected instantiateDatabase = () => {
    if (this.identity) return new UserData(String(this.identity));
  };

  protected instantiateOpenAI = async () => {
    const database = this.instantiateDatabase();
    if (database) {
      const config = await database.openai.config.get();
      if (config?.token) {
        const openai = new OpenAI(config.token);
        config.baseURL ? openai.baseURL = config.baseURL : undefined;
        return openai;
      }
    }
  };

  protected editCallbackQueryText = async <S extends string>(content: S) => {
    if (this.context.callbackQuery?.message?.text !== content) {
      await this.context.editMessageText(content);
    }
  };
}
