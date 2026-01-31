import React, { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import styled from "styled-components";
import { useAxonCore } from "@features/axon/useAxonCore";

const EditorContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #1e1e1e;
`;

const FileHeader = styled.div`
  padding: 8px 15px;
  background: #252526;
  color: #969696;
  font-size: 12px;
  border-bottom: 1px solid #2b2b2b;
  display: flex;
  justify-content: space-between;
`;

interface CodeViewerProps {
  filePath: string | null;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({ filePath }) => {
  const [content, setContent] = useState<string>(
    "// Select a file to view code",
  );
  const [language, setLanguage] = useState<string>("javascript");
  const { readFile } = useAxonCore();
  useEffect(() => {
    if (filePath) {
      // 1. Determine language from extension
      const ext = filePath.split(".").pop()?.toLowerCase();
      const langMap: Record<string, string> = {
        js: "javascript",
        ts: "typescript",
        tsx: "typescript",
        rs: "rust",
        json: "json",
        html: "html",
        css: "css",
      };
      setLanguage(langMap[ext || ""] || "plaintext");

      // 2. Fetch content from Rust
      readFile(filePath)
        .then(setContent)
        .catch((err) => setContent(`Error reading file: ${err}`));
    }
  }, [filePath]);

  return (
    <EditorContainer>
      <FileHeader>
        <span>{filePath || "No file selected"}</span>
        <span>{language.toUpperCase()}</span>
      </FileHeader>
      <Editor
        height="100%"
        theme="vs-dark"
        language={language}
        value={content}
        options={{
          readOnly: true, // Axon is a viewer/analyzer first
          minimap: { enabled: true },
          fontSize: 14,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 10 },
        }}
      />
    </EditorContainer>
  );
};
