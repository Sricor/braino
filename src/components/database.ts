const kv = await Deno.openKv();

class KV {
  static get = async <T>(key: string[]): Promise<T | null> => {
    return (await kv.get(key)).value as T | null;
  };

  static set = async <T>(
    key: string[],
    value: T,
  ): Promise<{ ok: boolean; versionstamp: string }> => {
    return await kv.set(key, value);
  };

  static isExist = async (key: string[]) => {
    // when versionstamp is null, is not Exist
    return (await kv.atomic().check({ key, versionstamp: null })
        .commit()).ok
      ? false
      : true;
  };
}

class OpenAI {
  config: OpenAIConfig;
  chat: OpenAIChat;

  constructor(database: UserData) {
    this.config = new OpenAIConfig(database);
    this.chat = new OpenAIChat(database);
  }
}

type Chat = string[];

class OpenAIChat {
  readonly #key: string[];

  constructor(private database: UserData) {
    this.#key = ["openai", "chat", this.database.identity];
  }

  get = async () => await KV.get<Chat>(this.#key);
  set = async (value: Chat) => await KV.set(this.#key, value);
}

interface Config {
  baseURL?: string;
  token?: string;
}

class OpenAIConfig {
  readonly #key: string[];

  constructor(private database: UserData) {
    this.#key = ["openai", "config", this.database.identity];
  }

  get = async () => {
    return await KV.get<Config>(this.#key);
  };
  set = async (value: Config) => await KV.set(this.#key, value);
}

export class UserData {
  readonly identity: string;
  readonly openai: OpenAI;

  constructor(identity: string) {
    this.identity = String(identity);
    this.openai = new OpenAI(this);
  }
}
