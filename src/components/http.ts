export abstract class HTTPClient {
  constructor(public api: string) {}

  protected request = async (
    method: string,
    path: string,
    headers?: HeadersInit,
    body?: BodyInit,
  ) => {
    return await fetch(`${this.api}${path}`, {
      method: method,
      headers: headers,
      body: body,
    });
  };

  protected get = async (path: string, headers?: HeadersInit, body?: BodyInit) => {
    return await this.request("GET", path, headers, body);
  };

  protected post = async (path: string, headers?: HeadersInit, body?: BodyInit) => {
    return await this.request("POST", path, headers, body);
  };
}
