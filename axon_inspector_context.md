# Context Map
- G:/Lesgo Coding Projects/axon/client-axon/src/components/Inspector/InspectorPanel.tsx
- G:/Lesgo Coding Projects/axon/client-axon/src/components/Inspector/PromptRuleEditor.tsx
- G:/Lesgo Coding Projects/axon/client-axon/src/components/Inspector/RootConfigView.tsx
- G:/Lesgo Coding Projects/axon/client-axon/src/app/hooks/useStore.ts
- G:/Lesgo Coding Projects/axon/client-axon/src/app/hooks/useToggle.ts
- G:/Lesgo Coding Projects/axon/client-axon/src/app/store.ts
- G:/Lesgo Coding Projects/axon/client-axon/src/components/Explorer/FileTree.tsx
- G:/Lesgo Coding Projects/axon/client-axon/src/components/FileSelector/FileSelectorModal.tsx
- G:/Lesgo Coding Projects/axon/client-axon/src/components/FileViewer/FileViewer.tsx
- G:/Lesgo Coding Projects/axon/client-axon/src/components/ui/Modal.tsx
- G:/Lesgo Coding Projects/axon/client-axon/src/components/ui/Surface.tsx
- G:/Lesgo Coding Projects/axon/client-axon/src/components/ui/Typography.tsx
- G:/Lesgo Coding Projects/axon/client-axon/src/features/axon/useAxonCore.ts
- G:/Lesgo Coding Projects/axon/client-axon/src/features/axon/useFileSystem.ts
- G:/Lesgo Coding Projects/axon/client-axon/src/features/theme/themeSlice.ts
- G:/Lesgo Coding Projects/axon/client-axon/src/features/workspace/useWorkspace.ts
- G:/Lesgo Coding Projects/axon/client-axon/src/features/workspace/workspacesSlice.ts
- G:/Lesgo Coding Projects/axon/client-axon/src/types/axonTypes.ts
- G:/Lesgo Coding Projects/axon/client-axon/src/types/workspaceTypes.ts

<file path="G:/Lesgo Coding Projects/axon/client-axon/src/components/Inspector/InspectorPanel.tsx">
   1 | import styled from "styled-components";
   2 | import { useAppSelector } from "@app/hooks";
   3 | import { selectSelectedNodeId } from "@features/workspace/workspacesSlice";
   4 | import { Surface } from "@components/ui/Surface";
   5 | 
   6 | import { VscFileCode } from "react-icons/vsc";
   7 | import { Heading } from "@components/ui/Typography";
   8 | import { RootConfigView } from "./RootConfigView";
   9 | import { FileViewer } from "@components/FileViewer";
  10 | 
  11 | const PanelContainer = styled(Surface)`
  12 |   height: 100%;
  13 |   border-left: 1px solid ${({ theme }) => theme.colors.border};
  14 |   display: flex;
  15 |   flex-direction: column;
  16 |   z-index: 5;
  17 | `;
  18 | 
  19 | const Header = styled.div`
  20 |   padding: 12px 16px;
  21 |   border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  22 |   background: ${({ theme }) => theme.colors.bg.surface};
  23 | `;
  24 | 
  25 | export const InspectorPanel = () => {
  26 |   const selectedId = useAppSelector(selectSelectedNodeId);
  27 | 
  28 |   const renderContent = () => {
  29 |     if (!selectedId) {
  30 |       return <RootConfigView />;
  31 |     }
  32 | 
  33 |     return (
  34 |       <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
  35 |         <Header>
  36 |           <Heading style={{ fontSize: "13px", marginBottom: 0 }}>
  37 |             <VscFileCode style={{ marginRight: 8 }} />
  38 |             Source Viewer
  39 |           </Heading>
  40 |         </Header>
  41 |         <FileViewer path={selectedId} />
  42 |       </div>
  43 |     );
  44 |   };
  45 | 
  46 |   return (
  47 |     <PanelContainer $padding={0} $radius="none" $variant="surface">
  48 |       {renderContent()}
  49 |     </PanelContainer>
  50 |   );
  51 | };
</file>

<file path="G:/Lesgo Coding Projects/axon/client-axon/src/components/Inspector/PromptRuleEditor.tsx">
   1 | import { useMemo, useState } from "react";
   2 | import styled from "styled-components";
   3 | import type { PromptOptions } from "@axon-types/axonTypes";
   4 | import { Subtext } from "@components/ui/Typography";
   5 | import { VscAdd, VscTrash } from "react-icons/vsc";
   6 | 
   7 | const Wrap = styled.div`
   8 |   display: flex;
   9 |   flex-direction: column;
  10 |   gap: 14px;
  11 | `;
  12 | 
  13 | const Section = styled.div`
  14 |   display: flex;
  15 |   flex-direction: column;
  16 |   gap: 10px;
  17 | `;
  18 | 
  19 | const LabelRow = styled.div`
  20 |   display: flex;
  21 |   justify-content: space-between;
  22 |   align-items: baseline;
  23 |   gap: 10px;
  24 | `;
  25 | 
  26 | const Label = styled.div`
  27 |   font-size: 11px;
  28 |   font-weight: 800;
  29 |   text-transform: uppercase;
  30 |   color: ${({ theme }) => theme.colors.text.muted};
  31 | `;
  32 | 
  33 | const SmallHint = styled(Subtext)`
  34 |   font-size: 11px;
  35 | `;
  36 | 
  37 | const Select = styled.select`
  38 |   width: 100%;
  39 |   padding: 8px;
  40 |   background: ${({ theme }) => theme.colors.bg.input};
  41 |   border: 1px solid ${({ theme }) => theme.colors.border};
  42 |   color: ${({ theme }) => theme.colors.text.primary};
  43 |   border-radius: 4px;
  44 |   cursor: pointer;
  45 | 
  46 |   &:focus {
  47 |     outline: none;
  48 |     border-color: ${({ theme }) => theme.colors.palette.primary};
  49 |   }
  50 | `;
  51 | 
  52 | const Row = styled.div`
  53 |   display: flex;
  54 |   gap: 8px;
  55 |   align-items: center;
  56 | `;
  57 | 
  58 | const Input = styled.input`
  59 |   flex: 1;
  60 |   background: ${({ theme }) => theme.colors.bg.input};
  61 |   border: 1px solid ${({ theme }) => theme.colors.border};
  62 |   color: ${({ theme }) => theme.colors.text.primary};
  63 |   padding: 8px;
  64 |   border-radius: 4px;
  65 | 
  66 |   &:focus {
  67 |     border-color: ${({ theme }) => theme.colors.palette.primary};
  68 |     outline: none;
  69 |   }
  70 | `;
  71 | 
  72 | const Button = styled.button<{ $tone?: "primary" | "danger" }>`
  73 |   display: inline-flex;
  74 |   align-items: center;
  75 |   gap: 6px;
  76 |   border-radius: 4px;
  77 |   padding: 8px 10px;
  78 |   cursor: pointer;
  79 |   font-size: 12px;
  80 |   border: 1px solid
  81 |     ${({ theme, $tone }) =>
  82 |       $tone === "danger" ? theme.colors.palette.danger : theme.colors.border};
  83 |   background: ${({ theme }) => theme.colors.bg.surface};
  84 |   color: ${({ theme, $tone }) =>
  85 |     $tone === "danger"
  86 |       ? theme.colors.palette.danger
  87 |       : theme.colors.text.primary};
  88 | 
  89 |   &:hover {
  90 |     border-color: ${({ theme, $tone }) =>
  91 |       $tone === "danger"
  92 |         ? theme.colors.palette.danger
  93 |         : theme.colors.palette.primary};
  94 |   }
  95 | `;
  96 | 
  97 | const ChipList = styled.div`
  98 |   display: flex;
  99 |   flex-wrap: wrap;
 100 |   gap: 8px;
 101 | `;
 102 | 
 103 | const Chip = styled.div<{ $tone?: "target" | "redact" }>`
 104 |   display: flex;
 105 |   align-items: center;
 106 |   gap: 8px;
 107 |   border-radius: 999px;
 108 |   padding: 6px 10px;
 109 |   border: 1px solid ${({ theme }) => theme.colors.border};
 110 |   background: ${({ theme }) => theme.colors.bg.overlay};
 111 | 
 112 |   ${({ $tone, theme }) =>
 113 |     $tone === "redact"
 114 |       ? `
 115 |     border-color: ${theme.colors.palette.danger};
 116 |   `
 117 |       : $tone === "target"
 118 |         ? `
 119 |     border-color: ${theme.colors.palette.accent};
 120 |   `
 121 |         : ""}
 122 | `;
 123 | 
 124 | const ChipText = styled.span`
 125 |   font-family:
 126 |     ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono",
 127 |     "Courier New", monospace;
 128 |   font-size: 12px;
 129 |   color: ${({ theme }) => theme.colors.text.primary};
 130 | `;
 131 | 
 132 | const ChipX = styled.button<{ $tone?: "target" | "redact" }>`
 133 |   width: 18px;
 134 |   height: 18px;
 135 |   border-radius: 999px;
 136 |   border: 1px solid ${({ theme }) => theme.colors.border};
 137 |   background: transparent;
 138 |   cursor: pointer;
 139 |   color: ${({ theme, $tone }) =>
 140 |     $tone === "redact"
 141 |       ? theme.colors.palette.danger
 142 |       : $tone === "target"
 143 |         ? theme.colors.palette.accent
 144 |         : theme.colors.text.secondary};
 145 | 
 146 |   &:hover {
 147 |     border-color: ${({ theme, $tone }) =>
 148 |       $tone === "redact"
 149 |         ? theme.colors.palette.danger
 150 |         : $tone === "target"
 151 |           ? theme.colors.palette.accent
 152 |           : theme.colors.palette.primary};
 153 |   }
 154 | `;
 155 | 
 156 | function normalizeMany(raw: string): string[] {
 157 |   return raw
 158 |     .split(/[\n,]+/g)
 159 |     .map((s) => s.trim())
 160 |     .filter(Boolean);
 161 | }
 162 | 
 163 | function upsertMany(existing: string[], toAdd: string[]) {
 164 |   const set = new Set(existing);
 165 |   for (const item of toAdd) set.add(item);
 166 |   return Array.from(set).sort((a, b) => a.localeCompare(b));
 167 | }
 168 | 
 169 | function removeOne(existing: string[], item: string) {
 170 |   return existing.filter((x) => x !== item);
 171 | }
 172 | 
 173 | export function PromptRuleEditor(props: {
 174 |   options: PromptOptions;
 175 |   setOptions: (patch: Partial<PromptOptions>) => void;
 176 |   hint?: string;
 177 | }) {
 178 |   const { options, setOptions, hint } = props;
 179 | 
 180 |   const [targetInput, setTargetInput] = useState("");
 181 |   const [redactInput, setRedactInput] = useState("");
 182 | 
 183 |   const targetLabel = useMemo(() => {
 184 |     if (options.skeletonMode === "keepOnly")
 185 |       return "Keep only (fileName:Target)";
 186 |     if (options.skeletonMode === "stripOnly")
 187 |       return "Strip only (fileName:Target)";
 188 |     return "Targets (fileName:Target)";
 189 |   }, [options.skeletonMode]);
 190 | 
 191 |   const targetToneHint = useMemo(() => {
 192 |     if (options.skeletonMode === "all") {
 193 |       return "In “Signatures” mode, everything is skeletonized; targets are effectively ignored.";
 194 |     }
 195 |     if (options.skeletonMode === "keepOnly") {
 196 |       return "Only these targets will keep implementation detail; everything else is skeletonized.";
 197 |     }
 198 |     return "Only these targets will be skeletonized; everything else stays intact.";
 199 |   }, [options.skeletonMode]);
 200 | 
 201 |   return (
 202 |     <Wrap>
 203 |       <Section>
 204 |         <LabelRow>
 205 |           <Label>Skeleton Strategy</Label>
 206 |           <SmallHint>{targetToneHint}</SmallHint>
 207 |         </LabelRow>
 208 | 
 209 |         <Select
 210 |           value={options.skeletonMode}
 211 |           onChange={(e) => setOptions({ skeletonMode: e.target.value })}
 212 |         >
 213 |           <option value="all">Signatures</option>
 214 |           <option value="stripOnly">
 215 |             Strip Only (Implementation & Signatures)
 216 |           </option>
 217 |           <option value="keepOnly">Keep Essential Only</option>
 218 |         </Select>
 219 | 
 220 |         {hint ? <SmallHint>{hint}</SmallHint> : null}
 221 |       </Section>
 222 | 
 223 |       <Section>
 224 |         <LabelRow>
 225 |           <Label>{targetLabel}</Label>
 226 |           <SmallHint>Example: inventorySlice.ts:addItem</SmallHint>
 227 |         </LabelRow>
 228 | 
 229 |         <Row>
 230 |           <Input
 231 |             value={targetInput}
 232 |             onChange={(e) => setTargetInput(e.target.value)}
 233 |             placeholder="App.tsx:App"
 234 |             onKeyDown={(e) => {
 235 |               if (e.key === "Enter") {
 236 |                 const next = upsertMany(
 237 |                   options.skeletonTargets,
 238 |                   normalizeMany(targetInput),
 239 |                 );
 240 |                 setOptions({ skeletonTargets: next });
 241 |                 setTargetInput("");
 242 |               }
 243 |             }}
 244 |           />
 245 |           <Button
 246 |             onClick={() => {
 247 |               const next = upsertMany(
 248 |                 options.skeletonTargets,
 249 |                 normalizeMany(targetInput),
 250 |               );
 251 |               setOptions({ skeletonTargets: next });
 252 |               setTargetInput("");
 253 |             }}
 254 |           >
 255 |             <VscAdd /> Add
 256 |           </Button>
 257 |           <Button
 258 |             $tone="danger"
 259 |             onClick={() => setOptions({ skeletonTargets: [] })}
 260 |             title="Clear skeleton targets"
 261 |           >
 262 |             <VscTrash /> Clear
 263 |           </Button>
 264 |         </Row>
 265 | 
 266 |         <ChipList>
 267 |           {options.skeletonTargets.map((t) => (
 268 |             <Chip key={t} $tone="target">
 269 |               <ChipText>{t}</ChipText>
 270 |               <ChipX
 271 |                 $tone="target"
 272 |                 aria-label={`remove ${t}`}
 273 |                 onClick={() =>
 274 |                   setOptions({
 275 |                     skeletonTargets: removeOne(options.skeletonTargets, t),
 276 |                   })
 277 |                 }
 278 |               >
 279 |                 ×
 280 |               </ChipX>
 281 |             </Chip>
 282 |           ))}
 283 |         </ChipList>
 284 |       </Section>
 285 | 
 286 |       <Section>
 287 |         <LabelRow>
 288 |           <Label>Redactions (fileName:Target)</Label>
 289 |           <SmallHint>Example: App.tsx:Hideme</SmallHint>
 290 |         </LabelRow>
 291 | 
 292 |         <Row>
 293 |           <Input
 294 |             value={redactInput}
 295 |             onChange={(e) => setRedactInput(e.target.value)}
 296 |             placeholder="inventorySlice.ts:name"
 297 |             onKeyDown={(e) => {
 298 |               if (e.key === "Enter") {
 299 |                 const next = upsertMany(
 300 |                   options.redactions,
 301 |                   normalizeMany(redactInput),
 302 |                 );
 303 |                 setOptions({ redactions: next });
 304 |                 setRedactInput("");
 305 |               }
 306 |             }}
 307 |           />
 308 |           <Button
 309 |             onClick={() => {
 310 |               const next = upsertMany(
 311 |                 options.redactions,
 312 |                 normalizeMany(redactInput),
 313 |               );
 314 |               setOptions({ redactions: next });
 315 |               setRedactInput("");
 316 |             }}
 317 |           >
 318 |             <VscAdd /> Add
 319 |           </Button>
 320 |           <Button
 321 |             $tone="danger"
 322 |             onClick={() => setOptions({ redactions: [] })}
 323 |             title="Clear redactions"
 324 |           >
 325 |             <VscTrash /> Clear
 326 |           </Button>
 327 |         </Row>
 328 | 
 329 |         <ChipList>
 330 |           {options.redactions.map((r) => (
 331 |             <Chip key={r} $tone="redact">
 332 |               <ChipText>{r}</ChipText>
 333 |               <ChipX
 334 |                 $tone="redact"
 335 |                 aria-label={`remove ${r}`}
 336 |                 onClick={() =>
 337 |                   setOptions({ redactions: removeOne(options.redactions, r) })
 338 |                 }
 339 |               >
 340 |                 ×
 341 |               </ChipX>
 342 |             </Chip>
 343 |           ))}
 344 |         </ChipList>
 345 | 
 346 |         <SmallHint>
 347 |           Tip: click a symbol chip inside a FileNode to auto-add{" "}
 348 |           <code>fileName:Target</code>.
 349 |         </SmallHint>
 350 |       </Section>
 351 |     </Wrap>
 352 |   );
 353 | }
</file>

<file path="G:/Lesgo Coding Projects/axon/client-axon/src/components/Inspector/RootConfigView.tsx">
   1 | import { useEffect, useMemo, useState } from "react";
   2 | import styled from "styled-components";
   3 | import { useWorkspace } from "@features/workspace/useWorkspace";
   4 | import { Heading, Subtext } from "@components/ui/Typography";
   5 | import { VscSearch, VscSettingsGear } from "react-icons/vsc";
   6 | import { PromptRuleEditor } from "./PromptRuleEditor";
   7 | import { useToggle } from "@app/hooks";
   8 | import { useFileSystem } from "@features/axon/useFileSystem";
   9 | import { FileSelectorModal } from "@components/FileSelector/FileSelectorModal";
  10 | 
  11 | const Container = styled.div`
  12 |   padding: 20px;
  13 |   display: flex;
  14 |   flex-direction: column;
  15 |   gap: 24px;
  16 | `;
  17 | 
  18 | const Section = styled.div`
  19 |   display: flex;
  20 |   flex-direction: column;
  21 |   gap: 12px;
  22 | `;
  23 | 
  24 | const Label = styled.label`
  25 |   font-size: 11px;
  26 |   font-weight: 700;
  27 |   text-transform: uppercase;
  28 |   color: ${({ theme }) => theme.colors.text.muted};
  29 | `;
  30 | 
  31 | const InfoBox = styled.div`
  32 |   padding: 12px;
  33 |   background: ${({ theme }) => theme.colors.bg.overlay};
  34 |   border-radius: 6px;
  35 |   font-size: 12px;
  36 |   color: ${({ theme }) => theme.colors.text.secondary};
  37 |   line-height: 1.5;
  38 | `;
  39 | 
  40 | const InputRow = styled.div`
  41 |   display: flex;
  42 |   gap: 10px;
  43 |   align-items: center;
  44 | `;
  45 | 
  46 | const Input = styled.input`
  47 |   flex: 1;
  48 |   background: ${({ theme }) => theme.colors.bg.input};
  49 |   border: 1px solid ${({ theme }) => theme.colors.border};
  50 |   color: ${({ theme }) => theme.colors.text.primary};
  51 |   padding: 8px 10px;
  52 |   border-radius: 6px;
  53 | 
  54 |   &:focus {
  55 |     border-color: ${({ theme }) => theme.colors.palette.primary};
  56 |     outline: none;
  57 |   }
  58 | `;
  59 | 
  60 | const Button = styled.button`
  61 |   background: ${({ theme }) => theme.colors.bg.surface};
  62 |   border: 1px solid ${({ theme }) => theme.colors.border};
  63 |   color: ${({ theme }) => theme.colors.text.primary};
  64 |   padding: 8px 10px;
  65 |   border-radius: 6px;
  66 |   cursor: pointer;
  67 |   display: inline-flex;
  68 |   align-items: center;
  69 |   gap: 8px;
  70 |   font-size: 13px;
  71 |   font-weight: 700;
  72 | 
  73 |   &:hover {
  74 |     background: ${({ theme }) => theme.colors.bg.overlay};
  75 |   }
  76 | `;
  77 | 
  78 | const CheckboxLabel = styled.label`
  79 |   display: flex;
  80 |   align-items: center;
  81 |   gap: 10px;
  82 |   cursor: pointer;
  83 |   font-size: 13px;
  84 |   user-select: none;
  85 |   color: ${({ theme }) => theme.colors.text.secondary};
  86 | 
  87 |   input {
  88 |     transform: translateY(1px);
  89 |   }
  90 | `;
  91 | 
  92 | export const RootConfigView = () => {
  93 |   const { config, setOptions, projectRoot, scanConfig, setScan } =
  94 |     useWorkspace();
  95 | 
  96 |   const { isOpen, toggle, open } = useToggle();
  97 |   const fs = useFileSystem(projectRoot || null);
  98 | 
  99 |   const [entryPoint, setEntryPoint] = useState(scanConfig?.entryPoint ?? "");
 100 |   const [depth, setDepth] = useState<number>(scanConfig?.depth ?? 3);
 101 |   const [flatten, setFlatten] = useState<boolean>(scanConfig?.flatten ?? true);
 102 | 
 103 |   useEffect(() => {
 104 |     setEntryPoint(scanConfig?.entryPoint ?? "");
 105 |     setDepth(scanConfig?.depth ?? 3);
 106 |     setFlatten(scanConfig?.flatten ?? true);
 107 |   }, [scanConfig?.entryPoint, scanConfig?.depth, scanConfig?.flatten]);
 108 | 
 109 |   const canBrowse = useMemo(() => Boolean(projectRoot), [projectRoot]);
 110 | 
 111 |   const commitScanSettings = () => {
 112 |     setScan({
 113 |       entryPoint: entryPoint.trim(),
 114 |       depth: Math.max(1, Number.isFinite(depth) ? depth : 3),
 115 |       flatten: !!flatten,
 116 |     });
 117 |   };
 118 | 
 119 |   if (!config) return null;
 120 | 
 121 |   return (
 122 |     <Container>
 123 |       <div>
 124 |         <Heading>
 125 |           <VscSettingsGear /> Global Settings
 126 |         </Heading>
 127 |         <Subtext>
 128 |           Single scan from an entrypoint. Groups in the graph are created
 129 |           automatically from folders.
 130 |         </Subtext>
 131 |       </div>
 132 | 
 133 |       <Section>
 134 |         <Label>Scan Settings</Label>
 135 | 
 136 |         <div>
 137 |           <Subtext style={{ marginBottom: 8 }}>Entry Point</Subtext>
 138 |           <InputRow>
 139 |             <Input
 140 |               value={entryPoint}
 141 |               onChange={(e) => setEntryPoint(e.target.value)}
 142 |               onBlur={commitScanSettings}
 143 |               placeholder="src/main.rs"
 144 |             />
 145 |             <Button
 146 |               onClick={() => {
 147 |                 if (!canBrowse) return;
 148 |                 fs.refresh();
 149 |                 open();
 150 |               }}
 151 |               disabled={!canBrowse}
 152 |               title={canBrowse ? "Browse files" : "Open a workspace first"}
 153 |             >
 154 |               <VscSearch />
 155 |               Browse
 156 |             </Button>
 157 |           </InputRow>
 158 |         </div>
 159 | 
 160 |         <div>
 161 |           <Subtext style={{ marginBottom: 8 }}>Depth</Subtext>
 162 |           <Input
 163 |             type="number"
 164 |             min={1}
 165 |             max={25}
 166 |             value={depth}
 167 |             onChange={(e) => setDepth(Number(e.target.value))}
 168 |             onBlur={commitScanSettings}
 169 |           />
 170 |         </div>
 171 | 
 172 |         <CheckboxLabel>
 173 |           <input
 174 |             type="checkbox"
 175 |             checked={flatten}
 176 |             onChange={(e) => {
 177 |               setFlatten(e.target.checked);
 178 |               setScan({ flatten: e.target.checked });
 179 |             }}
 180 |           />
 181 |           Flatten directory structure during scan
 182 |         </CheckboxLabel>
 183 |       </Section>
 184 | 
 185 |       <Section>
 186 |         <Label>Project Root</Label>
 187 |         <InfoBox style={{ fontFamily: "monospace", wordBreak: "break-all" }}>
 188 |           {projectRoot}
 189 |         </InfoBox>
 190 |       </Section>
 191 | 
 192 |       <PromptRuleEditor
 193 |         options={config}
 194 |         setOptions={(patch) => setOptions(patch)}
 195 |         hint="Pro tip: you can author rules directly from the graph by clicking symbols on FileNodes."
 196 |       />
 197 | 
 198 |       <FileSelectorModal
 199 |         isOpen={isOpen}
 200 |         toggle={toggle}
 201 |         fs={fs}
 202 |         mode="file"
 203 |         onSelect={(path) => {
 204 |           setEntryPoint(path);
 205 |           setScan({ entryPoint: path });
 206 |         }}
 207 |       />
 208 |     </Container>
 209 |   );
 210 | };
</file>

<file path="G:/Lesgo Coding Projects/axon/client-axon/src/app/hooks/useStore.ts">
   1 | import {type TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
   2 | import type { AppDispatch, RootState } from '../store';
   3 | 
   4 | export const useAppDispatch = () => useDispatch<AppDispatch>();
   5 | export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
</file>

<file path="G:/Lesgo Coding Projects/axon/client-axon/src/app/hooks/useToggle.ts">
   1 | import { useState, useCallback, useRef, useEffect } from "react";
   2 | import type { SyntheticEvent } from "react";
   3 | 
   4 | type ToggleEvent = SyntheticEvent | Event;
   5 | 
   6 | export interface UseToggleOptions {
   7 |   initialOpen?: boolean;
   8 |   initialLocked?: boolean;
   9 |   preventDefault?: boolean;
  10 |   stopPropagation?: boolean;
  11 |   onOpen?: (e?: ToggleEvent) => void;
  12 |   onClose?: (e?: ToggleEvent) => void;
  13 |   onLock?: (e?: ToggleEvent) => void;
  14 |   onUnlock?: (e?: ToggleEvent) => void;
  15 | }
  16 | 
  17 | export interface UseToggleResult {
  18 |   isOpen: boolean;
  19 |   isLocked: boolean;
  20 |   open: (e?: ToggleEvent) => void;
  21 |   close: (e?: ToggleEvent) => void;
  22 |   toggle: (e?: ToggleEvent) => void;
  23 |   lock: (e?: ToggleEvent) => void;
  24 |   unlock: (e?: ToggleEvent) => void;
  25 |   toggleLock: (e?: ToggleEvent) => void;
  26 |   setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  27 |   setLocked: React.Dispatch<React.SetStateAction<boolean>>;
  28 | }
  29 | 
  30 | export const useToggle = ({
  31 |   initialOpen = false,
  32 |   initialLocked = false,
  33 |   preventDefault = false,
  34 |   stopPropagation = false,
  35 |   onOpen,
  36 |   onClose,
  37 |   onLock,
  38 |   onUnlock,
  39 | }: UseToggleOptions = {}): UseToggleResult => {
  40 |   const [isOpen, setOpen] = useState(initialOpen);
  41 |   const [isLocked, setLocked] = useState(initialLocked);
  42 | 
  43 |   const callbacksRef = useRef({ onOpen, onClose, onLock, onUnlock });
  44 | 
  45 |   useEffect(() => {
  46 |     callbacksRef.current = { onOpen, onClose, onLock, onUnlock };
  47 |   });
  48 | 
  49 |   const handleEvent = useCallback(
  50 |     (e?: ToggleEvent) => {
  51 |       if (!e) return;
  52 |       if (preventDefault && 'preventDefault' in e) e.preventDefault();
  53 |       if (stopPropagation && 'stopPropagation' in e) e.stopPropagation();
  54 |     },
  55 |     [preventDefault, stopPropagation]
  56 |   );
  57 | 
  58 |   const open = useCallback(
  59 |     (e?: ToggleEvent) => {
  60 |       handleEvent(e);
  61 |       if (!isLocked) {
  62 |         setOpen(true);
  63 |         callbacksRef.current.onOpen?.(e);
  64 |       }
  65 |     },
  66 |     [isLocked, handleEvent]
  67 |   );
  68 | 
  69 |   const close = useCallback(
  70 |     (e?: ToggleEvent) => {
  71 |       handleEvent(e);
  72 |       if (!isLocked) {
  73 |         setOpen(false);
  74 |         callbacksRef.current.onClose?.(e);
  75 |       }
  76 |     },
  77 |     [isLocked, handleEvent]
  78 |   );
  79 | 
  80 |   const toggle = useCallback(
  81 |     (e?: ToggleEvent) => {
  82 |       handleEvent(e);
  83 |       if (isLocked) return;
  84 | 
  85 |       setOpen((prev) => {
  86 |         const newState = !prev;
  87 |         if (newState) {
  88 |           callbacksRef.current.onOpen?.(e);
  89 |         } else {
  90 |           callbacksRef.current.onClose?.(e);
  91 |         }
  92 |         return newState;
  93 |       });
  94 |     },
  95 |     [isLocked, handleEvent]
  96 |   );
  97 | 
  98 |   const lock = useCallback(
  99 |     (e?: ToggleEvent) => {
 100 |       handleEvent(e);
 101 |       setLocked(true);
 102 |       callbacksRef.current.onLock?.(e);
 103 |     },
 104 |     [handleEvent]
 105 |   );
 106 | 
 107 |   const unlock = useCallback(
 108 |     (e?: ToggleEvent) => {
 109 |       handleEvent(e);
 110 |       setLocked(false);
 111 |       callbacksRef.current.onUnlock?.(e);
 112 |     },
 113 |     [handleEvent]
 114 |   );
 115 | 
 116 |   const toggleLock = useCallback(
 117 |     (e?: ToggleEvent) => {
 118 |       handleEvent(e);
 119 |       setLocked((prev) => {
 120 |         const newState = !prev;
 121 |         if (newState) {
 122 |           callbacksRef.current.onLock?.(e);
 123 |         } else {
 124 |           callbacksRef.current.onUnlock?.(e);
 125 |         }
 126 |         return newState;
 127 |       });
 128 |     },
 129 |     [handleEvent]
 130 |   );
 131 | 
 132 |   return {
 133 |     isOpen,
 134 |     isLocked,
 135 |     open,
 136 |     close,
 137 |     toggle,
 138 |     lock,
 139 |     unlock,
 140 |     toggleLock,
 141 |     setOpen,
 142 |     setLocked,
 143 |   };
 144 | };
</file>

<file path="G:/Lesgo Coding Projects/axon/client-axon/src/app/store.ts">
   1 | import { configureStore, combineReducers } from '@reduxjs/toolkit';
   2 | import { 
   3 |   persistStore, 
   4 |   persistReducer,
   5 |   FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER 
   6 | } from 'redux-persist';
   7 | import storage from 'redux-persist/lib/storage'; 
   8 | import workspacesReducer from '@features/workspace/workspacesSlice'; 
   9 | import themeReducer from '@features/theme/themeSlice';
  10 | 
  11 | const rootReducer = combineReducers({
  12 |   workspaces: workspacesReducer,
  13 |   theme: themeReducer,
  14 | });
  15 | 
  16 | const persistConfig = {
  17 |   key: 'axon-root',
  18 |   version: 1,
  19 |   storage,
  20 |   whitelist: ['workspaces', 'theme'] 
  21 | };
  22 | 
  23 | const persistedReducer = persistReducer(persistConfig, rootReducer);
  24 | 
  25 | export const store = configureStore({
  26 |   reducer: persistedReducer,
  27 |   middleware: (getDefaultMiddleware) =>
  28 |     getDefaultMiddleware({
  29 |       serializableCheck: {
  30 |         ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
  31 |       },
  32 |     }),
  33 | });
  34 | 
  35 | export const persistor = persistStore(store);
  36 | 
  37 | export type RootState = ReturnType<typeof store.getState>;
  38 | export type AppDispatch = typeof store.dispatch;
</file>

<file path="G:/Lesgo Coding Projects/axon/client-axon/src/components/Explorer/FileTree.tsx">
   1 | import styled from 'styled-components';
   2 | import { VscFile, VscFolder } from 'react-icons/vsc';
   3 | 
   4 | const List = styled.div`
   5 |   display: flex; 
   6 |   flex-direction: column; 
   7 |   gap: 2px;
   8 | `;
   9 | 
  10 | const Item = styled.div`
  11 |   display: flex; 
  12 |   align-items: center; 
  13 |   gap: 8px;
  14 |   padding: 6px 8px;
  15 |   cursor: pointer;
  16 |   border-radius: 4px;
  17 |   font-size: 13px;
  18 |   color: ${({theme}) => theme.colors.text.secondary};
  19 | 
  20 |   &:hover {
  21 |     background: ${({theme}) => theme.colors.bg.overlay};
  22 |     color: ${({theme}) => theme.colors.text.primary};
  23 |   }
  24 | `;
  25 | 
  26 | interface FileTreeProps {
  27 |   files: any[];
  28 |   onFileClick: (file: any) => void;
  29 |   onDirClick: (dir: any) => void;
  30 | }
  31 | 
  32 | export const FileTree = ({ files, onFileClick, onDirClick }: FileTreeProps) => {
  33 |   return (
  34 |     <List>
  35 |       {files.map((file) => (
  36 |         <Item 
  37 |           key={file.path} 
  38 |           onClick={() => file.is_dir ? onDirClick(file) : onFileClick(file)}
  39 |         >
  40 |           {file.is_dir ? <VscFolder color="#dcb67a" /> : <VscFile />}
  41 |           {file.name}
  42 |         </Item>
  43 |       ))}
  44 |     </List>
  45 |   );
  46 | };
</file>

<file path="G:/Lesgo Coding Projects/axon/client-axon/src/components/FileSelector/FileSelectorModal.tsx">
   1 | import styled from 'styled-components';
   2 | import { Modal } from '@components/ui/Modal';
   3 | import { FileTree } from '@components/Explorer/FileTree';
   4 | import type { useFileSystem } from '@features/axon/useFileSystem';
   5 | 
   6 | interface FileSelectorModalProps {
   7 |   isOpen: boolean;
   8 |   toggle: () => void;
   9 |   fs: ReturnType<typeof useFileSystem>; 
  10 |   mode?: 'file' | 'directory'; 
  11 |   onSelect: (path: string) => void;
  12 | }
  13 | 
  14 | const Footer = styled.div`
  15 |   display: flex;
  16 |   justify-content: flex-end;
  17 |   gap: 10px;
  18 |   margin-top: 15px;
  19 |   padding-top: 15px;
  20 |   border-top: 1px solid ${({ theme }) => theme.colors.border};
  21 | `;
  22 | 
  23 | const Button = styled.button<{ $primary?: boolean }>`
  24 |   background: ${({ theme, $primary }) => $primary ? theme.colors.palette.primary : 'transparent'};
  25 |   color: ${({ theme, $primary }) => $primary ? '#fff' : theme.colors.text.secondary};
  26 |   border: 1px solid ${({ theme, $primary }) => $primary ? theme.colors.palette.primary : theme.colors.border};
  27 |   padding: 6px 12px;
  28 |   border-radius: 4px;
  29 |   cursor: pointer;
  30 |   font-size: 13px;
  31 | 
  32 |   &:hover {
  33 |     background: ${({ theme, $primary }) => $primary ? theme.colors.palette.secondary : theme.colors.bg.overlay};
  34 |   }
  35 | `;
  36 | 
  37 | export const FileSelectorModal = ({ 
  38 |   isOpen, 
  39 |   toggle, 
  40 |   fs, 
  41 |   mode = 'file', 
  42 |   onSelect 
  43 | }: FileSelectorModalProps) => {
  44 | 
  45 |   const handleConfirmDirectory = () => {
  46 |     if (fs.currentPath) {
  47 |       onSelect(fs.currentPath);
  48 |       toggle();
  49 |     }
  50 |   };
  51 | 
  52 |   return (
  53 |     <Modal 
  54 |       isOpen={isOpen} 
  55 |       onClose={toggle} 
  56 |       title={mode === 'directory' ? "Select Root Folder" : "Select File"}
  57 |     >
  58 |       <div style={{ marginBottom: '10px', display: 'flex', gap: '10px' }}>
  59 |          <button onClick={fs.navigateUp} disabled={!fs.currentPath}>
  60 |             ⬅ Up Level
  61 |          </button>
  62 |          <div style={{opacity: 0.5, fontSize: '12px', alignSelf: 'center'}}>
  63 |            {fs.currentPath}
  64 |          </div>
  65 |       </div>
  66 | 
  67 |       <FileTree
  68 |         files={fs.files}
  69 |         onDirClick={(dir) => fs.cd(dir.path)}
  70 |         onFileClick={(file) => {
  71 |           if (mode === 'file') {
  72 |              onSelect(file.path);
  73 |              toggle();
  74 |           }
  75 |         }}
  76 |       />
  77 | 
  78 |       {/* Show Footer ONLY for Directory Mode */}
  79 |       {mode === 'directory' && (
  80 |         <Footer>
  81 |           <Button onClick={toggle}>Cancel</Button>
  82 |           <Button $primary onClick={handleConfirmDirectory}>
  83 |             Select Current Folder
  84 |           </Button>
  85 |         </Footer>
  86 |       )}
  87 |     </Modal>
  88 |   );
  89 | };
</file>

<file path="G:/Lesgo Coding Projects/axon/client-axon/src/components/FileViewer/FileViewer.tsx">
   1 | import { useEffect, useState } from 'react';
   2 | import styled from 'styled-components';
   3 | import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
   4 | import ts from 'react-syntax-highlighter/dist/esm/languages/hljs/typescript';
   5 | import rust from 'react-syntax-highlighter/dist/esm/languages/hljs/rust';
   6 | import { vs2015 } from 'react-syntax-highlighter/dist/esm/styles/hljs'; // VS Code Dark Theme
   7 | import { useAxonCore } from '@features/axon/useAxonCore';
   8 | import { VscLoading } from 'react-icons/vsc';
   9 | 
  10 | SyntaxHighlighter.registerLanguage('typescript', ts);
  11 | SyntaxHighlighter.registerLanguage('rust', rust);
  12 | 
  13 | const Container = styled.div`
  14 |   display: flex;
  15 |   flex-direction: column;
  16 |   height: 100%;
  17 |   overflow: hidden;
  18 |   background: #1e1e1e;
  19 | `;
  20 | 
  21 | const ScrollArea = styled.div`
  22 |   flex: 1;
  23 |   overflow: auto;
  24 |   font-size: 12px;
  25 |   
  26 |   /* Custom scrollbar for code */
  27 |   &::-webkit-scrollbar { width: 10px; height: 10px; }
  28 |   &::-webkit-scrollbar-thumb { background: #444; border-radius: 0; }
  29 | `;
  30 | 
  31 | const MetaBar = styled.div`
  32 |   padding: 8px;
  33 |   background: ${({ theme }) => theme.colors.bg.surface};
  34 |   border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  35 |   font-size: 11px;
  36 |   color: ${({ theme }) => theme.colors.text.muted};
  37 |   display: flex;
  38 |   gap: 12px;
  39 | `;
  40 | 
  41 | interface FileViewerProps {
  42 |   path: string;
  43 | }
  44 | 
  45 | export const FileViewer = ({ path }: FileViewerProps) => {
  46 |   const { readFile } = useAxonCore();
  47 |   const [content, setContent] = useState<string>('');
  48 |   const [loading, setLoading] = useState(false);
  49 |   const [error, setError] = useState<string | null>(null);
  50 | 
  51 |   useEffect(() => {
  52 |     let active = true;
  53 |     
  54 |     const load = async () => {
  55 |       setLoading(true);
  56 |       setError(null);
  57 |       setContent(''); // Clear previous content immediately
  58 |       
  59 |       try {
  60 |         const text = await readFile(path);
  61 |         if (active) setContent(text);
  62 |       } catch (err) {
  63 |         if (active) setError("Could not read file content.");
  64 |       } finally {
  65 |         if (active) setLoading(false);
  66 |       }
  67 |     };
  68 | 
  69 |     if (path) load();
  70 |     return () => { active = false; };
  71 |   }, [path, readFile]);
  72 | 
  73 |   if (loading) return <div style={{padding: 20, textAlign: 'center'}}><VscLoading className="spin" /> Loading...</div>;
  74 |   if (error) return <div style={{padding: 20, color: 'salmon'}}>{error}</div>;
  75 | 
  76 |   return (
  77 |     <Container>
  78 |       <MetaBar>
  79 |         <span>PATH: {path}</span>
  80 |         <span>LINES: {content.split('\n').length}</span>
  81 |       </MetaBar>
  82 |       <ScrollArea>
  83 |         <SyntaxHighlighter 
  84 |           language="typescript" // You can auto-detect ext later
  85 |           style={vs2015}
  86 |           showLineNumbers={true}
  87 |           customStyle={{ margin: 0, padding: '16px', background: 'transparent' }}
  88 |           lineNumberStyle={{ opacity: 0.3, minWidth: '30px' }}
  89 |         >
  90 |           {content}
  91 |         </SyntaxHighlighter>
  92 |       </ScrollArea>
  93 |     </Container>
  94 |   );
  95 | };
</file>

<file path="G:/Lesgo Coding Projects/axon/client-axon/src/components/ui/Modal.tsx">
   1 | import React from 'react';
   2 | import styled from 'styled-components';
   3 | import { createPortal } from 'react-dom';
   4 | import { Surface } from './Surface';
   5 | import { VscClose } from 'react-icons/vsc';
   6 | 
   7 | const Backdrop = styled.div`
   8 |   position: fixed;
   9 |   top: 0; left: 0; right: 0; bottom: 0;
  10 |   background-color: rgba(0, 0, 0, 0.6); /* Dimmed background */
  11 |   backdrop-filter: blur(2px); /* Glassmorphism effect */
  12 |   display: flex;
  13 |   align-items: center;
  14 |   justify-content: center;
  15 |   z-index: 9999;
  16 |   animation: fadeIn 0.2s ease-out;
  17 | 
  18 |   @keyframes fadeIn {
  19 |     from { opacity: 0; }
  20 |     to { opacity: 1; }
  21 |   }
  22 | `;
  23 | 
  24 | const ModalContainer = styled(Surface)`
  25 |   min-width: 500px;
  26 |   max-width: 80vw;
  27 |   max-height: 85vh;
  28 |   display: flex;
  29 |   flex-direction: column;
  30 |   box-shadow: 0 20px 50px rgba(0,0,0,0.5);
  31 |   animation: slideUp 0.2s ease-out;
  32 | 
  33 |   @keyframes slideUp {
  34 |     from { transform: translateY(20px); opacity: 0; }
  35 |     to { transform: translateY(0); opacity: 1; }
  36 |   }
  37 | `;
  38 | 
  39 | const Header = styled.div`
  40 |   display: flex;
  41 |   justify-content: space-between;
  42 |   align-items: center;
  43 |   padding-bottom: ${({ theme }) => theme.spacing(3)};
  44 |   border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  45 |   margin-bottom: ${({ theme }) => theme.spacing(3)};
  46 | `;
  47 | 
  48 | const Title = styled.h3`
  49 |   margin: 0;
  50 |   font-size: ${({ theme }) => theme.typography.sizes.lg};
  51 |   color: ${({ theme }) => theme.colors.text.primary};
  52 | `;
  53 | 
  54 | const CloseButton = styled.button`
  55 |   background: transparent;
  56 |   border: none;
  57 |   color: ${({ theme }) => theme.colors.text.secondary};
  58 |   cursor: pointer;
  59 |   font-size: 20px;
  60 |   display: flex;
  61 |   align-items: center;
  62 |   
  63 |   &:hover { color: ${({ theme }) => theme.colors.text.primary}; }
  64 | `;
  65 | 
  66 | const Body = styled.div`
  67 |   flex: 1;
  68 |   overflow-y: auto; /* Scroll internally if content is long */
  69 | `;
  70 | 
  71 | 
  72 | interface ModalProps {
  73 |   isOpen: boolean;
  74 |   onClose: () => void;
  75 |   title?: string;
  76 |   children: React.ReactNode;
  77 | }
  78 | 
  79 | export const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  80 |   if (!isOpen) return null;
  81 | 
  82 |   return createPortal(
  83 |     <Backdrop onClick={onClose}>
  84 |       <ModalContainer 
  85 |         $variant="surface" 
  86 |         $padding={4} 
  87 |         onClick={(e) => e.stopPropagation()} // Don't close when clicking inside
  88 |       >
  89 |         <Header>
  90 |           <Title>{title}</Title>
  91 |           <CloseButton onClick={onClose}>
  92 |             <VscClose />
  93 |           </CloseButton>
  94 |         </Header>
  95 |         <Body>
  96 |           {children}
  97 |         </Body>
  98 |       </ModalContainer>
  99 |     </Backdrop>,
 100 |     document.body
 101 |   );
 102 | };
</file>

<file path="G:/Lesgo Coding Projects/axon/client-axon/src/components/ui/Surface.tsx">
   1 | import styled from 'styled-components';
   2 | 
   3 | interface SurfaceProps {
   4 |   $variant?: 'main' | 'surface' | 'overlay';
   5 |   $padding?: number;
   6 |   $radius?: 'sm' | 'md' | 'lg' | 'none';
   7 |   $border?: boolean;
   8 | }
   9 | 
  10 | export const Surface = styled.div<SurfaceProps>`
  11 |   background-color: ${({ theme, $variant = 'surface' }) => theme.colors.bg[$variant]};
  12 |   padding: ${({ theme, $padding = 2 }) => theme.spacing($padding)};
  13 |   border-radius: ${({ theme, $radius = 'md' }) => 
  14 |     $radius === 'none' ? '0' : theme.borderRadius[$radius]};
  15 |   border: ${({ theme, $border }) => 
  16 |     $border ? `1px solid ${theme.colors.border}` : 'none'};
  17 |   
  18 |   color: ${({ theme }) => theme.colors.text.primary};
  19 |   transition: background-color 0.2s ease, border-color 0.2s ease;
  20 | `;
</file>

<file path="G:/Lesgo Coding Projects/axon/client-axon/src/components/ui/Typography.tsx">
   1 | import styled from 'styled-components';
   2 | 
   3 | export const Heading = styled.h2`
   4 |   color: ${({ theme }) => theme.colors.text.primary};
   5 |   font-size: ${({ theme }) => theme.typography.sizes.xl};
   6 |   font-weight: 600;
   7 |   margin-bottom: ${({ theme }) => theme.spacing(2)};
   8 | `;
   9 | 
  10 | export const Subtext = styled.span`
  11 |   color: ${({ theme }) => theme.colors.text.muted};
  12 |   font-size: ${({ theme }) => theme.typography.sizes.sm};
  13 | `;
</file>

<file path="G:/Lesgo Coding Projects/axon/client-axon/src/features/axon/useAxonCore.ts">
   1 | import { useCallback } from 'react';
   2 | import { invoke } from '@tauri-apps/api/core';
   3 | import type { 
   4 |   PromptOptions, 
   5 |   ScanParams, 
   6 |   ScanResponse, 
   7 |   GroupRequest 
   8 | } from '@axon-types/axonTypes'; // Adjust path if you named the file axonCore.ts
   9 | 
  10 | 
  11 | interface PromptParams {
  12 |   projectRoot: string;
  13 |   entryPoint: string;
  14 |   depth: number;
  15 |   options: PromptOptions;
  16 | }
  17 | 
  18 | interface CombinedPromptParams {
  19 |   projectRoot: string;
  20 |   groups: GroupRequest[]; // 👈 Matches the Rust "Vec<GroupRequest>" exactly
  21 |   options: PromptOptions;
  22 | }
  23 | 
  24 | export const useAxonCore = () => {
  25 | 
  26 |   const scanGroup = useCallback(async (params: ScanParams): Promise<ScanResponse> => {
  27 |     try {
  28 |       const result = await invoke<ScanResponse>('scan_workspace_group', {
  29 |         groupId: params.groupId,
  30 |         projectRoot: params.projectRoot,
  31 |         entryPoint: params.entryPoint,
  32 |         depth: params.depth,
  33 |         flatten: params.flatten, // ⚠️ Rust command arg is 'flatten'
  34 |       });
  35 |       console.log(result)
  36 |       return result
  37 |     } catch (error) {
  38 |       console.error(`[AxonCore] Scan Failed for ${params.groupId}:`, error);
  39 |       throw error;
  40 |     }
  41 |   }, []);
  42 | 
  43 |   const listFiles = useCallback(async (path: string) => {
  44 |     return await invoke<any[]>('list_files', { path });
  45 |   }, []);
  46 | 
  47 |   const readFile = useCallback(async (path: string) => {
  48 |     return await invoke<string>('read_file_content', { path });
  49 |   }, []);
  50 | 
  51 |   const generateGroupPrompt = useCallback(async (params: PromptParams) => {
  52 |     return await invoke<string>('generate_group_prompt', {
  53 |       projectRoot: params.projectRoot,
  54 |       entryPoint: params.entryPoint,
  55 |       depth: params.depth,
  56 |       options: params.options,
  57 |     });
  58 |   }, []);
  59 | 
  60 |   const generateCombinedPrompt = useCallback(async (params: CombinedPromptParams) => {
  61 |     return await invoke<string>('generate_combined_prompt', {
  62 |       projectRoot: params.projectRoot,
  63 |       groups: params.groups, 
  64 |       options: params.options,
  65 |     });
  66 |   }, []);
  67 | 
  68 |   return {
  69 |     scanGroup,
  70 |     listFiles,
  71 |     readFile,
  72 |     generateGroupPrompt,
  73 |     generateCombinedPrompt
  74 |   };
  75 | };
</file>

<file path="G:/Lesgo Coding Projects/axon/client-axon/src/features/axon/useFileSystem.ts">
   1 | import { useState, useCallback, useRef } from 'react';
   2 | import { useAxonCore } from './useAxonCore';
   3 | 
   4 | interface FileSystemState {
   5 |   currentPath: string | null;
   6 |   files: any[];
   7 |   isLoading: boolean;
   8 |   error: string | null;
   9 | }
  10 | 
  11 | export const useFileSystem = (initialPath: string | null) => {
  12 |   const { listFiles } = useAxonCore();
  13 |   
  14 |   const [state, setState] = useState<FileSystemState>({
  15 |     currentPath: initialPath, 
  16 |     files: [],
  17 |     isLoading: false,
  18 |     error: null
  19 |   });
  20 | 
  21 |   const activeRequest = useRef<string | null>(null);
  22 | 
  23 |   const cd = useCallback(async (targetPath: string) => {
  24 |     setState(prev => ({ 
  25 |       ...prev, 
  26 |       currentPath: targetPath, 
  27 |       isLoading: true, 
  28 |       error: null 
  29 |     }));
  30 | 
  31 |     activeRequest.current = targetPath;
  32 | 
  33 |     try {
  34 |       const result = await listFiles(targetPath);
  35 |     
  36 |       if (activeRequest.current !== targetPath) return;
  37 | 
  38 |       const sorted = result.sort((a: any, b: any) => 
  39 |          Number(b.is_dir) - Number(a.is_dir) || a.name.localeCompare(b.name)
  40 |       );
  41 | 
  42 |       setState(prev => ({ 
  43 |         ...prev, 
  44 |         files: sorted, 
  45 |         isLoading: false 
  46 |       }));
  47 | 
  48 |     } catch (err) {
  49 |       if (activeRequest.current !== targetPath) return;
  50 |       
  51 |       console.error("FS Error", err);
  52 |       setState(prev => ({ 
  53 |         ...prev, 
  54 |         isLoading: false, 
  55 |         error: "Failed to load directory" 
  56 |       }));
  57 |     }
  58 |   }, [listFiles]);
  59 | 
  60 |   const navigateUp = useCallback(() => {
  61 |     if (!state.currentPath) return;
  62 |     const parent = state.currentPath.split(/[/\\]/).slice(0, -1).join('/');
  63 |     cd(parent || state.currentPath); 
  64 |   }, [state.currentPath, cd]);
  65 | 
  66 |   const refresh = useCallback(() => {
  67 |     if (state.currentPath) cd(state.currentPath);
  68 |   }, [state.currentPath, cd]);
  69 | 
  70 |   return {
  71 |     ...state, 
  72 |     cd,      
  73 |     navigateUp,
  74 |     refresh
  75 |   };
  76 | };
</file>

<file path="G:/Lesgo Coding Projects/axon/client-axon/src/features/theme/themeSlice.ts">
   1 | import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
   2 | import { type RootState } from '@app/store';
   3 | import { darkTheme, lightTheme } from '@theme/themes'; 
   4 | import { type AxonTheme } from '@axon-types/themeTypes';
   5 | 
   6 | interface ThemeState {
   7 |   mode: 'light' | 'dark';
   8 | }
   9 | 
  10 | const getInitialMode = (): 'light' | 'dark' => {
  11 |   const saved = localStorage.getItem('axon-theme');
  12 |   if (saved === 'light' || saved === 'dark') return saved;
  13 |   return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  14 | };
  15 | 
  16 | const initialState: ThemeState = {
  17 |   mode: getInitialMode(),
  18 | };
  19 | 
  20 | const themeSlice = createSlice({
  21 |   name: 'theme',
  22 |   initialState,
  23 |   reducers: {
  24 |     toggleTheme: (state) => {
  25 |       state.mode = state.mode === 'light' ? 'dark' : 'light';
  26 |       localStorage.setItem('axon-theme', state.mode);
  27 |     },
  28 |     setThemeMode: (state, action: PayloadAction<'light' | 'dark'>) => {
  29 |       state.mode = action.payload;
  30 |       localStorage.setItem('axon-theme', state.mode);
  31 |     },
  32 |   },
  33 | });
  34 | 
  35 | export const { toggleTheme, setThemeMode } = themeSlice.actions;
  36 | 
  37 | 
  38 | export const selectThemeMode = (state: RootState) => state.theme.mode;
  39 | 
  40 | export const selectCurrentTheme = (state: RootState): AxonTheme => {
  41 |   return state.theme.mode === 'dark' ? darkTheme : lightTheme;
  42 | };
  43 | 
  44 | export default themeSlice.reducer;
</file>

<file path="G:/Lesgo Coding Projects/axon/client-axon/src/features/workspace/useWorkspace.ts">
   1 | import { useCallback } from "react";
   2 | import { useAppDispatch, useAppSelector } from "@app/hooks";
   3 | import {
   4 |   selectActiveRoot,
   5 |   selectActiveScanConfig,
   6 |   selectActiveWorkspace,
   7 |   updateScanConfig,
   8 |   updateGlobalOptions,
   9 |   type WorkspaceData,
  10 | } from "./workspacesSlice";
  11 | import type { ScanConfig } from "@axon-types/workspaceTypes";
  12 | 
  13 | export const useWorkspace = () => {
  14 |   const dispatch = useAppDispatch();
  15 | 
  16 |   const projectRoot = useAppSelector(selectActiveRoot);
  17 |   const scanConfig = useAppSelector(selectActiveScanConfig);
  18 |   const fullConfig = useAppSelector(selectActiveWorkspace);
  19 | 
  20 |   const setScan = useCallback(
  21 |     (patch: Partial<ScanConfig>) => {
  22 |       dispatch(updateScanConfig(patch));
  23 |     },
  24 |     [dispatch],
  25 |   );
  26 | 
  27 |   const setOptions = useCallback(
  28 |     (options: Partial<WorkspaceData["globalOptions"]>) => {
  29 |       dispatch(updateGlobalOptions(options));
  30 |     },
  31 |     [dispatch],
  32 |   );
  33 | 
  34 |   const workspaceId = fullConfig?.id;
  35 | 
  36 |   return {
  37 |     isActive: !!projectRoot,
  38 |     workspaceId,
  39 |     projectRoot,
  40 | 
  41 |     scanConfig,
  42 | 
  43 |     config: fullConfig?.globalOptions,
  44 | 
  45 |     setScan,
  46 |     setOptions,
  47 |   };
  48 | };
</file>

<file path="G:/Lesgo Coding Projects/axon/client-axon/src/features/workspace/workspacesSlice.ts">
   1 | import {
   2 |   createSlice,
   3 |   createEntityAdapter,
   4 |   type PayloadAction,
   5 |   nanoid,
   6 | } from "@reduxjs/toolkit";
   7 | import { type RootState } from "@app/store";
   8 | import type { PromptOptions } from "@axon-types/axonTypes";
   9 | import type { ScanConfig } from "@axon-types/workspaceTypes";
  10 | 
  11 | export interface WorkspaceData {
  12 |   id: string;
  13 |   name: string;
  14 |   projectRoot: string;
  15 |   lastOpened: string;
  16 | 
  17 |   /** Single-scan settings for this workspace. */
  18 |   scan: ScanConfig;
  19 | 
  20 |   /** Prompt generation options (rules, stripping, skeletons, etc.). */
  21 |   globalOptions: PromptOptions;
  22 | 
  23 |   /** Selected node id in the graph (file node only). */
  24 |   selectedNodeId: string | null;
  25 | }
  26 | 
  27 | const workspacesAdapter = createEntityAdapter<WorkspaceData>({
  28 |   sortComparer: (a, b) => b.lastOpened.localeCompare(a.lastOpened),
  29 | });
  30 | 
  31 | const initialState = workspacesAdapter.getInitialState({
  32 |   activeId: null as string | null,
  33 | });
  34 | 
  35 | const defaultPromptOptions: PromptOptions = {
  36 |   skeletonMode: "stripOnly",
  37 |   redactions: [],
  38 |   removeComments: true,
  39 |   showLineNumbers: true,
  40 |   skeletonTargets: [],
  41 | };
  42 | 
  43 | const defaultScanConfig: ScanConfig = {
  44 |   entryPoint: "",
  45 |   depth: 3,
  46 |   flatten: true,
  47 | };
  48 | 
  49 | const workspacesSlice = createSlice({
  50 |   name: "workspaces",
  51 |   initialState,
  52 |   reducers: {
  53 |     createWorkspace: {
  54 |       reducer: (state, action: PayloadAction<WorkspaceData>) => {
  55 |         workspacesAdapter.addOne(state, action.payload);
  56 |         state.activeId = action.payload.id;
  57 |       },
  58 |       prepare: (name: string, root: string) => {
  59 |         const id = nanoid();
  60 |         return {
  61 |           payload: {
  62 |             id,
  63 |             name,
  64 |             projectRoot: root,
  65 |             lastOpened: new Date().toISOString(),
  66 |             scan: { ...defaultScanConfig },
  67 |             globalOptions: { ...defaultPromptOptions },
  68 |             selectedNodeId: null,
  69 |           } as WorkspaceData,
  70 |         };
  71 |       },
  72 |     },
  73 | 
  74 |     setSelectedNode: (state, action: PayloadAction<string | null>) => {
  75 |       if (state.activeId && state.entities[state.activeId]) {
  76 |         state.entities[state.activeId]!.selectedNodeId = action.payload;
  77 |       }
  78 |     },
  79 | 
  80 |     deleteWorkspace: (state, action: PayloadAction<string>) => {
  81 |       workspacesAdapter.removeOne(state, action.payload);
  82 |       if (state.activeId === action.payload) {
  83 |         state.activeId = null;
  84 |       }
  85 |     },
  86 | 
  87 |     setActiveWorkspace: (state, action: PayloadAction<string>) => {
  88 |       workspacesAdapter.updateOne(state, {
  89 |         id: action.payload,
  90 |         changes: { lastOpened: new Date().toISOString() },
  91 |       });
  92 |       state.activeId = action.payload;
  93 |     },
  94 | 
  95 |     updateScanConfig: (state, action: PayloadAction<Partial<ScanConfig>>) => {
  96 |       if (!state.activeId) return;
  97 |       const ws = state.entities[state.activeId];
  98 |       if (!ws) return;
  99 | 
 100 |       ws.scan = { ...ws.scan, ...action.payload };
 101 |     },
 102 | 
 103 |     updateGlobalOptions: (
 104 |       state,
 105 |       action: PayloadAction<Partial<WorkspaceData["globalOptions"]>>,
 106 |     ) => {
 107 |       if (state.activeId && state.entities[state.activeId]) {
 108 |         const ws = state.entities[state.activeId]!;
 109 |         ws.globalOptions = { ...ws.globalOptions, ...action.payload };
 110 |       }
 111 |     },
 112 |   },
 113 | });
 114 | 
 115 | export const {
 116 |   createWorkspace,
 117 |   deleteWorkspace,
 118 |   setActiveWorkspace,
 119 |   setSelectedNode,
 120 |   updateScanConfig,
 121 |   updateGlobalOptions,
 122 | } = workspacesSlice.actions;
 123 | 
 124 | export default workspacesSlice.reducer;
 125 | 
 126 | export const {
 127 |   selectAll: selectAllWorkspaces,
 128 |   selectById: selectWorkspaceById,
 129 | } = workspacesAdapter.getSelectors<RootState>((state) => state.workspaces);
 130 | 
 131 | export const selectActiveId = (state: RootState) => state.workspaces.activeId;
 132 | 
 133 | export const selectActiveWorkspace = (state: RootState) => {
 134 |   const id = state.workspaces.activeId;
 135 |   return id ? state.workspaces.entities[id] : null;
 136 | };
 137 | 
 138 | export const selectActiveScanConfig = (state: RootState) =>
 139 |   selectActiveWorkspace(state)?.scan ?? null;
 140 | 
 141 | export const selectActiveRoot = (state: RootState) =>
 142 |   selectActiveWorkspace(state)?.projectRoot ?? null;
 143 | 
 144 | export const selectSelectedNodeId = (state: RootState) =>
 145 |   selectActiveWorkspace(state)?.selectedNodeId ?? null;
</file>

<file path="G:/Lesgo Coding Projects/axon/client-axon/src/types/axonTypes.ts">
   1 | import type { Node } from "@xyflow/react";
   2 | import type { CSSProperties } from "react";
   3 | 
   4 | export interface Position {
   5 |   x: number;
   6 |   y: number;
   7 | }
   8 | 
   9 | /**
  10 |  * Data associated with a File Node.
  11 |  * Matches the Rust `NodeData` struct.
  12 |  */
  13 | export interface FileNodeData {
  14 |   label: string;
  15 |   path: string;
  16 |   definitions: string[];
  17 |   calls: string[];
  18 |   [key: string]: any;
  19 | }
  20 | 
  21 | /**
  22 |  * Data associated with a Folder Group Node.
  23 |  * Frontend-generated grouping based on each file's directory.
  24 |  */
  25 | export interface GroupNodeData {
  26 |   /** Display label (usually the folder path). */
  27 |   label: string;
  28 |   /** Folder path represented by this group (relative or absolute, depending on backend output). */
  29 |   folderPath: string;
  30 |   /** Optional count of file nodes inside the group. */
  31 |   fileCount?: number;
  32 |   [key: string]: any;
  33 | }
  34 | 
  35 | export type AxonNode = Node<FileNodeData | GroupNodeData, "fileNode" | "groupNode">;
  36 | 
  37 | export interface AxonEdge {
  38 |   id: string;
  39 |   source: string;
  40 |   target: string;
  41 | 
  42 |   /** React Flow handle ids (e.g. FileNode has `in` + `out`). */
  43 |   sourceHandle?: string;
  44 |   targetHandle?: string;
  45 | 
  46 |   label?: string;
  47 |   animated?: boolean;
  48 |   style?: CSSProperties;
  49 |   type?: string;
  50 | 
  51 |   /** Optional extra metadata for edge renderers. */
  52 |   data?: Record<string, any>;
  53 | 
  54 |   markerEnd?: any;
  55 |   markerStart?: any;
  56 |   className?: string;
  57 | }
  58 | 
  59 | /**
  60 |  * Matches the `PromptOptions` struct in Rust.
  61 |  * Used for generate_group_prompt and generate_combined_prompt.
  62 |  */
  63 | export interface PromptOptions {
  64 |   showLineNumbers: boolean;
  65 |   removeComments: boolean;
  66 |   redactions: string[];
  67 | 
  68 |   skeletonMode: string;
  69 |   skeletonTargets: string[];
  70 | }
  71 | 
  72 | /**
  73 |  * Request payload for scanning a workspace from a single entrypoint.
  74 |  */
  75 | export interface ScanParams {
  76 |   /** A stable id for the scan (we use workspace id on the frontend). */
  77 |   groupId: string;
  78 |   projectRoot: string;
  79 |   entryPoint: string;
  80 |   depth: number;
  81 |   flatten: boolean;
  82 | }
  83 | 
  84 | /**
  85 |  * Request payload for combining multiple groups (we use a single group in the new flow).
  86 |  */
  87 | export interface GroupRequest {
  88 |   entryPoint: string;
  89 |   depth: number;
  90 |   flatten: boolean;
  91 | }
  92 | 
  93 | /**
  94 |  * The raw response from the Rust `scan_workspace_group` command
  95 |  */
  96 | export interface ScanResponse {
  97 |   nodes: AxonNode[];
  98 |   edges: AxonEdge[];
  99 | }
</file>

<file path="G:/Lesgo Coding Projects/axon/client-axon/src/types/workspaceTypes.ts">
   1 | export type SkeletonMode = "all" | "keepOnly" | "stripOnly";
   2 | 
   3 | /**
   4 |  * Scan settings for the current workspace.
   5 |  * The app performs a single scan from `entryPoint` up to `depth`.
   6 |  */
   7 | export interface ScanConfig {
   8 |   entryPoint: string;
   9 |   depth: number;
  10 |   /**
  11 |    * Passed to the Rust scanner. If true, the backend may flatten directory structure.
  12 |    * Folder grouping in the UI still uses the returned file paths.
  13 |    */
  14 |   flatten: boolean;
  15 | }
  16 | 
  17 | /**
  18 |  * Legacy types (kept for backward compatibility with older notes/components).
  19 |  * If you no longer need them, feel free to remove.
  20 |  */
  21 | export interface WorkspaceState {
  22 |   id: string;
  23 |   name: string;
  24 |   projectRoot: string;
  25 |   tsConfigPath: string | null;
  26 |   selectedGroupId: string | null;
  27 | 
  28 |   skeletonMode: SkeletonMode;
  29 |   redactions: string[];
  30 |   skeletonTargets: string[];
  31 | 
  32 |   showLineNumbers: boolean;
  33 |   removeComments: boolean;
  34 | }
</file>

