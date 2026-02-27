import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: #252526;
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #333;
`;

export const Select = styled.select`
  flex: 1;
  background: #1e1e1e;
  color: #e5e5e5;
  border: 1px solid #444;
  border-radius: 4px;
  padding: 6px 8px;
  font-size: 13px;
  outline: none;
  cursor: pointer;

  &:focus {
    border-color: #3b82f6;
  }
`;

export const CreateInput = styled.input`
  flex: 1;
  background: #1e1e1e;
  color: #e5e5e5;
  border: 1px solid #3b82f6;
  border-radius: 4px;
  padding: 6px 8px;
  font-size: 13px;
  outline: none;
`;

export const IconButton = styled.button`
  background: transparent;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 4px;

  &:hover {
    background: #333;
    color: #fff;
  }
`;