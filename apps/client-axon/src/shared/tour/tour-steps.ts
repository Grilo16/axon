import type { AppDispatch } from "@app/store";
import { viewFile } from "@features/core/workspace/workspace-ui-slice";
import type { DriveStep } from "driver.js";

const waitForElement = (selector: string): Promise<Element> => {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector)!);
    }
    const observer = new MutationObserver(() => {
      if (document.querySelector(selector)) {
        observer.disconnect();
        resolve(document.querySelector(selector)!);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  });
};

export const getTourSteps = (driverObj: any, dispatch: AppDispatch): DriveStep[] => [
  // STEP 1: OPEN FOLDER
  {
    element: "#tour-explorer-demo-folder",
    popover: {
      title: "Welcome to Axon 🧠",
      description: "Let's map out this codebase. Click the arrow next to the 'src' folder to peek inside.",
      side: "right",
      align: "start",
      showButtons: ["close"], 
    },
    onHighlighted: (el) => {
      if (!el) return;
      const advanceTour = async () => {
        el.removeEventListener("click", advanceTour);
        await waitForElement("#tour-explorer-row-src");
        driverObj.moveNext();
      };
      el.addEventListener("click", advanceTour);
    },
  },

  // STEP 2: ADD TO GRAPH
  {
    element: "#tour-explorer-row-src",
    popover: {
      title: "Build the Architecture",
      description: "Click the glowing '+' icon to drop the entire 'src' folder and its children onto the graph canvas.",
      side: "right",
      align: "center",
      showButtons: ["close"],
    },
    onHighlighted: (el) => {
      if (!el) return;
      const addButton = el.querySelector(".tour-add-btn");
      if (!addButton) return;
      const advanceTour = () => {
        driverObj.moveNext();
        addButton.removeEventListener("click", advanceTour);
      };
      addButton.addEventListener("click", advanceTour);
    },
  },

  // STEP 3: GRAPH BASICS
  {
    element: "#tour-graph-canvas",
    popover: {
      title: "The Graph Matrix",
      description: "Boom! You can drag nodes, zoom, and see connections. Click a node to select it (Ctrl+Click for multiple). Hit 'Delete' or 'Backspace' to remove things you don't need.",
      side: "left",
      align: "center",
      showButtons: ["next", "close"],
    },
  },


  // STEP 4: NODE-TO-NODE EXPANSION
  {
    element: "#tour-node-actions-imports",
    popover: {
      title: "Organic Expansion",
      description: "You can grow your graph directly from the canvas! Click the '+' icon on 'Imports' to automatically pull the files it depends on into your bundle.",
      side: "right",
      align: "center",
      showButtons: ["close"], 
    },
    onHighlighted: (el) => {
      if (!el) return;
      const addBtn = el.querySelector("button"); 
      if (!addBtn) return;
      const advanceTour = async () => { 
        addBtn.removeEventListener("click", advanceTour); 
        driverObj.moveNext(); 
      };
      addBtn.addEventListener("click", advanceTour);
    }
  },
    // STEP 4.5: Note barrel export
  {
    element: "#tour-graph-canvas",
    popover: {
      title: "The Graph Matrix",
      description: "Our graph has picked up noisy barrel exports, lets hide them to get a better view of the architecture",
      side: "left",
      align: "center",
      showButtons: ["next", "close"],
    },
  },

  // STEP 5: HIDE BARRELS
  {
    element: "#tour-hide-barrels-toggle",
    popover: {
      title: "Cut the Noise",
      description: "LLMs get confused by routing files. Notice those 'index.ts' nodes? Click 'Hide Barrels' to instantly filter out export files and reveal the true architecture.",
      side: "bottom",
      align: "center",
      showButtons: ["close"],
    },
    onHighlighted: (el) => {
      if (!el) return;
      const advanceTour = () => {
        driverObj.moveNext();
        el.removeEventListener("click", advanceTour);
      };
      el.addEventListener("click", advanceTour);
    },
  },

  // STEP 6: DOUBLE CLICK TO OPEN FILE
  {
    element: '[data-id="axon-tutorial/src/app.tsx"]', 
    popover: {
      title: "Inspect the Code",
      description: "Need to see what's actually inside? Double-click this node to open the File Viewer and inspect the raw source code.",
      side: "right",
      align: "center",
      showButtons: ["close"],
    },
    onHighlighted: (el) => {
      if (!el) return;
      let tracking = true;
      const trackElement = () => {
        if (!tracking) return;
        driverObj.refresh(); 
        requestAnimationFrame(trackElement);
      };
      trackElement();
      setTimeout(() => { tracking = false; }, 1500); 

      const advanceTour = async () => { 
        tracking = false; 
        dispatch(viewFile("axon-tutorial/src/app.tsx")); 
        
        // 🌟 Wait for the Code Viewer to mount before advancing!
        await waitForElement("#tour-code-viewer");
        driverObj.moveNext(); 
        el.removeEventListener("dblclick", advanceTour); 
      };
      
      el.addEventListener("dblclick", advanceTour);
    }
  },

  // 🌟 NEW STEP 7: SHOW THE CODE VIEWER
  {
    element: "#tour-code-viewer",
    popover: {
      title: "The Code Matrix",
      description: "Here is the raw source code. From here, you can inspect the file, review its symbols, and prepare it for export.",
      side: "left",
      align: "center",
      showButtons: ["next", "close"],
    },
  },
  
  // STEP 8: GENERATE CONTEXT
  {
    element: "#tour-generate-context-btn",
    popover: {
      title: "The Magic Trick",
      description: "Once your architecture is perfectly sliced, it's time to export. Click 'Generate Context' to compile this graph into token-optimized LLM markdown.",
      side: "bottom",
      align: "end",
      showButtons: ["close"],
    },
    onHighlighted: (el) => {
      if (!el) return;
      const advanceTour = async () => {
        el.removeEventListener("click", advanceTour);
        // 🌟 Ensure code viewer is ready for the generated markdown view
        await waitForElement("#tour-code-viewer");
        driverObj.moveNext();
      };
      el.addEventListener("click", advanceTour);
    },
  },

  // 🌟 NEW STEP 9: SHOW GENERATED MARKDOWN
  {
    element: "#tour-code-viewer",
    popover: {
      title: "LLM-Ready Context",
      description: "Axon just bundled your graph into perfect, token-optimized markdown. It's clean, structured, and ready to be pasted into ChatGPT or Claude.",
      side: "left",
      align: "center",
      showButtons: ["next", "close"],
    },
  },

  // STEP 10: THE REDACTION ENGINE
  {
    element: ".tour-symbol-row-first", 
    popover: {
      title: "The Redaction Engine",
      description: "Wait, we don't want to send our secret logic to an LLM! Click the glowing 👁️ (Hide) icon on this symbol to strip it out.",
      side: "left",
      align: "center",
      showButtons: ["close"],
    },
    onHighlighted: (el) => {
      if (!el) return;
      const hideBtn = el.querySelector(".tour-symbol-hide-btn"); 
      if (!hideBtn) return;
      
      const advanceTour = async () => { 
        hideBtn.removeEventListener("click", advanceTour); 
        // 🌟 Give the UI a split second to re-generate the redacted markdown
        await new Promise(res => setTimeout(res, 300));
        driverObj.moveNext(); 
      };
      hideBtn.addEventListener("click", advanceTour);
    }
  },

  // 🌟 NEW STEP 11: SHOW REDACTED RESULT
  {
    element: "#tour-code-viewer",
    popover: {
      title: "Poof. Gone. 💨",
      description: "Look closely at the generated markdown. The symbol's implementation has been completely stripped out, keeping your secrets safe while preserving the structural context.",
      side: "left",
      align: "center",
      showButtons: ["next", "close"],
    },
  },

  // STEP 12: BUNDLES & DOWNLOAD
  {
    element: "#tour-bundle-selector",
    popover: {
      title: "Multiple Bundles & Export",
      description: "This specific graph and its rules are saved as a 'Bundle'. You can create multiple bundles for different AI tasks, and download the final context file right here.",
      side: "bottom",
      align: "start",
      showButtons: ["next", "close"],
    },
  },

  // STEP 13: CTA
  {
    element: "#tour-sidebar-workspaces",
    popover: {
      title: "You're a Pro 🚀",
      description: "Feel free to explore the rest of this Demo workspace. But the real magic happens with your own code. Sign in to sync your GitHub repositories and supercharge your workflow!",
      side: "right",
      align: "start",
      showButtons: ["close", "next"],
      doneBtnText: "Start Building",
    },
  },
];