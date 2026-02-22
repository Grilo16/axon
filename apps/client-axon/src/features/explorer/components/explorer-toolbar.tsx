import React, { useState, useEffect, useMemo } from "react";
import { ArrowLeft, ArrowRight, RotateCw, FolderUp } from "lucide-react";
import * as S from "../styles";
import { getParentDir, sanitizePath } from "@shared/utils/path";

interface Props {
  currentPath: string | null;
  onNavigate: (path: string) => void;
  onRefresh: () => void;
  goBack: () => void;
  goForward: () => void;
  canGoBack: boolean;
  canGoForward: boolean;
}

export const ExplorerToolbar: React.FC<Props> = ({
  currentPath,
  onNavigate,
  onRefresh,
  goBack,
  goForward,
  canGoBack,
  canGoForward,
}) => {
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    if (currentPath) setInputValue(sanitizePath(currentPath));
  }, [currentPath]);

  const actions = useMemo(() => [
    { 
      icon: <ArrowLeft size={14} />, 
      onClick: goBack, 
      disabled: !canGoBack, 
      title: "Back" 
    },
    { 
      icon: <ArrowRight size={14} />, 
      onClick: goForward, 
      disabled: !canGoForward, 
      title: "Forward" 
    },
    { 
      icon: <FolderUp size={14} />, 
      onClick: () => currentPath && onNavigate(getParentDir(currentPath)), 
      disabled: !currentPath || getParentDir(currentPath) === currentPath, 
      title: "Up One Level" 
    },
    { 
      icon: <RotateCw size={14} />, 
      onClick: onRefresh, 
      disabled: false, 
      title: "Refresh" 
    }
  ], [canGoBack, canGoForward, currentPath, goBack, goForward, onNavigate, onRefresh]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onNavigate(sanitizePath(inputValue));
    }
  };

  return (
    <S.Toolbar>
      <S.ActionRow>
        <S.ButtonGroup>
          {actions.map((action, index) => (
            <S.IconButton 
              key={index}
              disabled={action.disabled} 
              onClick={action.onClick}
              title={action.title}
            >
              {action.icon}
            </S.IconButton>
          ))}
        </S.ButtonGroup>
      </S.ActionRow>

      <S.AddressBar
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Enter path..."
      />
    </S.Toolbar>
  );
};