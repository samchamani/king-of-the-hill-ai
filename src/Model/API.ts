// const express = rquire("express");

// const app = express();

// app.listen(80);

export class API {
  get = <TResponse>(url: string) => request<TResponse>(url);
  post = <TBody extends BodyInit, TResponse>(url: string, body: TBody) => request<TResponse>(url, { method: "POST", body });
  constructor() {}
}

async function request<TResponse>(url: string, request?: RequestInit): Promise<TResponse> {
  const response = request ? await fetch(url, request) : await fetch(url);
  return await response.json();
}
