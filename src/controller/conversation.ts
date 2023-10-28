import type { Context, Next } from "@components/grammy.ts";
import { MiddlewareObject } from "@components/grammy.ts";
import { ConversationClient, OpenAIClient } from "@components/client.ts";

export class Chat extends MiddlewareObject {
  middleware = () => async (context: Context, _next: Next) => {
    const chat = new ConversationClient(context.user.identifier);
    const openai = new OpenAIClient(context.user.identifier);
    const content = context.message?.text || "Hello";

    const messages = await chat.selectMessages();

    // Add Prompt Messages
    const prompt = await chat.selectPrompt();
    prompt.forEach(async (element) => {
      await chat.insertSystemMessage(element);
    });

    // Add User Messages
    await chat.insertUserMessage(content);
    const response = await openai.chat(messages);

    // Remove Prompt Messages
    messages.splice(messages.length - (prompt.length + 1), prompt.length);

    // Response Messages
    if (response.choices) {
      const assistantMessage = response.choices[0].message.content;
      await chat.insertAssistantMessage(assistantMessage);
      await chat.update();
      await context.conversation.reply(assistantMessage);
      return assistantMessage;
    }
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
    const client = new ConversationClient(context.user.identifier);

    const prompt = await client.selectPrompt();
    if (prompt.length === 0) {
      return context.conversation.reply("Prompt is empty.");
    }

    await client.clearPrompt();
    const update = await client.update();
    if (update) {
      if (update.modifiedCount === 1) {
        return context.conversation.reply("Clear prompt success.");
      }
    }
    return context.conversation.reply("Error.");
  };

  static #messages = async (context: Context) => {
    const client = new ConversationClient(context.user.identifier);

    const messages = await client.selectMessages();
    if (messages.length === 0) {
      return context.conversation.reply("History is empty.");
    }

    await client.clearMessages();
    const update = await client.update();
    if (update) {
      if (update.modifiedCount === 1) {
        return context.conversation.reply("Clear history message success.");
      }
    }
    return context.conversation.reply("Error.");
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
    const client = new ConversationClient(context.user.identifier);
    const prompt = await client.selectPrompt();
    if (prompt.length === 0) {
      return context.conversation.reply("Prompt is empty.");
    }

    let result = `Chat Prompt: \n`;
    prompt.forEach((element, index) => {
      const formattedValue = `\n Prompt${index + 1}: ${element} \n`;
      result += formattedValue;
    });
    await context.conversation.reply(result);
  };

  static #insert = async (context: Context) => {
    const params = context.match?.toString();
    if (!params) return;
    const client = new ConversationClient(context.user.identifier);

    await client.insertPrompt(params) ===
        (await client.schema).prompts?.length
      ? await context.conversation.reply("All Set.")
      : await context.conversation.reply("Error.");

    await client.update();
  };
}
