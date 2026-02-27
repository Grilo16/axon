import styled from "styled-components";

export const SeedPickerCard = styled.div<{ $centered?: boolean }>`
  width: ${({ $centered }) => ($centered ? "640px" : "520px")};
  max-width: 92vw;
  background: rgba(18, 18, 18, 0.98);
  border: 1px solid #2f2f2f;
  border-radius: 12px;
  box-shadow: 0 16px 50px rgba(0, 0, 0, 0.5);
  overflow: hidden;
`;

export const SeedPickerHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-bottom: 1px solid #2b2b2b;
  color: #e5e7eb;
  font-size: 13px;
  font-weight: 600;
`;

export const SeedPickerTitle = styled.span` flex: 1; `;

export const SeedPickerSearchWrap = styled.div`
  padding: 10px;
  border-bottom: 1px solid #2b2b2b;
`;

export const SeedPickerInput = styled.input`
  width: 100%;
  height: 34px;
  border-radius: 8px;
  border: 1px solid #374151;
  background: #111827;
  color: #e5e7eb;
  padding: 0 10px;
  outline: none;
  font-size: 12px;
  &:focus { border-color: #3b82f6; }
`;

export const SeedPickerList = styled.div<{ $centered?: boolean }>`
  max-height: ${({ $centered }) => ($centered ? "45vh" : "300px")};
  overflow-y: auto;
`;

export const SeedPickerEmpty = styled.div`
  padding: 14px;
  color: #9ca3af;
  font-size: 12px;
`;

export const SeedPickerRow = styled.button`
  width: 100%;
  text-align: left;
  background: transparent;
  border: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
  color: #e5e7eb;
  padding: 10px 12px;
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 10px;
  align-items: center;
  cursor: pointer;
  &:hover { background: rgba(255, 255, 255, 0.02); }
`;

export const SeedPickerRowIcon = styled.div<{ $tone: "seed" | "visible" | "add" }>`
  color: ${({ $tone }) => $tone === "seed" ? "#fbbf24" : $tone === "visible" ? "#60a5fa" : "#9ca3af"};
`;

export const SeedPickerRowTexts = styled.div` min-width: 0; `;
export const SeedPickerRowLabel = styled.div` font-size: 12px; color: #e5e7eb; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; `;
export const SeedPickerRowPath = styled.div` font-size: 10px; color: #9ca3af; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; `;
export const SeedPickerRowTag = styled.div` font-size: 10px; color: #9ca3af; `;

export const IconGhostButton = styled.button`
  border: none;
  background: transparent;
  color: #9ca3af;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  &:hover { color: #e5e7eb; }
`;