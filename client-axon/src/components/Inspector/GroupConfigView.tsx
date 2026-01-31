import { useState, useEffect } from "react";
import styled from "styled-components";
import { useWorkspace } from "@features/workspace/useWorkspace";
import { Heading, Subtext } from "@components/ui/Typography";
import { type AxonGroup } from "@axon-types/workspaceTypes";
import { VscFolderOpened } from "react-icons/vsc";
import { PromptRuleEditor } from "./PromptRuleEditor";

const Container = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.text.muted};
`;

const Input = styled.input`
  background: ${({ theme }) => theme.colors.bg.input};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text.primary};
  padding: 8px;
  border-radius: 4px;

  &:focus {
    border-color: ${({ theme }) => theme.colors.palette.primary};
    outline: none;
  }
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-size: 13px;
  user-select: none;
`;

const Divider = styled.div`
  height: 1px;
  width: 100%;
  background: ${({ theme }) => theme.colors.border};
  margin: 6px 0 2px 0;
`;

export const GroupConfigView = ({ group }: { group: AxonGroup }) => {
  const { modifyGroup, config, setOptions } = useWorkspace();

  const [depth, setDepth] = useState(group.depth || 3);
  const [entryPoint, setEntryPoint] = useState(group.entryPoint || "");

  useEffect(() => {
    setDepth(group.depth || 3);
    setEntryPoint(group.entryPoint || "");
  }, [group.id]);

  const handleBlur = () => {
    modifyGroup(group.id, {
      depth,
      entryPoint,
    });
  };

  return (
    <Container>
      <div>
        <Heading>
          <VscFolderOpened /> {group.name}
        </Heading>
        <Subtext>
          Group scan settings + prompt rules for the whole bundle (click symbols in FileNodes to add).
        </Subtext>
      </div>

      <FormGroup>
        <Label>Entry Point</Label>
        <Input
          value={entryPoint}
          onChange={(e) => setEntryPoint(e.target.value)}
          onBlur={handleBlur}
          placeholder="src/main.rs"
        />
      </FormGroup>

      <FormGroup>
        <Label>Scan Depth</Label>
        <Input
          type="number"
          min="1"
          max="10"
          value={depth}
          onChange={(e) => setDepth(Number(e.target.value))}
          onBlur={handleBlur}
        />
      </FormGroup>

      <FormGroup>
        <Label>Options</Label>
        <CheckboxLabel>
          <input
            type="checkbox"
            checked={group.flatten}
            onChange={(e) => modifyGroup(group.id, { flatten: e.target.checked })}
          />
          Flatten Directory Structure
        </CheckboxLabel>

        <CheckboxLabel>
          <input
            type="checkbox"
            checked={group.isActive}
            onChange={(e) => modifyGroup(group.id, { isActive: e.target.checked })}
          />
          Include in Bundle
        </CheckboxLabel>
      </FormGroup>

      <Divider />

      {config ? (
        <PromptRuleEditor
          options={config}
          setOptions={(patch) => setOptions(patch)}
          hint="Rule format: fileName:Target. You can also paste comma/newline lists into the inputs."
        />
      ) : null}
    </Container>
  );
};
