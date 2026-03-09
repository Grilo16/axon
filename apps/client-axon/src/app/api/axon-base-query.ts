import { invoke } from "@tauri-apps/api/core";
import { type BaseQueryFn } from "@reduxjs/toolkit/query/react";
import type { AxonError } from "@shared/types/axon-core/error";
import { API_BASE_URL, IS_TAURI } from "@app/constants";
import { userManager } from "@app/auth/user-manager";

export type AxonQueryArgs = {
  command: string; // Tauri command name
  url: string; // Web endpoint
  method?: "GET" | "POST" | "PATCH" | "DELETE" | "PUT";
  body?: Record<string, unknown>;
  tauriArgs?: Record<string, unknown>;
};

/**
 * 🖥️ TAURI EXECUTOR
 * Handles local IPC calls safely.
 */
const executeTauriRequest = async (
  command: string,
  args: Record<string, unknown> = {},
) => {
  try {
    const result = await invoke(command, args);
    return { data: result };
  } catch (error) {
    // Standardize Tauri IPC errors
    return {
      error: { type: "tauriIpc", data: error } as AxonError,
    };
  }
};

/**
 * 🌐 WEB HTTP EXECUTOR
 * Handles authenticated network requests safely.
 */
const executeWebRequest = async (
  url: string,
  method: string,
  body?: Record<string, unknown>,
) => {
  try {
    const headers = new Headers({
      "Content-Type": "application/json",
      Accept: "application/json",
    });

    // 1. Safe Token Retrieval via Singleton
    const user = await userManager.getUser();

    // 2. Proactive Expiration Check
    if (user && !user.expired) {
      headers.append("Authorization", `Bearer ${user.access_token}`);
    } else {
      if (!url.includes("/public/")) {
        console.warn(
          "[Axon API] Private request attempted without a valid, fresh token. URL:",
          url,
        );
      }
    }

    const options: RequestInit = {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    };

    const response = await fetch(`${API_BASE_URL}/api${url}`, options);

    // 3. Centralized 401 Handling
    if (response.status === 401) {
      // Dispatch event to trigger global logout/redirect in the UI
      window.dispatchEvent(new Event("auth:unauthorized"));
      return {
        error: {
          type: "auth",
          data: "Session expired or invalid",
        } as AxonError,
      };
    }
    if (!response.ok) {
      const errorText = await response.text();
      let errorData = null;
      try {
        errorData = errorText ? JSON.parse(errorText) : null;
      } catch {
        errorData = { message: errorText };
      }

      return {
        error: (errorData || {
          type: "http",
          data: response.statusText,
        }) as AxonError,
      };
    }

    const rawText = await response.text();

    if (!rawText || rawText.trim() === "") {
      return { data: null };
    }

    try {
      const data = JSON.parse(rawText);
      return { data };
    } catch (e) {
      return { data: rawText };
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown fetch error";
    return {
      error: {
        type: "network",
        data: `Fetch failed: ${errorMessage}`,
      } as AxonError,
    };
  }
};

/**
 * 🚀 MAIN BASE QUERY
 * Routes the execution based on the environment.
 */
export const dualBaseQuery: BaseQueryFn<
  AxonQueryArgs,
  unknown,
  AxonError
> = async ({ command, url, method = "GET", body, tauriArgs }) => {
  if (IS_TAURI) {
    const payload = tauriArgs ?? body ?? {};
    return executeTauriRequest(command, payload);
  }

  return executeWebRequest(url, method, body);
};
