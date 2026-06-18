import { useAuthStore } from "../stores/authStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

export async function apiFetch(path: string, options: FetchOptions = {}) {
  const { token, guestSessionId, refreshToken, login, logout } = useAuthStore.getState();
  
  const headers = new Headers(options.headers || {});
  
  // Attach JSON content-type if body is provided and not FormData
  if (options.body && !(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  // Attach authentication token
  if (token && !options.skipAuth) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // Attach guest session ID
  if (guestSessionId) {
    headers.set("X-Session-ID", guestSessionId);
  }

  const fetchUrl = `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;
  
  try {
    let response = await fetch(fetchUrl, {
      ...options,
      headers,
    });

    // Handle token expiration & automatic refresh
    if (response.status === 401 && refreshToken && !options.skipAuth && path !== "/auth/refresh" && path !== "/auth/login") {
      try {
        const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Session-ID": guestSessionId || "",
          },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });

        if (refreshResponse.status === 200) {
          const data = await refreshResponse.json();
          // Update credentials in store
          login(data.user, data.access_token, data.refresh_token);
          
          // Retry original request with new token
          headers.set("Authorization", `Bearer ${data.access_token}`);
          response = await fetch(fetchUrl, {
            ...options,
            headers,
          });
        } else {
          // Refresh failed, logout user
          logout();
        }
      } catch (err) {
        console.error("Token refresh failed:", err);
        logout();
      }
    }

    return response;
  } catch (error) {
    console.error("Fetch network error:", error);
    throw error;
  }
}
