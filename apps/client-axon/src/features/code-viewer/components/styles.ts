import styled from "styled-components";

export const PanelContainer = styled.div`
  width: 100%;
  height: 100%;
  background: #1e1e1e;
  border-left: 1px solid #333;
  display: flex;
  flex-direction: column;
  z-index: 10;
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #252526;
  border-bottom: 1px solid #333;
`;

export const FileInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #e5e5e5;
  font-size: 13px;
  font-family: monospace;
`;

export const EditorWrapper = styled.div`
  flex: 1;
  position: relative;
`;

export const LoaderOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(30, 30, 30, 0.8);
  color: #60a5fa;
  z-index: 10;
`;

export const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  background: transparent;
  border: none;
  color: #9ca3af;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #374151;
    color: #fff;
  }
`;