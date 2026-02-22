import styled from "styled-components";
import { Heading, Subtext } from "@components/ui/Typography";
import { VscFolderOpened } from "react-icons/vsc";

const Container = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const InfoBox = styled.div`
  padding: 12px;
  background: ${({ theme }) => theme.colors.bg.overlay};
  border-radius: 6px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.5;
`;

/**
 * Legacy panel: folder groups are now generated automatically from scan results.
 * Kept so the file still compiles even if older routes/components reference it.
 */
export const GroupConfigView = ({
  label = "Folder Group",
}: {
  label?: string;
}) => {
  return (
    <Container>
      <div>
        <Heading>
          <VscFolderOpened /> {label}
        </Heading>
        <Subtext>Folder groups are derived automatically.</Subtext>
      </div>

      <InfoBox>
        This group represents a folder in the graph. Scan settings now live in{" "}
        <strong>Global Settings → Scan Settings</strong>.
      </InfoBox>
    </Container>
  );
};
