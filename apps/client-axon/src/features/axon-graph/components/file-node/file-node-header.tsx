import { memo } from "react";
import { FileCode, X } from "lucide-react";
import * as S from "./file-node.styles";
import { useGraphActions } from "../../context/graph-actions";

type Props = {
  fileId: string;
  label: string;
  isZoomedOut: boolean;
};

export const FileNodeHeader = memo(({ fileId, label, isZoomedOut }: Props) => {
  const { removeFile } = useGraphActions();

  return (
    <S.NodeHeader $isZoomedOut={isZoomedOut}>
      <S.NodeHeaderMain>
        {!isZoomedOut && <FileCode size={14} />}
        <S.NodeTitle $isZoomedOut={isZoomedOut} title={label}>
          {label}
        </S.NodeTitle>
      </S.NodeHeaderMain>

      {/* Renders in BOTH zoomed in and zoomed out states now! */}
      <S.NodeHeaderActions className="nodrag">
        <S.IconGhostButton type="button" title="Close Node" onClick={() => removeFile(fileId)}>
          <X size={14} />
        </S.IconGhostButton>
      </S.NodeHeaderActions>
    </S.NodeHeader>
  );
});

FileNodeHeader.displayName = "FileNodeHeader";