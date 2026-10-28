const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

let refreshPromise: Promise<string | null> | null = null;

type ApiOptions = RequestInit & {
  skipRefresh?: boolean;
};

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const response = await fetch(`${API_URL}/api/auth/refresh`, {
          method: "POST",
          credentials: "include",
        });

        if (!response.ok) {
          sessionStorage.removeItem("accessToken");
          return null;
        }

        const data: { accessToken: string } = await response.json();
        sessionStorage.setItem("accessToken", data.accessToken);
        return data.accessToken;
      } catch {
        sessionStorage.removeItem("accessToken");
        return null;
      } finally {
        refreshPromise = null;
      }
    })();
  }

  return refreshPromise;
}

export async function apiFetch<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { skipRefresh = false, ...requestOptions } = options;

  const sendRequest = (token: string | null) => {
    const headers = new Headers(requestOptions.headers);

    if (requestOptions.body && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    } else {
      headers.delete("Authorization");
    }

    return fetch(`${API_URL}/api${endpoint}`, {
      ...requestOptions,
      headers,
      credentials: "include",
    });
  };

  const token = sessionStorage.getItem("accessToken");

  let response = await sendRequest(token);

  if (response.status === 401 && !skipRefresh) {
    const newToken = await refreshAccessToken();

    if (newToken) {
      response = await sendRequest(newToken);
    } else {
      throw new Error("Unauthorized: Unable to refresh access token");
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message ?? `Request failed: ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
