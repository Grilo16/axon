export type SkeletonMode = 'all' | 'keepOnly' | 'stripOnly';

export interface AxonGroup {
  id: string;        
  name: string;
  entryPoint: string;
  depth: number;
  flatten: boolean; 
  isActive: boolean;      
}

export interface WorkspaceState {
  id: string;
  name: string;
  projectRoot: string; 
  tsConfigPath: string | null;
  selectedGroupId: string | null;
  
  skeletonMode: SkeletonMode;
  redactions: string[]; 
  skeletonTargets: string[];
  
  showLineNumbers: boolean;
  removeComments: boolean;
}