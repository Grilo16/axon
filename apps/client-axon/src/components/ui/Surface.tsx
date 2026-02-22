import styled from 'styled-components';

interface SurfaceProps {
  $variant?: 'main' | 'surface' | 'overlay';
  $padding?: number;
  $radius?: 'sm' | 'md' | 'lg' | 'none';
  $border?: boolean;
}

export const Surface = styled.div<SurfaceProps>`
  background-color: ${({ theme, $variant = 'surface' }) => theme.colors.bg[$variant]};
  padding: ${({ theme, $padding = 2 }) => theme.spacing($padding)};
  border-radius: ${({ theme, $radius = 'md' }) => 
    $radius === 'none' ? '0' : theme.borderRadius[$radius]};
  border: ${({ theme, $border }) => 
    $border ? `1px solid ${theme.colors.border}` : 'none'};
  
  color: ${({ theme }) => theme.colors.text.primary};
  transition: background-color 0.2s ease, border-color 0.2s ease;
`;