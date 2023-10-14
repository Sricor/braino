import { MongoClient, ObjectId } from "mongo";

const databaseURL = Deno.env.get("DATABASE");
if (!databaseURL) throw new Error("NO DATABASE");

const client = new MongoClient();
await client.connect(databaseURL);
const database = client.database("content");

abstract class Base {
  constructor(protected readonly identity: string) {}
}

class OpenAI extends Base {
  readonly #db = database.collection<OpenAISchema>("openai");

  select = async () => {
    return await this.#db.findOne({ userid: this.identity }) || {};
  };

  update = async (value: OpenAISchema) => {
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
  _id: ObjectId;
  userid: string;
  username: string;
  password: string;
}

interface OpenAISchema {
  _id?: ObjectId;
  userid?: string;
  token?: string;
  baseurl?: string;
}
