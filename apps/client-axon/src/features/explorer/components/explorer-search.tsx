import React from "react";
import { Search, PlusSquare, X } from "lucide-react";
import * as S from "../styles";

interface Props {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onAddAll: () => void;
  resultCount: number;
}

export const ExplorerSearch: React.FC<Props> = ({ searchQuery, setSearchQuery, onAddAll, resultCount }) => {
  return (
    <S.Toolbar>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <Search size={14} style={{ position: 'absolute', left: 8, color: '#6b7280' }} />
        <S.AddressBar
          autoFocus
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Fuzzy search files..."
          style={{ paddingLeft: 28, paddingRight: searchQuery ? 28 : 8 }}
        />
        {searchQuery && (
          <S.IconButton 
            onClick={() => setSearchQuery("")} 
            style={{ position: 'absolute', right: 4 }}
            title="Clear search"
          >
            <X size={14} />
          </S.IconButton>
        )}
      </div>

      {searchQuery && (
        <S.ActionRow style={{ marginTop: 8 }}>
          <span style={{ fontSize: 11, color: '#9ca3af' }}>{resultCount} files found</span>
          <button 
            onClick={onAddAll}
            disabled={resultCount === 0}
            style={{ 
              display: 'flex', alignItems: 'center', gap: 6, 
              background: '#2563eb', color: '#fff', border: 'none', 
              padding: '4px 8px', borderRadius: 4, fontSize: 11, cursor: 'pointer' 
            }}
          >
            <PlusSquare size={12} /> Add All to Graph
          </button>
        </S.ActionRow>
      )}
    </S.Toolbar>
  );
};