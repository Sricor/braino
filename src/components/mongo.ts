import { Collection, Database as MonDB, MongoClient } from "mongo";

export class Database {
  static readonly #client = new MongoClient();
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

  readonly ChatClientDatabase = new ChatClientDatabase(
    this.#database,
    "chat-messages",
  );
  readonly OpenAIClientDatabase = new OpenAIClientDatabase(
    this.#database,
    "openai-config",
  );
}

abstract class ClientDatabase<T extends Schema> {
  protected readonly collection: Collection<T>;
  constructor(db: MonDB, name: string) {
    this.collection = db.collection<T>(name);
  }
  insert = async (data: T) => await this.collection.insertOne(data);
}

class ChatClientDatabase extends ClientDatabase<ChatClientSchema> {
  select = async (id: number) => await this.collection.findOne({ userid: id });
  update = async (data: ChatClientSchema) =>
    await this.collection.updateOne({ userid: data.userid }, { $set: data });
}

class OpenAIClientDatabase extends ClientDatabase<OpenAIClientSchema> {
  select = async (id: number) => await this.collection.findOne({ userid: id });
  update = async (data: ChatClientSchema) =>
    await this.collection.updateOne({ userid: data.userid }, { $set: data });
}

interface Schema {
  readonly userid: number;
}

export interface Message {
  readonly role: "system" | "user" | "assistant";
  readonly content: string;
}

export interface ChatClientSchema extends Schema {
  readonly prompts?: string[];
  readonly messages?: Message[];
}

export interface OpenAIClientSchema extends Schema {
  readonly api?: string;
  readonly token?: string;
  readonly chat?: {
    readonly model?: string;
    readonly temperature?: number;
    readonly top_p?: number;
    readonly presence_penalty?: number;
    readonly frequency_penalty?: number;
  };
}
