import { GraphCanvas } from '@components/AxonGraph/GraphCanvas';
import { InspectorPanel } from '@components/Inspector/InspectorPanel';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import styled from 'styled-components';

const PageContainer = styled.div`
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
`;

// The Canvas takes up whatever space is left
const CanvasArea = styled.div`
  flex: 1;
  position: relative;
  min-width: 0; /* Prevents flex items from overflowing */
`;

// The Inspector has a dynamic width
const InspectorArea = styled.div<{ $width: number }>`
  width: ${({ $width }) => $width}px;
  min-width: 250px;
  max-width: 800px;
  position: relative;
  display: flex;
  flex-direction: column;
`;

// 🖱️ The Magic Handle (The "Sash")
const ResizerHandle = styled.div<{ $isResizing: boolean }>`
  width: 4px; /* The clickable area width */
  cursor: col-resize;
  background-color: ${({ theme, $isResizing }) => 
    $isResizing ? theme.colors.palette.primary : 'transparent'};
  border-left: 1px solid ${({ theme }) => theme.colors.border};
  transition: background-color 0.2s;
  z-index: 10;
  
  /* Hover effect to show it's draggable */
  &:hover {
    background-color: ${({ theme }) => theme.colors.palette.primary};
  }
`;

export const WorkspacePage = () => {
  // 1. Initialize State from LocalStorage (or default to 400)
  const [width, setWidth] = useState(() => {
    const saved = localStorage.getItem('axon_inspector_width');
    return saved ? parseInt(saved, 10) : 400;
  });
  
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // 2. The Mouse Down Handler (Start)
  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); // Prevent text selection
    setIsResizing(true);
  }, []);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Calculate new width: Total Window Width - Mouse X Position
      // (Because the panel is on the RIGHT side)
      const newWidth = document.body.clientWidth - e.clientX;
      
      // Clamp values (Min 250px, Max 800px)
      if (newWidth > 250 && newWidth < 800) {
        setWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      // Persist the final width
      localStorage.setItem('axon_inspector_width', width.toString());
    };

    // Attach to 'window' so dragging continues even if mouse leaves the handle
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, width]);

  return (
    <PageContainer>
      <CanvasArea>
        <GraphCanvas />
      </CanvasArea>

      <ResizerHandle 
        onMouseDown={startResizing} 
        $isResizing={isResizing}
      />
      
      <InspectorArea ref={sidebarRef} $width={width}>
        <InspectorPanel />
      </InspectorArea>
    </PageContainer>
  );
};