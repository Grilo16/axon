import styled from "styled-components";
import { useTheme } from "@features/theme/useTheme";
import { CreateWorkspaceCard } from "@components/CreateWorkspaceCard";

const Container = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;


const IconButton = styled.button`
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text.secondary};
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: ${({ theme }) => theme.colors.bg.overlay};
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const TopRight = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
`;

export const WelcomePage = () => {
  const { toggle: toggleTheme, isDark } = useTheme();

  return (
    <Container>
      <TopRight>
        <IconButton onClick={toggleTheme} title="Toggle Theme">
          {isDark ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </IconButton>
      </TopRight>
        <CreateWorkspaceCard/>
    </Container>
  );
};
