import { Package, FileCode, ShieldAlert, Copy, Loader2, EyeOff, Eye } from 'lucide-react';
import * as S from './bundle-compact.styles';
import { useBundleSession } from '@features/core/bundles/hooks/use-bundle-session';

export const BundleCompact = () => {
  const { 
    activeBundle, 
    generateAndCopyBundle, 
    isGenerating, 
    hideBarrelExports, 
    toggleHideBarrelExports 
  } = useBundleSession();

  if (!activeBundle) return null;

  const fileCount = activeBundle.options?.targetFiles?.length;
  const ruleCount = activeBundle.options?.rules?.length;
  const hasFiles = fileCount > 0;

  return (
    <S.Card>
      <S.Title style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Package size={16} className="text-blue-400" />
          {activeBundle.name}
        </div>
        
        <button
          onClick={toggleHideBarrelExports}
          title={hideBarrelExports ? "Show Index/Barrel Files" : "Hide Index/Barrel Files"}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            padding: '2px',
            color: hideBarrelExports ? '#60a5fa' : '#6b7280',
          }}
        >
          {hideBarrelExports ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </S.Title>
      
      <S.StatsRow>
        <S.StatBadge title="Files in Graph/Bundle">
          <FileCode size={12} className="text-green-400" />
          {fileCount} Files
        </S.StatBadge>
        <S.StatBadge title="Active Redaction Rules">
          <ShieldAlert size={12} className="text-yellow-400" />
          {ruleCount} Rules
        </S.StatBadge>
      </S.StatsRow>

      <S.GenerateBtn
        onClick={generateAndCopyBundle}
        disabled={isGenerating || !hasFiles}
        $isGenerating={isGenerating}
      >
        {isGenerating ? (
          <><Loader2 size={14} className="animate-spin" /> Bundling...</>
        ) : (
          <><Copy size={14} /> Generate Context</>
        )}
      </S.GenerateBtn>
    </S.Card>
  );
};