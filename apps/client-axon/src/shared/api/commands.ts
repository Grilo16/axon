export const AXON_COMMANDS = {
  EXPLORER: {
    LIST_DIRECTORY: 'list_directory',
    READ_FILE: 'read_file_content',
  },
  GRAPH: {
    BUILD_GRAPH: 'build_graph',
  },

} as const;

export type AxonCommand = 
  | typeof AXON_COMMANDS.EXPLORER[keyof typeof AXON_COMMANDS.EXPLORER]
  | typeof AXON_COMMANDS.GRAPH[keyof typeof AXON_COMMANDS.GRAPH]