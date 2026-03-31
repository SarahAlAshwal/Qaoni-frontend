export type GetToken = () => Promise<string>;

export async function apiFetch(
  input: RequestInfo | URL,
  init: RequestInit = {},
  getToken?: GetToken
) {
  const headers = new Headers(init.headers);

  if (getToken) {
    const token = await getToken();
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(input, { ...init, headers });
}
