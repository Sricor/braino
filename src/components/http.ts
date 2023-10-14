interface Options {
  headers: object;
}

export class HTTPClient {
  #baseURL: string;

  constructor(baseURL: string, options?: Options) {
    this.#baseURL = baseURL;
    if (options) return;
  }

  set baseURL(baseURL: string) {
    this.#baseURL = baseURL;
  }

  get = async (path: string, headers?: HeadersInit) => {
    return await this.request("GET", path, headers);
  };

  post = async (
    path: string,
    headers?: HeadersInit,
    body?: BodyInit,
  ) => {
    return await this.request("POST", path, headers, body);
  };

  request = async (
    method: string,
    path: string,
    headers?: HeadersInit,
    body?: BodyInit,
  ) => {
    return await fetch(`${this.#baseURL}${path}`, {
      method: method,
      headers: headers,
      body: body,
    });
  };
}
