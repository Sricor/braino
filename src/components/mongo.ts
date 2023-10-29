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

export abstract class ClientDatabase<T extends Schema> {
  protected readonly collection: Collection<T>;
  constructor(db: MonDB, name: string) {
    this.collection = db.collection<T>(name);
  }

  insert = async (data: T) => await this.collection.insertOne(data);

  // @ts-ignore: Mongo bug
  select = async (id: number) => await this.collection.findOne({ userid: id });

  update = async (data: T) =>
    // @ts-ignore: Mongo bug
    await this.collection.updateOne({ userid: data.userid }, { $set: data });
}

class ConversationClientDatabase
  extends ClientDatabase<ConversationClientSchema> {}
class OpenAIClientDatabase extends ClientDatabase<OpenAIClientSchema> {}
class TelegraphClientDatabase extends ClientDatabase<TelegraphClientSchema> {}

export interface Schema {
  readonly userid?: number;
}

export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export type Prompt = string;

export interface ConversationClientSchema extends Schema {
  prompts?: Prompt[];
  messages?: Message[];
}

export interface OpenAIClientSchema extends Schema {
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

export interface TelegraphClientSchema extends Schema {
  access_token?: string;
  page_path?: string;
}
