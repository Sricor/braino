export class OpenAI {
  api = "https://api.openai.com";

  constructor(readonly token: string) {}

  #request = async (
    method: string,
    path: string,
    headers?: HeadersInit,
    body?: BodyInit,
  ) => {
    return await fetch(`${this.api}${path}`, {
      method: method,
      headers: { ...headers, ...this.#defaultHeader() },
      body: body,
    });
  };

  #defaultHeader() {
    return {
      ...{ "Authorization": `Bearer ${this.token}` },
      ...{ "Content-Type": "application/json" },
    };
  }

  chat = {
    completions: {
      create: async (params: ChatCompletionsParams) => {
        // console.log(params);
        const response = await this.#request(
          "POST",
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

export interface Message {
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
