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
    chat: ChatFields | undefined,
    existingChat: ChatFields | undefined,
  ): ChatFields => ({
    model: chat?.model || existingChat?.model,
    temperature: chat?.temperature === 0 ? 0 : existingChat?.temperature,
    top_p: chat?.top_p === 0 ? 0 : existingChat?.top_p,
    presence_penalty: chat?.presence_penalty === 0
      ? 0
      : existingChat?.presence_penalty,
    frequency_penalty: chat?.frequency_penalty === 0
      ? 0
      : existingChat?.frequency_penalty,
  });
}

export default async (context: Context, _next: NextFunction): Promise<void> => {
  await (new Handler(context)).handleRequest();
  return;
};
