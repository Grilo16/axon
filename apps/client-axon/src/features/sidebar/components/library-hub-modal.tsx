import styled from "styled-components";
import { X, Play, HardDrive } from "lucide-react";
import { useWorkspaceManager } from "@features/core/workspace/hooks/use-workspace-manager";
import { useAppSelector } from "@app/hooks";
import { selectAllBundles } from "@features/core/bundles/bundles-slice";

const Overlay = styled.div`
  position: fixed; inset: 0; z-index: 100;
  display: flex; align-items: center; justify-content: center;
  background-color: rgba(18, 18, 18, 0.85); backdrop-filter: blur(4px);
`;

const ModalCard = styled.div`
  width: 800px; max-width: 90vw; height: 600px; max-height: 90vh;
  background: #1e1e1e; border: 1px solid #333; border-radius: 12px;
  display: flex; flex-direction: column; overflow: hidden;
  box-shadow: 0 24px 50px rgba(0, 0, 0, 0.5);
`;

const Header = styled.div`
  padding: 20px 24px; border-bottom: 1px solid #2b2b2b;
  display: flex; justify-content: space-between; align-items: center;
`;

const Grid = styled.div`
  padding: 24px; display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px; overflow-y: auto; flex: 1;
`;

const WorkspaceCard = styled.div`
  background: #252526; border: 1px solid #333; border-radius: 8px; padding: 16px;
  cursor: pointer; transition: all 0.2s; display: flex; flex-direction: column; gap: 12px;
  &:hover { border-color: #3b82f6; transform: translateY(-2px); box-shadow: 0 8px 16px rgba(0,0,0,0.2); }
`;

export const LibraryHubModal = ({ onClose }: { onClose: () => void }) => {
  const { workspaces, activeWorkspace, open } = useWorkspaceManager();
  const allBundles = useAppSelector(selectAllBundles); // Grab all bundles across all workspaces!

  return (
    <Overlay onClick={onClose}>
      <ModalCard onClick={(e) => e.stopPropagation()}>
        <Header>
          <div className="flex items-center gap-2 text-gray-200 font-bold text-lg">
            <HardDrive className="text-blue-500" /> Axon Library Hub
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20} /></button>
        </Header>
        
        <Grid>
          {workspaces.map(ws => {
            const wsBundles = allBundles.filter(b => b.workspaceId === ws.id);
            const totalRules = wsBundles.reduce((acc, b) => acc + b.options.rules.length, 0);
            const isActive = activeWorkspace?.id === ws.id;

            return (
              <WorkspaceCard key={ws.id} onClick={() => { open(ws.id); onClose(); }}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-bold text-gray-200 mb-1">{ws.name}</h3>
                    <p className="text-xs text-gray-500 font-mono truncate max-w-[200px]">{ws.projectRoot}</p>
                  </div>
                  {isActive ? (
                    <span className="bg-blue-500/20 text-blue-400 text-[10px] px-2 py-1 rounded font-bold uppercase">Active</span>
                  ) : (
                    <Play size={16} className="text-gray-500" />
                  )}
                </div>
                
                <div className="flex gap-4 mt-2 pt-3 border-t border-gray-700/50">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500">Bundles</span>
                    <span className="text-sm text-gray-300 font-semibold">{wsBundles.length}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500">Redaction Rules</span>
                    <span className="text-sm text-gray-300 font-semibold">{totalRules}</span>
                  </div>
                </div>
              </WorkspaceCard>
            );
          })}
        </Grid>
      </ModalCard>
    </Overlay>
  );
};