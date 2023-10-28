import { HTTPClient } from "@components/http.ts";

export class OpenAI extends HTTPClient {
  constructor(readonly token: string) {
    super("https://api.openai.com");
  }

  #defaultHeader() {
    return {
      ...{ "Authorization": `Bearer ${this.token}` },
      ...{ "Content-Type": "application/json" },
    };
  }

  chat = {
    completions: {
      create: async (params: ChatCompletionsParams) => {
        const response = await this.post(
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
