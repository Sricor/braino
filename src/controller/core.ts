import type { Context } from "@components/grammy.ts";
import type {
  ChatClientSchema,
  ChatMessage,
  OpenAIClientSchema,
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
  readonly #config: Promise<ChatClientSchema>;

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

  update = async (item?: ChatClientSchema) => {
    return await this.#database.update({
      ...await this.#config,
      ...item,
      ...{ userid: this.identity },
    });
  };

  selectPrompt = async () => {
    let prompt = (await this.#config).prompt;
    if (typeof prompt === "undefined") {
      prompt = [];
      await this.update({ userid: this.identity, prompt: prompt });
    }
    return prompt;
  };

  selectMessages = async () => {
    let messages = (await this.#config).messages;
    if (typeof messages === "undefined") {
      messages = [];
      await this.update({ userid: this.identity, messages: messages });
    }
    return messages;
  };

  insertMessages = async (...items: ChatMessage[]) => {
    const messages = await this.selectMessages();
    return messages?.push(...items);
  };

  insertUserMessage = async (content: string) => {
    return await this.insertMessages({ role: "user", content: content });
  };

  insertAssistantMessage = async (content: string) => {
    return await this.insertMessages({ role: "assistant", content: content });
  };

  insertSystemMessage = async (content: string) => {
    return await this.insertMessages({ role: "system", content: content });
  };

  clearMessages = async () => {
    const messages = await this.selectMessages();
    if (messages && messages.length > 0) messages.length = 0;
  };
}

// User OpenAI Client
export class OpenAIClinet {
  readonly #database = Database.instance().OpenAIConfig;
  readonly #config: Promise<OpenAIClientSchema>;

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

  update = async (item?: OpenAIClientSchema) => {
    return await this.#database.update({
      ...await this.#config,
      ...item,
      ...{ userid: this.identity },
    });
  };

  #instanOpenAI = async () => {
    const config = await this.#config;
    if (!config?.token) throw Error("Get OpenAI Error.");

    const openai = new OpenAI(config.token);
    config.api ? openai.api = config.api : null;

    return openai;
  };

  chat = async (messages: ChatMessage[]) => {
    const openai = await this.#instanOpenAI();
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
