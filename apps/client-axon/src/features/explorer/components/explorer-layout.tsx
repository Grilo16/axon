import React from 'react';
import { Loader2 } from 'lucide-react';
import * as S from '../styles'; 

export const ExplorerError: React.FC<{ type: string }> = ({ type }) => (
  <S.ErrorMessage>
    <strong>Failed to load:</strong> {type}
  </S.ErrorMessage>
);

export const ExplorerLoader: React.FC = () => (
  <S.LoadingState>
    <Loader2 size={20} />
    <span>Scanning workspace...</span>
  </S.LoadingState>
);