import type { Context, NextFunction } from "@components/grammy.ts";
import type { OpenAIConfigSchema } from "@components/mongo.ts";
import { Core, OpenAIClinet } from "./core.ts";

type ChatFields = OpenAIConfigSchema["chat"];

class Handler extends Core {
  openaiClient = new OpenAIClinet(this.identity);

  handleRequest = async () => {
    const params = this.context.match?.toString();

    if (params) {
      await this.handleParams(params);
    } else {
      await this.handleNoParams();
    }
  };

  handleNoParams = async () => {
    const config = await this.openaiClient.config;
    if (config) {
      this.context.reply(
        JSON.stringify(config, undefined, " "),
      );
    } else {
      this.context.reply("NULL");
    }
  };

  handleParams = async (
    params: string,
  ) => {
    let paramsJSON: OpenAIConfigSchema;
    try {
      paramsJSON = JSON.parse(params);
    } catch {
      this.context.reply("JSON Error.");
      return;
    }

    const { api, token, chat } = paramsJSON;
    const chatFields = await this.mergeChatFields(chat);

    const updatedConfig: OpenAIConfigSchema = {
      userid: this.identity,
      api,
      token,
      chat: chatFields,
    };

    await this.openaiClient.update(updatedConfig);
    this.context.reply("All Set.");
  };

  mergeChatFields = async (
    targetChat: ChatFields | undefined,
  ): Promise<ChatFields> => {
    const config = (await this.openaiClient.config).chat;
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

export default async (context: Context, _next: NextFunction): Promise<void> => {
  await (new Handler(context)).handleRequest();
  return;
};
