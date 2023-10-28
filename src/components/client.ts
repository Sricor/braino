import {
  type ConversationClientSchema,
  Database as DB,
  type Message,
  type OpenAIClientSchema,
  type Prompt,
  type TelegraphClientSchema,
} from "@components/mongo.ts";

import { OpenAI } from "@components/openai.ts";
import { ClientError } from "@components/errors.ts";

export class ConversationClient {
  readonly #database = DB.instance().ConversationClientDatabase;
  readonly #schema: Promise<ConversationClientSchema>;
  readonly #prompts: Promise<Prompt[]>;
  readonly #messages: Promise<Message[]>;

  constructor(private readonly identifier: number) {
    this.#schema = this.#selectSchema();
    this.#prompts = this.#selectPrompts();
    this.#messages = this.#selectMessages();
  }

  get prompts() {
    return this.#prompts;
  }

  get messages() {
    return this.#messages;
  }

  #selectSchema = async () => {
    let data = await this.#database.select(this.identifier);
    if (!data) {
      data = { userid: this.identifier };
      await this.#database.insert(data);
    }
    return data;
  };

  #selectPrompts = async () => {
    let prompts = (await this.#schema).prompts;
    if (typeof prompts === "undefined") {
      prompts = [];
      await this.update({ userid: this.identifier, prompts: prompts });
    }
    return prompts;
  };

  #selectMessages = async () => {
    let messages = (await this.#schema).messages;
    if (typeof messages === "undefined") {
      messages = [];
      await this.update({ userid: this.identifier, messages: messages });
    }
    return messages;
  };

  update = async (item?: ConversationClientSchema) => {
    return await this.#database.update({
      ...{ messages: await this.#messages },
      ...{ prompts: await this.#prompts },
      ...item,
      ...{ userid: this.identifier },
    });
  };

  insertPrompt = async (...items: Prompt[]) => {
    (await this.#prompts).push(...items);
  };

  insertMessages = async (...items: Message[]) => {
    (await this.#messages).push(...items);
  };

  clearPrompt = async () => {
    (await this.#prompts).length = 0;
  };

  clearMessages = async () => {
    (await this.#messages).length = 0;
  };

  chat = async (
    content: string,
    model: (messages: Message[]) => Message | Promise<Message>,
    prompt = true,
  ) => {
    const prompts = await this.#prompts;
    const messages = await this.#messages;

    // Add Prompts Messages
    if (prompt) {
      prompts.forEach((element) => {
        messages.push({ role: "system", content: element });
      });
    }

    // Add User Messages
    messages.push({ role: "user", content: content });

    // Create Conversation with Messages
    const reply = await model(messages);

    // Remove Prompts Messages
    if (prompt) {
      messages.splice(messages.length - (prompts.length + 1), prompts.length);
    }

    // Add Ass Messages
    messages.push(reply);

    return reply;
  };
}

// User OpenAI Client
export class OpenAIClient {
  readonly #database = DB.instance().OpenAIClientDatabase;
  readonly #schema: Promise<OpenAIClientSchema>;

  constructor(private readonly identifier: number) {
    this.#schema = this.#getSchema();
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

  chatGPT = async (messages: Message[]) => {
    const openai = await this.#instanOpenAI();
    const config = (await this.#schema).chat;
    const response = await openai.chat.completions.create({
      model: config?.model || "gpt-3.5-turbo",
      messages: messages,
      temperature: config?.temperature,
      top_p: config?.top_p,
      presence_penalty: config?.presence_penalty,
      frequency_penalty: config?.frequency_penalty,
    });

    // Response Messages
    if (response.choices) {
      const assistantMessage = response.choices[0].message.content;
      return { content: assistantMessage, role: "assistant" } as Message;
    }

    throw new ClientError(JSON.stringify(response, undefined, " "));
  };
}

export class TelegraphClient {
  readonly #database = DB.instance().TelegraphClientDatabase;
  readonly #schema: Promise<TelegraphClientSchema>;

  constructor(private readonly identifier: number) {
    this.#schema = this.#selectSchema();
  }

  #selectSchema = async () => {
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
}
