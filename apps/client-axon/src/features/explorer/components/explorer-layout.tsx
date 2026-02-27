// features/explorer/components/explorer-layout.tsx
import React from 'react';
import { Loader2 } from 'lucide-react';
import * as S from '../styles'; 

interface ExplorerErrorProps {
  error: any; 
}

export const ExplorerError: React.FC<ExplorerErrorProps> = ({ error }) => {
  let message = "An unknown error occurred while reading the directory.";

  if (typeof error === "string") {
    message = error;
  } else if (error && typeof error === "object") {
    if ("type" in error && typeof error.type === "string") {
      const details = error.data?.source || error.data?.message || "";
      message = details ? `${error.type.toUpperCase()}: ${details}` : error.type;
    } 
    else if ("message" in error) {
      message = error.message;
    }
  }

  return (
    <S.ErrorMessage>
      <strong>Failed to load:</strong> {message}
    </S.ErrorMessage>
  );
};

export const ExplorerLoader: React.FC = () => (
  <S.LoadingState>
    <Loader2 size={20} />
    <span>Scanning workspace...</span>
  </S.LoadingState>
);