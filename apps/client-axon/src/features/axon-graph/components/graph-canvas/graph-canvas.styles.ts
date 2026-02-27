import styled from "styled-components";

export const GraphContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  background-color: #121212;
`;

export const FlowChrome = styled.div`
  width: 100%;
  height: 100%;

  /* The Gliding Animation */
  .react-flow__node {
    transition:
      transform 0.4s cubic-bezier(0.25, 1, 0.5, 1),
      opacity 0.3s ease,
      filter 0.3s ease;
  }

  /* FIX: Shut off transitions instantly when dragging so edges stay attached! */
  .react-flow__node.dragging,
  .react-flow__node.selected.dragging {
    transition: none !important;
  }

.react-flow__node.dimmed-node {
    opacity: 0.15;
    filter: grayscale(100%);
  }

  /* NEW: The 1st-degree direct connections */
  .react-flow__node.semi-dimmed-node {
    opacity: 0.55;
    filter: grayscale(40%);
  }

  .react-flow__edge.dimmed-edge {
    opacity: 0.02 !important; 
    filter: grayscale(100%); 
    pointer-events: none; 
    transition: opacity 0.3s ease, filter 0.3s ease;
  }

  .react-flow__controls {
    background: #222;
    border: 1px solid #444;
    border-radius: 8px;
    overflow: hidden;
  }
  .react-flow__controls-button {
    background: #222;
    border-bottom: 1px solid #333;
    color: #ccc;
  }
  .react-flow__controls-button:hover {
    background: #2a2a2a;
  }
  .react-flow__minimap {
    background: #111;
    border: 1px solid #2f2f2f;
    border-radius: 8px;
    overflow: hidden;
  }
`;

export const EmptyState = styled.div`
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  color: #8a8a8a;
  font-size: 13px;
`;
export const Overlay = styled.div`
  position: absolute;
  inset: 0;
  z-index: 20;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: rgba(0, 0, 0, 0.5);
  color: #60a5fa;
`;
export const OverlayText = styled.span`
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 11px;
`;
export const ErrorBanner = styled.div`
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 30;
  background: rgba(127, 29, 29, 0.95);
  color: #fecaca;
  border: 1px solid #7f1d1d;
  border-radius: 8px;
  padding: 8px 10px;
  font-size: 12px;
  max-width: 420px;
`;
export const SelectionHud = styled.div`
  position: absolute;
  left: 12px;
  bottom: 12px;
  z-index: 20;
  background: rgba(20, 20, 20, 0.95);
  border: 1px solid #333;
  border-radius: 8px;
  padding: 8px 10px;
  color: #d4d4d4;
  font-size: 11px;
  line-height: 1.4;
`;
export const SeedPickerPopover = styled.div`
  position: absolute;
  top: 72px;
  right: 12px;
  z-index: 40;
`;
export const SeedPickerCenteredHost = styled.div`
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  z-index: 15;
`;
