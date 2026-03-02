import styled from "styled-components";

export const WorkspaceIcon = styled.div<{ $active?: boolean }>`
  width: 42px; height: 42px; position: relative;
  border-radius: ${({ $active }) => ($active ? "12px" : "50%")};
  background-color: ${({ theme, $active }) => $active ? theme.colors.palette.primary : theme.colors.bg.overlay};
  color: ${({ theme, $active }) => $active ? "#fff" : theme.colors.text.secondary};
  display: flex; align-items: center; justify-content: center;
  font-weight: 900; font-size: 13px; cursor: pointer; transition: all 0.2s ease; user-select: none;
  &:hover {
    border-radius: 12px;
    background-color: ${({ theme, $active }) => $active ? theme.colors.palette.primary : theme.colors.palette.secondary};
    color: #fff;
  }
`;

export const ActivePill = styled.div`
  position: absolute; left: -10px; width: 4px; height: 24px;
  background-color: ${({ theme }) => theme.colors.text.primary}; border-radius: 0 4px 4px 0;
`;