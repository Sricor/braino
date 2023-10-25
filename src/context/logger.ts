import type { Context, NextFunction } from "@components/grammy.ts";
import { ClientError } from "@components/errors.ts";
import { logger } from "@components/log.ts";

export default async (context: Context, next: NextFunction): Promise<void> => {
  const before = Date.now();
  try {
    await next();
  } catch (err) {
    logger.error(err.message || err)
    if (err instanceof ClientError) {
      context.reply(err.message);
    }
  }
  const after = Date.now();

  logger.info(`${context.from?.id} Response time: ${after - before} ms`);
};
