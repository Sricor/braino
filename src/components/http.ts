// interface Client {
//     baseURL: string
// }

export class HTTPClient {
  constructor(public api: string) {}

  #request = async (
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

  get = async (path: string, headers?: HeadersInit, body?: BodyInit) => {
    return await this.#request("GET", path, headers, body);
  };

  post = async (path: string, headers?: HeadersInit, body?: BodyInit) => {
    return await this.#request("POST", path, headers, body);
  };
}
