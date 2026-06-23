import { API } from "./config";

export async function apiFetch(endpoint, options = {}) {
  const res = await fetch(`${API}/${endpoint}`, options);

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API error ${res.status}: ${text}`);
  }

  return res.json();
}
