
import styled from "styled-components";

export const Card = styled.div`
  background: #1e1e1e;
  border: 1px solid #333;
  border-radius: 6px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px; 
`;
export const Title = styled.div`
  color: #fff;
  font-weight: 600;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

export const StatsRow = styled.div`
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #9ca3af;
`;

export const StatBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  background: #252526;
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid #333;
`;

export const GenerateBtn = styled.button<{ $isGenerating: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 8px;
  background: ${props => props.$isGenerating ? '#374151' : '#2563eb'};
  color: #fff;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  font-size: 12px;
  cursor: ${props => props.$isGenerating ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: #1d4ed8;
    box-shadow: 0 0 8px rgba(37, 99, 235, 0.4); /* Subtle glow on hover */
  }

  &:disabled {
    opacity: 0.7;
  }
`;