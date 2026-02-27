import { useMemo, useState } from "react";
import { Check, Pin, Plus, Search, X } from "lucide-react";

import * as S from "./seed-picker.styles";
import type { FileNodeView } from "../../types";

type Props = {
  files: FileNodeView[];
  visibleNodeIds: Set<string>;
  seedIds: Set<string>;
  onPick: (fileId: string) => void;
  onClose?: () => void;
  title?: string;
  centered?: boolean;
};

function fileIdOf(file: FileNodeView): string {
  return String(file.id);
}

function normalizeFilePath(path?: string | null): string {
  return (path ?? "").replace(/\\/g, "/");
}

export const SeedPicker = ({
  files, visibleNodeIds, seedIds, onPick, onClose, title = "Add a file to explore", centered = false,
}: Props) => {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const ordered = [...files].sort((a, b) => a.label.localeCompare((b.label)));
    if (!q) return ordered.slice(0, 25);

    return ordered.filter((file) => {
      const label = file.label.toLowerCase();
      const path = file.path.toLowerCase();
      return label.includes(q) || path.includes(q);
    }).slice(0, 40);
  }, [files, query]);

  return (
    <S.SeedPickerCard $centered={centered}>
      <S.SeedPickerHeader>
        <Search size={14} />
        <S.SeedPickerTitle>{title}</S.SeedPickerTitle>

        {onClose && (
          <S.IconGhostButton type="button" onClick={onClose} title="Close">
            <X size={14} />
          </S.IconGhostButton>
        )}
      </S.SeedPickerHeader>

      <S.SeedPickerSearchWrap>
        <S.SeedPickerInput
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by filename or path..."
        />
      </S.SeedPickerSearchWrap>

      <S.SeedPickerList $centered={centered}>
        {results.length === 0 ? (
          <S.SeedPickerEmpty>No matches found.</S.SeedPickerEmpty>
        ) : (
          results.map((file) => {
            const id = fileIdOf(file);
            const isSeed = seedIds.has(id);
            const isVisible = visibleNodeIds.has(id);
            const label = file.label;
            const path = normalizeFilePath(file.path);

            const tone = isSeed ? "seed" : isVisible ? "visible" : "add";
            const tag = isSeed ? "Seed" : isVisible ? "Visible" : "Add";

            return (
              <S.SeedPickerRow key={id} type="button" onClick={() => onPick(id)}>
                <S.SeedPickerRowIcon $tone={tone}>
                  {isSeed ? <Pin size={14} /> : isVisible ? <Check size={14} /> : <Plus size={14} />}
                </S.SeedPickerRowIcon>
                <S.SeedPickerRowTexts>
                  <S.SeedPickerRowLabel title={label}>{label}</S.SeedPickerRowLabel>
                  <S.SeedPickerRowPath title={path}>{path}</S.SeedPickerRowPath>
                </S.SeedPickerRowTexts>
                <S.SeedPickerRowTag>{tag}</S.SeedPickerRowTag>
              </S.SeedPickerRow>
            );
          })
        )}
      </S.SeedPickerList>
    </S.SeedPickerCard>
  );
};