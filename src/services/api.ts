export type GetToken = () => Promise<string>;

const API_BASE = import.meta.env.VITE_API_URL ?? "";

export async function apiFetch(
  path: string,
  init: RequestInit = {},
  getToken?: GetToken
) {
  const headers = new Headers(init.headers);

  if (getToken) {
    const token = await getToken();
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(`${API_BASE}${path}`, { ...init, headers });
}
