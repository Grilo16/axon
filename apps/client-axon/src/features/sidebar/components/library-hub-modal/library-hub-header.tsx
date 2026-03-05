import { X, HardDrive } from "lucide-react";
import { ModalHeader, Flex, Heading } from "@shared/ui";

interface LibraryHubHeaderProps {
  onClose: () => void;
}

export const LibraryHubHeader = ({ onClose }: LibraryHubHeaderProps) => {
  return (
    <ModalHeader>
      <Flex $align="center" $gap="sm">
        <HardDrive size={20} color="#3b82f6" />
        <Heading $level="h2">Axon Library Hub</Heading>
      </Flex>
      <button 
        onClick={onClose} 
        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#9ca3af' }}
      >
        <X size={20} />
      </button>
    </ModalHeader>
  );
};