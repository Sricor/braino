import type { Context, NextFunction } from "@components/grammy.ts";

export default async (context: Context, next: NextFunction): Promise<void> => {
  const before = Date.now();
  try {
    await next();
  } catch (err) {
    console.log(err.message);
    context.reply(err.message);
  }
  const after = Date.now();
  console.log(`Response time: ${after - before} ms`);
};
