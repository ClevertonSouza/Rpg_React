import { lazy, Suspense, useState } from 'react';

const MindMap = lazy(() => import('./MindMap'));

export default function Notes({ notes, onChange, mindMap, onMindMapChange }) {
  const [mode, setMode] = useState('text');

  return (
    <div className="notes-container">
      <div className="notes-header">
        <span className="card-title">Anotações</span>
        <div className="notes-mode-tabs">
          <button
            className={`notes-mode-btn${mode === 'text' ? ' active' : ''}`}
            onClick={() => setMode('text')}
          >
            ✍ Texto
          </button>
          <button
            className={`notes-mode-btn${mode === 'mindmap' ? ' active' : ''}`}
            onClick={() => setMode('mindmap')}
          >
            🧠 Mapa Mental
          </button>
        </div>
      </div>

      {mode === 'text' && (
        <textarea
          className="notes-area"
          value={notes}
          onChange={e => onChange(e.target.value)}
          placeholder="Escreva suas anotações aqui... (eventos da sessão, planos, NPCs, etc.)"
        />
      )}

      {mode === 'mindmap' && (
        <Suspense fallback={<div className="mindmap-loading">Carregando mapa mental...</div>}>
          <MindMap
            nodes={mindMap?.nodes ?? []}
            edges={mindMap?.edges ?? []}
            onChange={onMindMapChange}
          />
        </Suspense>
      )}
    </div>
  );
}
