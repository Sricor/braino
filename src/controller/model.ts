import type { Context, Next } from "@components/grammy.ts";
import { MiddlewareObject } from "@components/grammy.ts";
import type { OpenAIClientSchema } from "@components/mongo.ts";
import { OpenAIClient } from "@components/client.ts";

type ChatFields = OpenAIClientSchema["chat"];

export class OpenAI extends MiddlewareObject {
  middleware = () => async (context: Context, _next: Next) => {
    const openai = new OpenAIClient(context.user.identifier);
    const parameters = context.conversation.splitTextMessage();
    const content = context.match?.toString() || "";

    const result = parameters.length === 1
      ? await OpenAI.handleNoParams(openai)
      : await this.handleParams(content, openai);

    await context.conversation.reply(result);
  };

  static handleNoParams = async (client: OpenAIClient) => {
    const config = await client.config;
    if (config) {
      return JSON.stringify(config, undefined, " ");
    } else {
      return "NULL";
    }
  };

  handleParams = async (params: string, client: OpenAIClient) => {
    let paramsJSON: OpenAIClientSchema;
    try {
      paramsJSON = JSON.parse(params);
    } catch {
      return "JSON Error.";
    }

    const { api, token, chat } = paramsJSON;
    const chatFields = await this.mergeChatFields(chat, client);

    const updatedConfig: OpenAIClientSchema = {
      userid: 0,
      api,
      token,
      chat: chatFields,
    };

    await client.update(updatedConfig);
    return "All Set.";
  };

  mergeChatFields = async (
    targetChat: ChatFields | undefined,
    client: OpenAIClient,
  ): Promise<ChatFields> => {
    const config = (await client.config).chat;
    return {
      model: typeof targetChat?.model === "string"
        ? targetChat.model
        : config?.model,
      temperature: typeof targetChat?.temperature === "number"
        ? targetChat.temperature
        : config?.temperature,
      top_p: typeof targetChat?.top_p === "number"
        ? targetChat.top_p
        : config?.top_p,
      presence_penalty: typeof targetChat?.presence_penalty === "number"
        ? targetChat.presence_penalty
        : config?.presence_penalty,
      frequency_penalty: typeof targetChat?.frequency_penalty === "number"
        ? targetChat.frequency_penalty
        : config?.frequency_penalty,
    };
  };
}
