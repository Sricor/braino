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

  readonly ConversationClientDatabase = new ConversationClientDatabase(
    this.#database,
    "chat-messages",
  );
  readonly OpenAIClientDatabase = new OpenAIClientDatabase(
    this.#database,
    "openai-config",
  );
  readonly TelegraphClientDatabase = new TelegraphClientDatabase(
    this.#database,
    "telegraph",
  );
}

abstract class ClientDatabase<T extends Schema> {
  protected readonly collection: Collection<T>;
  constructor(db: MonDB, name: string) {
    this.collection = db.collection<T>(name);
  }
  insert = async (data: T) => await this.collection.insertOne(data);
}

class ConversationClientDatabase
  extends ClientDatabase<ConversationClientSchema> {
  select = async (id: number) => await this.collection.findOne({ userid: id });
  update = async (data: ConversationClientSchema) =>
    await this.collection.updateOne({ userid: data.userid }, { $set: data });
}

class OpenAIClientDatabase extends ClientDatabase<OpenAIClientSchema> {
  select = async (id: number) => await this.collection.findOne({ userid: id });
  update = async (data: ConversationClientSchema) =>
    await this.collection.updateOne({ userid: data.userid }, { $set: data });
}

class TelegraphClientDatabase extends ClientDatabase<TelegraphClientSchema> {
  select = async (id: number) => await this.collection.findOne({ userid: id });
  update = async (data: TelegraphClientSchema) =>
    await this.collection.updateOne({ userid: data.userid }, { $set: data });
}

interface Schema {
  readonly userid: number;
}

export interface Message {
  readonly role: "system" | "user" | "assistant";
  readonly content: string;
}

export type Prompt = string;

export interface ConversationClientSchema extends Schema {
  readonly prompts?: Prompt[];
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

export interface TelegraphClientSchema extends Schema {
  readonly access_token?: string;
}
