import type { Context } from "@components/grammy.ts";
import type {
  ChatMessagesSchema,
  Message,
  OpenAIConfigSchema,
} from "@components/mongo.ts";
import { Database } from "@components/mongo.ts";
import { OpenAI } from "@components/openai.ts";

export abstract class Core {
  protected readonly identity: number;

  constructor(protected readonly context: Context) {
    this.identity = this.#getIndentity();
  }

  #getIndentity = () => {
    return this.context.from?.id
      ? this.context.from.id
      : this.throwError("Access denied.");
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

// User Chat Client
export class ChatClient {
  readonly #database = Database.instance().ChatMessages;
  readonly #config: Promise<ChatMessagesSchema>;

  constructor(private readonly identity: number) {
    this.#config = this.#getConfig();
  }

  get config() {
    return this.#config;
  }

  #getConfig = async () => {
    let data = await this.#database.select(this.identity);
    if (!data) {
      data = { userid: this.identity };
      await this.#database.insert(data);
    }
    return data;
  };

  update = async (item?: ChatMessagesSchema) => {
    return await this.#database.update({
      ...await this.#config,
      ...item,
      ...{ userid: this.identity },
    });
  };

  selectMessages = async () => {
    return (await this.#config).messages || [];
  };

  insertMessages = async (...items: Message[]) => {
    return (await this.#config).messages?.push(...items);
  };

  clearMessages = async () => {
    const messages = (await this.#config).messages;
    if (messages && messages.length > 0) messages.length = 0;
  };
}

// User OpenAI Client
export class OpenAIClinet {
  readonly #database = Database.instance().OpenAIConfig;
  readonly #config: Promise<OpenAIConfigSchema>;

  constructor(private readonly identity: number) {
    this.#config = this.#getConfig();
  }

  get config() {
    return this.#config;
  }

  #getConfig = async () => {
    let data = await this.#database.select(this.identity);
    if (!data) {
      data = { userid: this.identity };
      await this.#database.insert(data);
    }
    return data;
  };

  #getOpenAI = async () => {
    const config = await this.#config;
    if (!config?.token) throw Error("Get OpenAI Error.");

    const openai = new OpenAI(config.token);
    config.api ? openai.api = config.api : null;

    return openai;
  };

  update = async (item?: OpenAIConfigSchema) => {
    return await this.#database.update({
      ...await this.#config,
      ...item,
      ...{ userid: this.identity },
    });
  };

  chat = async (messages: Message[]) => {
    const openai = await this.#getOpenAI();
    const config = (await this.#config).chat;
    return await openai.chat.completions.create({
      model: config?.model || "gpt-3.5-turbo",
      messages: messages,
      temperature: config?.temperature,
      top_p: config?.top_p,
      presence_penalty: config?.presence_penalty,
      frequency_penalty: config?.frequency_penalty,
    });
  };
}
