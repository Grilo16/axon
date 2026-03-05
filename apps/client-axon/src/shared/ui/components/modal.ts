import styled from "styled-components";
import { flexCenter } from "../theme/mixins";
import { boxEngine, type BoxProps } from "../primitives";

export const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: ${({ theme }) => theme.zIndices.modal};
  ${flexCenter}
  background-color: ${({ theme }) => theme.colors.bg.overlay};
  backdrop-filter: blur(4px);
`;

export interface ModalCardProps {
  $width?: string;
  $maxWidth?: string;
}

export const ModalCard = styled.div<ModalCardProps & BoxProps>`
  ${boxEngine}
  width: ${({ $width = "560px" }) => $width};
  max-width: ${({ $maxWidth = "90vw" }) => $maxWidth};
  max-height: 90vh;

  background: ${({ theme }) => theme.colors.bg.surface};
  border: 1px solid ${({ theme }) => theme.colors.border.subtle};
  border-radius: ${({ theme }) => theme.radii.xl};
  box-shadow: ${({ theme }) => theme.shadows.lg};

  display: flex;
  flex-direction: column;
  overflow: hidden;

  /* Entry animation for that premium feel */
  animation: modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  @keyframes modalSlideUp {
    from {
      opacity: 0;
      transform: translateY(10px) scale(0.98);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
`;

export const ModalHeader = styled.div<BoxProps>`
  ${boxEngine}
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.xl};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.subtle};
  background: ${({ theme }) => theme.colors.bg.elevated};
`;

export const ModalBody = styled.div<BoxProps>`
  ${boxEngine}
  padding: ${({ theme }) => theme.spacing.xl};
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
  min-height: 200px;
`;
