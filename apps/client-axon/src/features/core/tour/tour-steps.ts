import type { DriveStep } from "driver.js";

export const AXON_TOUR_STEPS: DriveStep[] = [
  {
    popover: {
      title: "Welcome to Axon",
      description: "Axon is a context scalpel. It helps you visualize, slice, and export exactly the code context you need for LLMs or documentation. Let's take a quick look around.",
      side: "over",
      align: "center"
    }
  },
  {
    element: "#tour-sidebar-workspaces",
    popover: {
      title: "Your Workspaces",
      description: "Here are your loaded codebases. You can switch between local folders or GitHub repositories instantly.",
      side: "right",
      align: "start"
    }
  },
  {
    element: "#tour-file-explorer",
    popover: {
      title: "The File Explorer",
      description: "Navigate your project here. Double-click a file to view its code, or click the '+' icon to drop it into your current bundle graph.",
      side: "right",
      align: "start"
    }
  },
  {
    element: "#tour-bundle-selector",
    popover: {
      title: "Bundle Management",
      description: "A workspace can have multiple bundles (like different context slices). Create, rename, or switch between them here. You can also toggle index/barrel file visibility.",
      side: "bottom",
      align: "start"
    }
  },
  {
    element: "#tour-graph-canvas",
    popover: {
      title: "The Architecture Graph",
      description: "This is the core of Axon. Files you add will appear here. You can click 'Imports' or 'Used By' on any node to expand the graph dynamically.",
      side: "left",
      align: "center"
    }
  },
  {
    element: "#tour-bundle-compact",
    popover: {
      title: "Generate Context",
      description: "Once your graph has exactly the files you want, click 'Generate Context'. Axon will bundle the code and copy it to your clipboard, ready for your LLM.",
      side: "top",
      align: "end"
    }
  }
];