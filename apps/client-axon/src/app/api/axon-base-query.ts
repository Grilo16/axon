import { invoke } from '@tauri-apps/api/core';
import { type BaseQueryFn } from '@reduxjs/toolkit/query/react';
import type { AxonError } from '@shared/types/axon-core/error';

export type AxonQueryArgs = {
  command: string;
  url: string;
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: Record<string, any>;
  tauriArgs?: Record<string, any>;
};

export const dualBaseQuery: BaseQueryFn<
  AxonQueryArgs,
  unknown,
  AxonError
> = async ({ command, url, method = 'GET', body, tauriArgs }) => {
  const isTauri = '__TAURI_INTERNALS__' in window;

  if (isTauri) {
    // === 🖥️ TAURI EXECUTOR ===
    try {
      const result = await invoke(command, tauriArgs || body || {});
      return { data: result };
    } catch (error) {
      return { error: error as AxonError };
    }
  } else {
    // === 🌐 WEB HTTP EXECUTOR ===
    try {
      const options: RequestInit = {
        method,
        headers: { 'Content-Type': 'application/json' },
      };

    
      const oidcStorageKey = `oidc.user:http://localhost:8080/realms/axon:axon-client`;
      const oidcStorage = sessionStorage.getItem(oidcStorageKey);
      
      if (oidcStorage) {
        const { access_token } = JSON.parse(oidcStorage);
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${access_token}`, // Inject the VIP wristband!
        };
      }

      if (method !== 'GET' && body) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(`http://localhost:8000/api${url}`, options);
      
      if (!response.ok) {
        const errorData = await response.json();
        return { error: errorData as AxonError };
      }

      const data = await response.json();
      return { data };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown fetch error";
      const networkError: AxonError = { 
        type: "backend", 
        data: `Network/Fetch failed: ${errorMessage}` 
      };

      return { error: networkError };
    }
  }
};