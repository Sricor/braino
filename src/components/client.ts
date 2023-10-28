import type { Message } from "@components/mongo.ts";
import type {
  ChatClientSchema,
  OpenAIClientSchema,
} from "@components/mongo.ts";
import { Database } from "@components/mongo.ts";
import { OpenAI } from "@components/openai.ts";
import { ClientError } from "@components/errors.ts";

// User Chat Client
export class ConversationClient {
  readonly #database = Database.instance().ChatClientDatabase;
  readonly #schema: Promise<ChatClientSchema>;

  constructor(private readonly identifier: number) {
    this.#schema = this.#getSchema();
  }

  get schema() {
    return this.#schema;
  }

  #getSchema = async () => {
    let data = await this.#database.select(this.identifier);
    if (!data) {
      data = { userid: this.identifier };
      await this.#database.insert(data);
    }
    return data;
  };

  update = async (item?: ChatClientSchema) => {
    return await this.#database.update({
      ...await this.#schema,
      ...item,
      ...{ userid: this.identifier },
    });
  };

  selectPrompt = async () => {
    let prompts = (await this.#schema).prompts;
    if (typeof prompts === "undefined") {
      prompts = [];
      await this.update({ userid: this.identifier, prompts: prompts });
    }
    return prompts;
  };

  selectMessages = async () => {
    let messages = (await this.#schema).messages;
    if (typeof messages === "undefined") {
      messages = [];
      await this.update({ userid: this.identifier, messages: messages });
    }
    return messages;
  };

  insertPrompt = async (...items: string[]) => {
    const prompt = await this.selectPrompt();
    return prompt.push(...items);
  };

  insertMessages = async (...items: Message[]) => {
    const messages = await this.selectMessages();
    return messages.push(...items);
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

  clearPrompt = async () => {
    const prompt = await this.selectPrompt();
    if (prompt && prompt.length > 0) prompt.length = 0;
  };

  clearMessages = async () => {
    const messages = await this.selectMessages();
    if (messages && messages.length > 0) messages.length = 0;
  };
}

// User OpenAI Client
export class OpenAIClient {
  readonly #database = Database.instance().OpenAIClientDatabase;
  readonly #schema: Promise<OpenAIClientSchema>;

  constructor(private readonly identifier: number) {
    this.#schema = this.#getSchema();
  }

  get schema() {
    return this.#schema;
  }

  #getSchema = async () => {
    let data = await this.#database.select(this.identifier);
    if (!data) {
      data = { userid: this.identifier };
      await this.#database.insert(data);
    }
    return data;
  };

  update = async (item?: OpenAIClientSchema) => {
    return await this.#database.update({
      ...await this.#schema,
      ...item,
      ...{ userid: this.identifier },
    });
  };

  #instanOpenAI = async () => {
    const config = await this.#schema;
    if (!config?.token) {
      throw new ClientError("You haven't provided OpenAI token.");
    }

    const openai = new OpenAI(config.token);
    config.api ? openai.api = config.api : undefined;

    return openai;
  };

  chat = async (messages: Message[]) => {
    if (messages.length === 0) throw new ClientError("Chat messages is empty.");
    const openai = await this.#instanOpenAI();
    const config = (await this.#schema).chat;
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
