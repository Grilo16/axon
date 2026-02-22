import styled from 'styled-components';

export const Heading = styled.h2`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  font-weight: 600;
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

export const Subtext = styled.span`
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
`;