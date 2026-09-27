const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

type ApiOptions = RequestInit;

export async function api<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { headers, ...requestOptions } = options;

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...requestOptions,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.message ?? `Request failed with status ${response.status}`);
  }
  return data as T;
}
