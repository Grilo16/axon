import styled from "styled-components";
import { useAppSelector } from "@app/hooks";
import { selectSelectedNodeId } from "@features/workspace/workspacesSlice";
import { Surface } from "@components/ui/Surface";

import { VscFileCode } from "react-icons/vsc";
import { Heading } from "@components/ui/Typography";
import { RootConfigView } from "./RootConfigView";
import { FileViewer } from "@components/FileViewer";

const PanelContainer = styled(Surface)`
  height: 100%;
  border-left: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  flex-direction: column;
  z-index: 5;
`;

const Header = styled.div`
  padding: 12px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.bg.surface};
`;

export const InspectorPanel = () => {
  const selectedId = useAppSelector(selectSelectedNodeId);

  const renderContent = () => {
    if (!selectedId) {
      return <RootConfigView />;
    }

    return (
      <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <Header>
          <Heading style={{ fontSize: "13px", marginBottom: 0 }}>
            <VscFileCode style={{ marginRight: 8 }} />
            Source Viewer
          </Heading>
        </Header>
        <FileViewer path={selectedId} />
      </div>
    );
  };

  return (
    <PanelContainer $padding={0} $radius="none" $variant="surface">
      {renderContent()}
    </PanelContainer>
  );
};
