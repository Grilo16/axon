import { useAppDispatch } from "@app/store";
import { closeView } from "@features/core/workspace/workspace-ui-slice";

export const useCodeViewerActions = () => {
  const dispatch = useAppDispatch();

  return {
    closeViewer: () => dispatch(closeView()),
    copyToClipboard: async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        console.log("✅ Copied to clipboard");
      } catch (err) {
        console.error("❌ Failed to copy", err);
      }
    }
  };
};