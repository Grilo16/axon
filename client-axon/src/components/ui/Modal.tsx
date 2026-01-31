import React from 'react';
import styled from 'styled-components';
import { createPortal } from 'react-dom';
import { Surface } from './Surface';
import { VscClose } from 'react-icons/vsc';

// 1. The Backdrop (Dark overlay)
const Backdrop = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0, 0, 0, 0.6); /* Dimmed background */
  backdrop-filter: blur(2px); /* Glassmorphism effect */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.2s ease-out;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

// 2. The Modal Content (Uses your Surface!)
const ModalContainer = styled(Surface)`
  min-width: 500px;
  max-width: 80vw;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 50px rgba(0,0,0,0.5);
  animation: slideUp 0.2s ease-out;

  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: ${({ theme }) => theme.spacing(3)};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  margin-bottom: ${({ theme }) => theme.spacing(3)};
`;

const Title = styled.h3`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  font-size: 20px;
  display: flex;
  align-items: center;
  
  &:hover { color: ${({ theme }) => theme.colors.text.primary}; }
`;

const Body = styled.div`
  flex: 1;
  overflow-y: auto; /* Scroll internally if content is long */
`;

// --- The Component ---

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  if (!isOpen) return null;

  return createPortal(
    <Backdrop onClick={onClose}>
      <ModalContainer 
        $variant="surface" 
        $padding={4} 
        onClick={(e) => e.stopPropagation()} // Don't close when clicking inside
      >
        <Header>
          <Title>{title}</Title>
          <CloseButton onClick={onClose}>
            <VscClose />
          </CloseButton>
        </Header>
        <Body>
          {children}
        </Body>
      </ModalContainer>
    </Backdrop>,
    document.body
  );
};