import styled from "styled-components";

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #121212;
`;

export const Card = styled.div`
  width: 560px;
  max-width: 90vw;
  background: #1a1a1a;
  border: 1px solid #2f2f2f;
  border-radius: 12px;
  box-shadow: 0 16px 50px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

export const Header = styled.div`
  display: flex; items-center; justify-content: space-between;
  padding: 24px; border-bottom: 1px solid #2b2b2b; background: #1e1e1e;
`;

export const Title = styled.h2`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #f3f4f6;
`;

export const Content = styled.div`
  padding: 24px;
  min-height: 300px;
  display: flex;
  flex-direction: column;
`;

export const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
  max-height: 400px;
`;

export const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #222;
    border-color: #333;
  }

  /* Select the delete button when hovering the row */
  &:hover > button {
    opacity: 1;
    pointer-events: auto;
  }
`;

export const RowIcon = styled.div`
  padding: 8px;
  background: #2a2a2a;
  border-radius: 6px;
  color: #60a5fa;
`;

export const RowInfo = styled.div`
  flex: 1;
  min-width: 0;
`;
export const RowName = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #e5e7eb;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;
export const RowPath = styled.div`
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const DeleteButton = styled.button`
  opacity: 0;
  pointer-events: none;
  transition: all 0.2s;
  background: transparent;
  border: none;
  padding: 8px;
  color: #6b7280;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    color: #f87171;
    background: rgba(248, 113, 113, 0.1);
  }
`;

export const ButtonMain = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: auto;
  &:hover {
    background: #1d4ed8;
  }
`;

export const ButtonGhost = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #9ca3af;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: color 0.2s;
  &:hover {
    color: #e5e7eb;
  }
`;

export const InputGroup = styled.div`
  margin-bottom: 24px;
`;
export const Label = styled.label`
  display: block;
  font-size: 11px;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
`;
export const Input = styled.input`
  width: 100%;
  background: #111;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
  color: #e5e7eb;
  outline: none;
  transition: border-color 0.2s;
  &:focus {
    border-color: #3b82f6;
  }
`;
export const HelperText = styled.div`
  font-size: 12px;
  color: #6b7280;
  background: #111;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #2b2b2b;
  margin-bottom: 32px;
`;
