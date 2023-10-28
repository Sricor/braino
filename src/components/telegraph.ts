import { HTTPClient } from "@components/http.ts";

// Docs: https://telegra.ph/api
export class Telegraph extends HTTPClient {
  readonly token: string | Promise<string>;

  constructor(token?: string) {
    super("https://api.telegra.ph");

    this.token = token ? token : this.createToken();
  }

  // deno-lint-ignore no-explicit-any
  #requestBody = async (body: any) => {
    return JSON.stringify({ access_token: await this.token, ...body });
  };

  #requestHeaders = () => {
    return { "Content-Type": "application/json" };
  };

  createToken = async () => {
    const response = await this.createAccount({ short_name: "any" });
    return response.result.access_token;
  };

  createAccount = async (body: CreateAccountRequest) => {
    const response = await this.post(
      "/createAccount",
      this.#requestHeaders(),
      JSON.stringify(body),
    );
    return await response.json() as CreateAccountResponse;
  };

  createPage = async (body: CreatePageRequest) => {
    const response = await this.post(
      "/createPage",
      this.#requestHeaders(),
      await this.#requestBody(body),
    );
    return await response.json() as Page;
  };

  editPage = async (body: EditPageRequest) => {
    const response = await this.post(
      "/editPage",
      this.#requestHeaders(),
      await this.#requestBody(body),
    );
    return await response.json() as Page;
  };

  getPageList = async (body: GetPageListRequest) => {
    const response = await this.post(
      "/getPageList",
      this.#requestHeaders(),
      await this.#requestBody(body),
    );
    return await response.json() as GetPageListResponse;
  };
}

interface Account {
  short_name: string;
  author_name: string;
  author_url: string;
  access_token: string;
  auth_url: string;
  page_count: number;
}

interface Response {
  ok: boolean;
}

interface Page extends Response {
  path: string;
  url: string;
  title: string;
  description: string;
  author_name?: string;
  author_url?: string;
  image_url?: string;
  content?: string | Node[];
  views: number;
  can_edit?: boolean;
}

interface CreateAccountRequest {
  short_name: string;
  author_name?: string;
  author_url?: string;
}

interface CreateAccountResponse extends Response {
  result: CreateAccountRequest & {
    auth_url: string;
    access_token: string;
  };
}

interface CreatePageRequest {
  title: string;
  content: Node[];
  author_name?: string;
  author_url?: string;
  return_content?: boolean;
}

interface EditPageRequest extends CreatePageRequest {
  path: string;
}

interface GetPageListRequest {
  offset?: number;
  limit?: number;
}

interface GetPageListResponse extends Response {
  result: {
    total_count: number;
    pages: Page[];
  };
}

type Node = string | NodeElement;

interface NodeElement {
  tag: Tag;
  attrs?: {
    href?: string;
    src?: string;
  };
  children?: Array<string | Node>;
}

type Tag =
  | "a"
  | "aside"
  | "b"
  | "blockquote"
  | "br"
  | "code"
  | "em"
  | "figcaption"
  | "figure"
  | "h3"
  | "h4"
  | "hr"
  | "i"
  | "iframe"
  | "img"
  | "li"
  | "ol"
  | "p"
  | "pre"
  | "s"
  | "strong"
  | "u"
  | "ul"
  | "video";
