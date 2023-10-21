export const toUnit8Array = (data: string) => {
  return new TextEncoder().encode(String(data));
};

export const toHexString = (data: ArrayBuffer) => {
  const u8Arr = Array.from(new Uint8Array(data));
  const hex = u8Arr.map((b) => b.toString(16).padStart(2, "0")).join(
    "",
  );
  return hex;
};

export const digestMessageWithSHA256 = async <S extends string>(message: S) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(String(message));
  const hashArray = await crypto.subtle.digest("SHA-256", data);
  return toHexString(hashArray);
};

export const digestMessageWithHMACSHA256 = async <S extends string>(
  key: S,
  message: S,
) => {
  const keyArr = toUnit8Array(String(key));
  const dataArr = toUnit8Array(String(message));
  if (!(dataArr instanceof Uint8Array) && !(keyArr instanceof Uint8Array)) {
    throw new TypeError("Expected Uint8Array input data.");
  }

  const hashArray = await crypto.subtle.importKey(
    "raw",
    keyArr,
    { name: "HMAC", hash: { name: "SHA-256" } },
    false,
    ["sign", "verify"],
  )
    .then((key) => crypto.subtle.sign("HMAC", key, dataArr))
    .then((signature) => new Uint8Array(signature));
  return toHexString(hashArray);
};

export const base64decode = <S extends string>(data: S) => {
  return atob(data);
};

export const base64encode = <S extends string>(data: S) => {
  return btoa(data);
};

export const hidePartialString = (
  input: string,
  start: number,
  end: number,
  replace = "*",
): string => {
  if (start < 0 || end > input.length || start >= end) return input;
  const hiddenPart = replace.repeat(end - start);
  const visiblePart = input.substring(0, start) + hiddenPart +
    input.substring(end);
  return visiblePart;
};
