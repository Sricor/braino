import type { Context, NextFunction } from "@components/grammy.ts";
import Base from "@controller/base.ts";

import SettingMenu from "@controller/menu/setting.ts";

class Handler extends Base {
  handleRequest = async () => {
    await this.context.reply("Setting.", { reply_markup: SettingMenu });
  };
}

export default async (context: Context, _next: NextFunction) => {
  return await (new Handler(context)).handleRequest();
};
