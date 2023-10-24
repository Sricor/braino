class ErrorBase extends Error {
  message: string;
  // deno-lint-ignore no-explicit-any
  cause: any;

  constructor(message: string) {
    super();
    this.message = message;
  }
}

export class ClientError extends ErrorBase {}
