import type { Context, NextFunction } from "@components/grammy.ts";
import type { OpenAIConfigSchema } from "@components/mongo.ts";
import Base from "./base.ts";

type ChatFields = OpenAIConfigSchema["chat"];

class Handler extends Base {
  handleRequest = async (): Promise<void> => {
    const params = this.context.match?.toString();
    const existingConfig = await this.database.OpenAIConfig.select(
      this.identity,
    );

    if (params) {
      this.handleParams(params, existingConfig);
    } else {
      this.handleNoParams(existingConfig);
    }
  };

  handleNoParams = (existingConfig: OpenAIConfigSchema | undefined): void => {
    if (existingConfig) {
      this.context.reply(
        JSON.stringify(existingConfig, undefined, " "),
      );
    } else {
      this.context.reply("NULL");
    }
  };

  handleParams = (
    params: string,
    existingConfig: OpenAIConfigSchema | undefined,
  ): void => {
    let paramsJSON: OpenAIConfigSchema;
    try {
      paramsJSON = JSON.parse(params);
    } catch {
      this.context.reply("JSON Error.");
      return;
    }

    const { api, token, chat } = paramsJSON;
    const chatFields = this.mergeChatFields(chat, existingConfig?.chat);

    const updatedConfig: OpenAIConfigSchema = {
      userid: this.identity,
      api,
      token,
      chat: chatFields,
    };

    if (!existingConfig) {
      this.database.OpenAIConfig.insert(updatedConfig);
    } else {
      this.database.OpenAIConfig.update(updatedConfig);
    }

    this.context.reply("All Set.");
  };

  mergeChatFields = (
    targetChat: ChatFields | undefined,
    existingChat: ChatFields | undefined,
  ): ChatFields => ({
    model: typeof targetChat?.model === "string"
      ? targetChat.model
      : existingChat?.model,
    temperature: typeof targetChat?.temperature === "number"
      ? targetChat.temperature
      : existingChat?.temperature,
    top_p: typeof targetChat?.top_p === "number"
      ? targetChat.top_p
      : existingChat?.top_p,
    presence_penalty: typeof targetChat?.presence_penalty === "number"
      ? targetChat.presence_penalty
      : existingChat?.presence_penalty,
    frequency_penalty: typeof targetChat?.frequency_penalty === "number"
      ? targetChat.frequency_penalty
      : existingChat?.frequency_penalty,
  });
}

export default async (context: Context, _next: NextFunction): Promise<void> => {
  await (new Handler(context)).handleRequest();
  return;
};
