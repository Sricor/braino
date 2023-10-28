import { Bot, Composer as CPS } from "grammy";
import type {
  BotConfig as BC,
  Context as CT,
  MiddlewareFn,
  MiddlewareObj,
  NextFunction,
} from "grammy";
import type { Message } from "grammy_types";

interface User {
  identifier: number;
}

interface Conversation {
  reply: (message: string) => Promise<Message.TextMessage>;
  splitTextMessage: (separator?: string, limit?: number) => string[];
}

export type Context = CT & {
  user: User;
  conversation: Conversation;
};

export type Next = NextFunction;
export type BotConfig = BC<Context>;
export type MiddlewareFunction = MiddlewareFn<Context>;

export class Composer extends CPS<Context> {}
export class TelegramBot extends Bot<Context> {}

export abstract class MiddlewareObject implements MiddlewareObj<Context> {
  abstract readonly middleware: () => MiddlewareFunction;
}
