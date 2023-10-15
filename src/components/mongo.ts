import { MongoClient } from "mongo";
import type { ChatCompletionsParams } from "./openai.ts";
const databaseURL = Deno.env.get("DATABASE");
if (!databaseURL) throw new Error("NO DATABASE");

const client = new MongoClient();
await client.connect(databaseURL);
const database = client.database("content");

abstract class Base {
  constructor(protected readonly identity: string) {}
}

class OpenAIChat extends Base {
  readonly #db = database.collection<OpenAIChatSchema>("openai-chat");

  insert = async (value: OpenAIChatSchema) => {
    value.userid = this.identity;
    return await this.#db.insertOne(value);
  };

  select = async () => {
    return await this.#db.findOne({ userid: this.identity });
  };

  update = async (value: OpenAIChatSchema) => {
    if (!await this.select()) this.insert({});
    return await this.#db.updateOne(
      { userid: this.identity },
      { $set: value },
    );
  };
}

class OpenAI extends Base {
  readonly #db = database.collection<OpenAISchema>("openai");
  readonly chat = new OpenAIChat(this.identity);

  insert = async (value: OpenAISchema) => {
    value.userid = this.identity;
    return await this.#db.insertOne(value);
  };

  select = async () => {
    return await this.#db.findOne({ userid: this.identity });
  };

  update = async (value: OpenAISchema) => {
    if (!await this.select()) this.insert({});
    return await this.#db.updateOne(
      { userid: this.identity },
      { $set: value },
    );
  };
}

class Users extends Base {
  readonly #db = database.collection<UserSchema>("users");

  selectByUserIdentity = async () => {
    return await this.#db.findOne({ userid: this.identity });
  };
}

export class Database {
  readonly users: Users;
  readonly openai: OpenAI;

  constructor(identity: string) {
    this.users = new Users(identity);
    this.openai = new OpenAI(identity);
  }
}

interface UserSchema {
  userid: string;
  username: string;
  password: string;
}

interface OpenAISchema {
  userid?: string;
  token?: string;
  baseurl?: string;
}

interface OpenAIChatSchema {
  userid?: string;
  messages?: ChatCompletionsParams["messages"];
}
