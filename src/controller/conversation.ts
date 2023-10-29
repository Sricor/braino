import type { Context, Next } from "@components/grammy.ts";
import { MiddlewareObject } from "@components/grammy.ts";
import {
  ConversationClient,
  OpenAIClient,
  TelegraphClient,
} from "@components/client.ts";

export class Chat extends MiddlewareObject {
  middleware = () => async (context: Context, _next: Next) => {
    const conversation = new ConversationClient(context.user.identifier);
    const openai = new OpenAIClient(context.user.identifier);
    const reply = await conversation.chat(
      context.message?.text as string,
      openai.chatGPT,
    );
    await conversation.update();

    await context.conversation.reply(reply.content);
  };
}

export class Clear extends MiddlewareObject {
  middleware = () => async (context: Context, _next: Next) => {
    const parameters = context.conversation.splitTextMessage();
    switch (parameters[1]) {
      case "prompt":
        return await Clear.#prompt(context);
      default:
        return await Clear.#messages(context);
    }
  };

  static #prompt = async (context: Context) => {
    const conversation = new ConversationClient(context.user.identifier);
    await conversation.clearPrompt();
    if (
      (await conversation.update({ prompts: await conversation.prompts }))
        .modifiedCount === 1
    ) {
      return context.conversation.reply("Clear prompt success.");
    }
    return context.conversation.reply("Already Empty");
  };

  static #messages = async (context: Context) => {
    const conversation = new ConversationClient(context.user.identifier);
    await conversation.clearMessages();
    if (
      (await conversation.update({ messages: await conversation.messages }))
        .modifiedCount === 1
    ) {
      return context.conversation.reply("Clear messages success.");
    }
    return context.conversation.reply("Already Empty");
  };
}

export class Messages extends MiddlewareObject {
  middleware = () => async (context: Context, _next: Next) => {
    const conversation = new ConversationClient(context.user.identifier);
    const messages = await conversation.messages;
    if (messages.length === 0) {
      return await context.conversation.reply("Messages is Empty.");
    }

    const telegraph = new TelegraphClient(context.user.identifier);
    const result: string[] = [];
    let li = 2;
    messages.forEach((element) => {
      if (li % 2 === 0) {
        result.push("\n");
      }
      result.push(`${element.role.toUpperCase()} : ${element.content} \n`);
      // result.push(JSON.stringify(element))
      // result.push("\n")
      li += 1;
    });
    const url = await telegraph.edit(result);
    await context.conversation.reply(url);
  };
}

export class Prompt extends MiddlewareObject {
  middleware = () => async (context: Context, _next: Next) => {
    const parameters = context.conversation.splitTextMessage();
    if (parameters.length === 1) {
      await Prompt.#select(context);
    } else {
      await Prompt.#insert(context);
    }
  };

  static #select = async (context: Context) => {
    const conversation = new ConversationClient(context.user.identifier);
    const prompts = await conversation.prompts;
    if (prompts.length === 0) {
      return context.conversation.reply("Prompt is empty.");
    }

    const telegraph = new TelegraphClient(context.user.identifier);
    const url = await telegraph.edit(JSON.stringify(prompts));
    await context.conversation.reply(url);
  };

  static #insert = async (context: Context) => {
    const parameters = context.match?.toString();
    if (!parameters) return await context.conversation.reply("Empty messages");
    const conversation = new ConversationClient(context.user.identifier);
    await conversation.insertPrompt(parameters);
    await conversation.update();
    return await context.conversation.reply("All Set.");
  };
}
