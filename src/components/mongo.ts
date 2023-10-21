import { Collection, Database as MonDB, MongoClient } from "mongo";

export class Database {
  static #client = new MongoClient();
  static #instance: Database;

  static instance = () => {
    if (!this.#instance) {
      this.#instance = new Database();
    }
    return this.#instance;
  };
  static connect = async (url: string) => await this.#client.connect(url);

  private constructor() {}
  readonly #database = Database.#client.database("content");

  readonly ChatMessages = new ChatMessages(this.#database, "chat-messages");
  readonly OpenAIConfig = new OpenAIConfig(this.#database, "openai-config");
}

class ChatMessages {
  readonly #collection: Collection<ChatMessagesSchema>;
  constructor(db: MonDB, name: string) {
    this.#collection = db.collection<ChatMessagesSchema>(name);
  }

  select = async (id: number) => await this.#collection.findOne({ userid: id });
  insert = async (data: ChatMessagesSchema) =>
    await this.#collection.insertOne(data);
  update = async (data: ChatMessagesSchema) =>
    await this.#collection.updateOne({ userid: data.userid }, { $set: data });
}

class OpenAIConfig {
  readonly #collection: Collection<OpenAIConfigSchema>;
  constructor(db: MonDB, name: string) {
    this.#collection = db.collection<OpenAIConfigSchema>(name);
  }

  select = async (id: number) => await this.#collection.findOne({ userid: id });
  insert = async (data: OpenAIConfigSchema) =>
    await this.#collection.insertOne(data);
  update = async (data: OpenAIConfigSchema) =>
    await this.#collection.updateOne({ userid: data.userid }, { $set: data });
}

interface Schema {
  userid: number;
}

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatMessagesSchema extends Schema {
  messages?: Message[];
}

export interface OpenAIConfigSchema extends Schema {
  api?: string;
  token?: string;
  chat?: {
    model?: string;
    temperature?: number;
    top_p?: number;
    presence_penalty?: number;
    frequency_penalty?: number;
  };
}
