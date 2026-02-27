import { invoke } from '@tauri-apps/api/core';
import {type BaseQueryFn } from '@reduxjs/toolkit/query/react';
import type { AxonError } from '@shared/types/axon-core/error';

// This is the payload our RTKQ endpoints will return to the baseQuery
export type AxonQueryArgs = {
  command: string;          // For Tauri
  url: string;              // For Web/HTTP
  method?: 'GET' | 'POST';  // For Web/HTTP
  body?: Record<string, any>; // Sent as args to Tauri, or body to HTTP
};

export const dualBaseQuery: BaseQueryFn<
  AxonQueryArgs,
  unknown,
  AxonError
> = async ({ command, url, method = 'GET', body }) => {
  
  // Detect if we are running inside Tauri
  const isTauri = '__TAURI_INTERNALS__' in window;

  if (isTauri) {
    // === TAURI EXECUTOR ===
    try {
      const result = await invoke(command, body);
      return { data: result };
    } catch (error) {
      return { error: error as AxonError };
    }
  } else {
    // === WEB HTTP EXECUTOR ===
   try {
      const options: RequestInit = {
        method,
        headers: { 'Content-Type': 'application/json' },
      };
      
      if (method !== 'GET' && body) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(`/api${url}`, options);
      
      // If the response is not OK, we assume your backend sent back 
      // a JSON response that already matches the AxonError shape.
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