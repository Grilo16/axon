import type { AppDispatch } from "@core/store";
import { viewFile } from "@core/workspace/workspace-ui-slice";
import type { DriveStep, Driver } from "driver.js";
import type { MobileTab } from "@shared/hooks/use-mobile-tab";

/**
 * Wait for an element to appear in the DOM.
 * Resolves with the element, or null on timeout.
 */
const waitForElement = (selector: string, timeoutMs = 5000): Promise<Element | null> => {
  return new Promise((resolve) => {
    const existing = document.querySelector(selector);
    if (existing) return resolve(existing);

    const timeout = setTimeout(() => {
      observer.disconnect();
      resolve(null);
    }, timeoutMs);

    const observer = new MutationObserver(() => {
      const el = document.querySelector(selector);
      if (el) {
        clearTimeout(timeout);
        observer.disconnect();
        resolve(el);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  });
};

/** Wait one animation frame (lets React finish a re-render). */
const nextFrame = () => new Promise<void>((r) => requestAnimationFrame(() => r()));

interface TourOptions {
  driverObj: Driver;
  dispatch: AppDispatch;
  isMobile: boolean;
  switchTab?: (tab: MobileTab) => void;
}

/** Switch tab, wait for React to re-render, then wait for an element. */
const switchAndWait = async (
  switchTab: ((tab: MobileTab) => void) | undefined,
  tab: MobileTab,
  selector: string,
) => {
  switchTab?.(tab);
  await nextFrame();
  await waitForElement(selector);
};

export const getTourSteps = (driverObj: Driver, dispatch: AppDispatch): DriveStep[] =>
  buildTourSteps({ driverObj, dispatch, isMobile: false });

export const getMobileTourSteps = (
  driverObj: Driver,
  dispatch: AppDispatch,
  switchTab: (tab: MobileTab) => void,
): DriveStep[] =>
  buildTourSteps({ driverObj, dispatch, isMobile: true, switchTab });

/**
 * Which mobile tab each step requires.
 * null = no element (centered popover) or element is always visible.
 */
const STEP_TABS: (MobileTab | null)[] = [
  null,       // 0: welcome
  "explorer", // 1: open folder
  "explorer", // 2: add to graph
  "graph",    // 3: graph basics
  "graph",    // 4: node expansion
  "graph",    // 4.5: barrel note
  "bundler",    // 5: hide barrels
  "graph",    // 5.5: barrel result
  "graph",    // 6: open file (node lives on graph)
  "code",     // 7: code viewer
  "bundler",  // 8: generate context
  "code",     // 9: generated markdown
  "graph",    // 10: redaction engine (symbol row is on graph)
  "code",     // 11: redacted result
  "bundler",  // 12: bundles
  null,       // 13: CTA (top bar always visible)
];

const buildTourSteps = ({ driverObj, dispatch, isMobile, switchTab }: TourOptions): DriveStep[] => {

  /**
   * Switch to the next tab, wait for React to re-render, then advance.
   * Used in `onNextClick` for steps where the "Next" button crosses tabs.
   */
  const mobileNextClick = (nextTab: MobileTab) => {
    if (!isMobile) {
      driverObj.moveNext();
      return;
    }
    switchTab?.(nextTab);
    // Give React one frame to make the panel visible before driver reads dimensions
    setTimeout(() => driverObj.moveNext(), 100);
  };

  const steps: DriveStep[] = [
    // ── STEP 0: WELCOME ──────────────────────────────────────────────
    {
      popover: {
        title: "Welcome to Axon 🧠",
        description: "You are looking at a next-generation context curation engine. We are going to map an architecture, slice out the noise, and bundle it for an LLM in exactly 60 seconds. Ready?",
        align: "center",
        showButtons: ["next", "close"],
        nextBtnText: "Let's Go!!",
        onNextClick: () => mobileNextClick("explorer"),
      },
    },

    // ── STEP 1: OPEN FOLDER ──────────────────────────────────────────
    {
      element: "#tour-explorer-demo-folder",
      popover: {
        title: "The explorer",
        description: "Click the 'axon-tutorial' folder to peek inside. Let's map out this codebase.",
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

    // ── STEP 2: ADD TO GRAPH ─────────────────────────────────────────
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
        const advanceTour = async () => {
          addButton.removeEventListener("click", advanceTour);
          await waitForElement('[data-id="axon-tutorial/src/app.tsx"]', 10000);
          if (isMobile) {
            switchTab?.("graph");
            await nextFrame();
          }
          driverObj.moveNext();
        };
        addButton.addEventListener("click", advanceTour);
      },
    },

    // ── STEP 3: GRAPH BASICS ─────────────────────────────────────────
    {
      element: "#tour-graph-canvas",
      popover: {
        title: "The Graph Matrix",
        description: isMobile
          ? "Boom! Pinch to zoom, drag to pan. Tap a node to select it. Long-press a node to view its code."
          : "Boom! You can drag nodes, zoom, and see connections. Click a node to select it (Ctrl+Click for multiple). Hit 'Delete' or 'Backspace' to remove things you don't need.",
        side: "left",
        align: "center",
        showButtons: ["next", "close"],
      },
    },

    // ── STEP 4: NODE-TO-NODE EXPANSION ───────────────────────────────
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
      },
    },

    // ── STEP 4.5: NOTE BARREL EXPORT ─────────────────────────────────
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

    // ── STEP 5: HIDE BARRELS ─────────────────────────────────────────
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
          el.removeEventListener("click", advanceTour);
          driverObj.moveNext();
        };
        el.addEventListener("click", advanceTour);
      },
    },

    // ── STEP 5.5: BARREL RESULT ──────────────────────────────────────
    {
      element: "#tour-graph-canvas",
      popover: {
        title: "The Graph Matrix",
        description: "No more barrels in the graph",
        side: "left",
        align: "center",
        showButtons: ["next", "close"],
      },
    },

    // ── STEP 6: OPEN FILE ────────────────────────────────────────────
    {
      element: '[data-id="axon-tutorial/src/app.tsx"]',
      popover: {
        title: "Inspect the Code",
        description: isMobile
          ? "Need to see what's inside? Tap this node to open the File Viewer."
          : "Need to see what's actually inside? Double-click this node to open the File Viewer and inspect the raw source code.",
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

          if (isMobile) {
            await switchAndWait(switchTab, "code", "#tour-code-viewer");
          } else {
            await waitForElement("#tour-code-viewer");
          }
          driverObj.moveNext();
          el.removeEventListener(isMobile ? "click" : "dblclick", advanceTour);
        };

        el.addEventListener(isMobile ? "click" : "dblclick", advanceTour);
      },
    },

    // ── STEP 7: SHOW THE CODE VIEWER ─────────────────────────────────
    {
      element: "#tour-code-viewer",
      popover: {
        title: "The Code Matrix",
        description: "Here is the raw source code. From here, you can inspect the file, review its symbols, and prepare it for export.",
        side: "left",
        align: "center",
        showButtons: ["next", "close"],
        onNextClick: () => mobileNextClick("bundler"),
      },
    },

    // ── STEP 8: GENERATE CONTEXT ─────────────────────────────────────
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
          if (isMobile) {
            await switchAndWait(switchTab, "code", "#tour-code-viewer");
          } else {
            await waitForElement("#tour-code-viewer");
          }
          driverObj.moveNext();
        };
        el.addEventListener("click", advanceTour);
      },
    },

    // ── STEP 9: SHOW GENERATED MARKDOWN ──────────────────────────────
    {
      element: "#tour-code-viewer",
      popover: {
        title: "LLM-Ready Context",
        description: "Axon just bundled your graph into perfect, token-optimized markdown. It's clean, structured, and ready to be pasted into ChatGPT or Claude.",
        side: "left",
        align: "center",
        showButtons: ["next", "close"],
        onNextClick: () => mobileNextClick("graph"),
      },
    },

    // ── STEP 10: THE REDACTION ENGINE ────────────────────────────────
    {
      element: ".tour-symbol-row-first",
      popover: {
        title: "The Redaction Engine",
        description: "Wait, we don't want to send our secret logic to an LLM! Click the glowing eye (Hide) icon on this symbol to strip it out.",
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
          await new Promise(res => setTimeout(res, 300));
          if (isMobile) await switchAndWait(switchTab, "code", "#tour-code-viewer");
          driverObj.moveNext();
        };
        hideBtn.addEventListener("click", advanceTour);
      },
    },

    // ── STEP 11: SHOW REDACTED RESULT ────────────────────────────────
    {
      element: "#tour-code-viewer",
      popover: {
        title: "Poof. Gone.",
        description: "Look closely at the generated markdown. The symbol's implementation has been completely stripped out, keeping your secrets safe while preserving the structural context.",
        side: "left",
        align: "center",
        showButtons: ["next", "close"],
        onNextClick: () => mobileNextClick("bundler"),
      },
    },

    // ── STEP 12: BUNDLES & DOWNLOAD ──────────────────────────────────
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

    // ── STEP 13: CTA ─────────────────────────────────────────────────
    {
      element: "#tour-sidebar-workspaces",
      popover: {
        title: "You're a Pro",
        description: "Feel free to explore the rest of this Demo workspace. But the real magic happens with your own code. Sign in to sync your GitHub repositories and supercharge your workflow!",
        side: isMobile ? "bottom" : "right",
        align: "start",
        showButtons: ["close", "next"],
        doneBtnText: "Start Building",
      },
    },
  ];

  if (!isMobile) return steps;

  // On mobile, wrap each step with a safety-net retry mechanism.
  // Because all panels stay mounted (hidden with display:none), elements
  // exist in the DOM but may have zero dimensions until the tab is visible.
  // The wrapper switches tabs in onHighlightStarted, and retries the step
  // if driver.js couldn't properly highlight the element.
  return steps.map((step, index) => {
    const requiredTab = STEP_TABS[index];
    if (!requiredTab || !step.element) return step;

    const originalOnHighlighted = step.onHighlighted;
    let hasRetried = false;

    return {
      ...step,
      onHighlightStarted: () => {
        switchTab?.(requiredTab);
        hasRetried = false;
      },
      onHighlighted: (...args: Parameters<NonNullable<DriveStep["onHighlighted"]>>) => {
        const [el] = args;
        // Check the element is actually visible (non-zero rect).
        // With all panels mounted, querySelector finds hidden elements too,
        // but they have zero dimensions until the tab is shown.
        const rect = el?.getBoundingClientRect();
        const isVisible = rect && rect.width > 0 && rect.height > 0;

        if (!isVisible && !hasRetried) {
          hasRetried = true;
          // Give React time to re-render after tab switch, then retry
          setTimeout(() => driverObj.moveTo(index), 200);
          return;
        }
        originalOnHighlighted?.(...args);
      },
    };
  });
};
