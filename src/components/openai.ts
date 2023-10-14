import { HTTPClient } from "@components/http.ts";

export class OpenAI {
  #token: string;
  #baseURL = "https://api.openai.com";

  protected readonly client: HTTPClient;

  constructor(token: string) {
    this.#token = token;
    this.client = new HTTPClient(this.#baseURL);
  }

  set token(token: string) {
    this.#token = token;
  }

  set baseURL(baseURL: string) {
    this.#baseURL = baseURL;
    this.client.baseURL = this.#baseURL;
  }

  get baseURL() {
    return this.#baseURL;
  }

  #defaultHeader() {
    return {
      ...{ "Authorization": `Bearer ${this.#token}` },
      ...{ "Content-Type": "application/json" },
    };
  }

  chat = {
    completions: {
      create: async (params: ChatCompletionsParams) => {
        const response = await this.client.post(
          "/v1/chat/completions",
          this.#defaultHeader(),
          JSON.stringify(params),
        );
        return await response.json() as ChatCompletions;
      },
    },
  };
}

type Role = "system" | "user" | "assistant" | "function";
type Model = "gpt-3.5-turbo" | "gpt-3.5-turbo-16k" | "gpt-4";

interface Message {
  role: Role;
  content: string;
}

interface Choice {
  index: number;
  message: Message;
  finish_reason: string;
}

interface Usage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

interface Error {
  message: string;
  type: string;
  code: string;
}

export interface ChatCompletionsParams {
  model: string;
  messages: Message[];
  temperature?: number;
  top_p?: number;
  presence_penalty?: number;
  frequency_penalty?: number;
}

export interface ChatCompletions {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Choice[];
  usage: Usage;
  error?: Error;
}
