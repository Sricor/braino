import Chat from "@controller/chat.ts";
import Start from "@controller/start.ts";
import Setting from "@controller/user/setting.ts";
import UserInfo from "@controller/user/info.ts";
import Base64Encode from "@controller/format/base64-encode.ts";
import Base64Decode from "@controller/format/base64-decode.ts";
import SHA256 from "@controller/crypto/sha-256.ts";
import HMACSHA256 from "@controller/crypto/hmac-sha-256.ts";

import EditOpenAIBaseUrl from "@controller/menu/openai/edit-base-url.ts";
import EditOpenAIToken from "@controller/menu/openai/edit-token.ts";

import SettingMenu from "@controller/menu/setting.ts";

export default {
  Base64Decode,
  Base64Encode,
  Chat,
  HMACSHA256,
  Setting,
  SHA256,
  Start,
  UserInfo,

  EditOpenAIToken,
  EditOpenAIBaseUrl,
};

export const Menu = {
  SettingMenu,
};
