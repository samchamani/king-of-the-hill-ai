export class API {
  controller = new AbortController();
  signal = this.controller.signal;

  get = <TResponse>(url: string) => request<TResponse>(url);
  post = <TBody extends BodyInit, TResponse>(url: string, body: TBody) => request<TResponse>(url, { method: "POST", signal: this.signal, headers: { "Content-Type": "application/json" }, body });
  constructor() {}
}

async function request<TResponse>(url: string, request?: RequestInit): Promise<TResponse> {
  const response = request
    ? await fetch(url, request)
        .then((response) => response.json())
        .catch((err) => console.log("Something went wrong"))
    : await fetch(url)
        .then((response) => response.json())
        .catch((err) => console.log("Something went wrong"));

  return response;
}
