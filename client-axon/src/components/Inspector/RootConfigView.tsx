import styled from "styled-components";
import { useWorkspace } from "@features/workspace/useWorkspace";
import { Heading, Subtext } from "@components/ui/Typography";
import { VscSettingsGear } from "react-icons/vsc";
import { PromptRuleEditor } from "./PromptRuleEditor";

const Container = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Label = styled.label`
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.text.muted};
`;

const InfoBox = styled.div`
  padding: 12px;
  background: ${({ theme }) => theme.colors.bg.overlay};
  border-radius: 6px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.5;
`;

export const RootConfigView = () => {
  const { config, setOptions, projectRoot } = useWorkspace();

  if (!config) return null;

  return (
    <Container>
      <div>
        <Heading>
          <VscSettingsGear /> Global Settings
        </Heading>
        <Subtext>Configuration applied to all groups.</Subtext>
      </div>

      <Section>
        <Label>Project Root</Label>
        <InfoBox style={{ fontFamily: "monospace", wordBreak: "break-all" }}>{projectRoot}</InfoBox>
      </Section>

      <PromptRuleEditor
        options={config}
        setOptions={(patch) => setOptions(patch)}
        hint="Pro tip: you can author rules directly from the graph by clicking symbols on FileNodes."
      />
    </Container>
  );
};
