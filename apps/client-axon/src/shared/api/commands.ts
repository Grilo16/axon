export const AXON_COMMANDS = {
  WORKSPACE: {
    LOAD_WORKSPACE: "load_workspace",
    GET_ALL_FILE_PATHS: "get_all_file_paths",
    GET_FILE_PATHS_BY_DIR: "get_file_paths_by_dir",
    READ_FILE: "read_file",
    GENERATE_BUNDLE: "generate_bundle"
  },
  EXPLORER: {
    LIST_DIRECTORY: "list_directory",
    READ_FILE: "read_file_content",
  },
  GRAPH: {
    GET_FOCUSED_GRAPH: "get_focused_graph",
  },
} as const;

export type AxonCommand =
  | (typeof AXON_COMMANDS.WORKSPACE)[keyof typeof AXON_COMMANDS.WORKSPACE]
  | (typeof AXON_COMMANDS.EXPLORER)[keyof typeof AXON_COMMANDS.EXPLORER]
  | (typeof AXON_COMMANDS.GRAPH)[keyof typeof AXON_COMMANDS.GRAPH];
