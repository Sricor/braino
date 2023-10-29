import {
  ClientDatabase,
  type ConversationClientSchema,
  Database as DB,
  type Message,
  type OpenAIClientSchema,
  type Prompt,
  Schema,
  type TelegraphClientSchema,
} from "@components/mongo.ts";

import { OpenAI } from "@components/openai.ts";
import { Telegraph } from "@components/telegraph.ts";
import { ClientError } from "@components/errors.ts";

abstract class ClientBase<T extends Schema> {
  protected readonly data: Promise<T>;

  constructor(
    protected identifier: number,
    protected readonly database: ClientDatabase<T>,
  ) {
    this.data = this.selectSchemaData();
  }

  protected selectSchemaData = async () => {
    let data = await this.database.select(this.identifier);
    if (!data) {
      data = { userid: this.identifier } as T;
      await this.database.insert(data);
    }
    return data;
  };

  update = async (item?: T) => {
    return item
      ? await this.database.update({
        ...item,
        ...{ userid: this.identifier },
      })
      : await this.database.update({
        ...await this.data,
        ...{ userid: this.identifier },
      });
  };
}

export class ConversationClient extends ClientBase<ConversationClientSchema> {
  readonly prompts: Promise<Prompt[]>;
  readonly messages: Promise<Message[]>;

  constructor(identifier: number) {
    super(identifier, DB.instance().ConversationClientDatabase);
    this.prompts = this.#selectPrompts();
    this.messages = this.#selectMessages();
  }

  #selectPrompts = async () => {
    const data = await this.data;
    if (typeof data.prompts === "undefined") {
      data.prompts = [];
      await this.update();
    }
    return data.prompts;
  };

  #selectMessages = async () => {
    const data = await this.data;
    if (typeof data.messages === "undefined") {
      data.messages = [];
      await this.update();
    }
    return data.messages;
  };

  insertPrompt = async (...items: Prompt[]) => {
    (await this.prompts).push(...items);
  };

  insertMessages = async (...items: Message[]) => {
    (await this.messages).push(...items);
  };

  clearPrompt = async () => {
    (await this.prompts).length = 0;
  };

  clearMessages = async () => {
    (await this.messages).length = 0;
  };

  chat = async (
    content: string,
    model: (messages: Message[]) => Message | Promise<Message>,
    prompt = true,
  ) => {
    const prompts = await this.prompts;
    const messages = await this.messages;

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
export class OpenAIClient extends ClientBase<OpenAIClientSchema> {
  constructor(identifier: number) {
    super(identifier, DB.instance().OpenAIClientDatabase);
  }

  get config() {
    return this.data;
  }

  #instanOpenAI = async () => {
    const data = await this.data;
    if (!data?.token) {
      throw new ClientError("You haven't provided OpenAI token.");
    }

    const openai = new OpenAI(data.token);
    data.api ? openai.api = data.api : undefined;

    return openai;
  };

  chatGPT = async (messages: Message[]) => {
    const openai = await this.#instanOpenAI();
    const config = (await this.data).chat;
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

export class TelegraphClient extends ClientBase<TelegraphClientSchema> {
  protected readonly telegraph: Promise<Telegraph>;

  constructor(identifier: number) {
    super(identifier, DB.instance().TelegraphClientDatabase);
    this.telegraph = this.#instanTelegraph();
  }

  #instanTelegraph = async () => {
    const data = await this.data;
    const telegraph = new Telegraph(data.access_token);
    if (!data.access_token) {
      data.access_token = await telegraph.token;
      await this.update();
    }
    return telegraph;
  };

  edit = async (content: string | string[]) => {
    const data = await this.data;
    const telegraph = await this.telegraph;
    const titile = this.identifier.toString();
    if (data.page_path) {
      const { result } = await telegraph.editPage({
        title: titile,
        content: content,
        path: data.page_path,
      });
      return result.url;

    } else {
      const { result } = await telegraph.createPage({
        title: titile,
        content: content,
      });
      
      data.page_path = result.path;
      await this.update();
      return result.url;

    }
  };
}
