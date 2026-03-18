import { useState, useCallback, useRef, useEffect } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  MarkerType,
  useReactFlow,
} from '@xyflow/react';

const ARROW = { type: MarkerType.ArrowClosed, color: '#b8960c', width: 13, height: 13 };
const DIRS   = ['none', 'forward', 'backward', 'both'];
const DIR_ICON = { none: '—', forward: '→', backward: '←', both: '↔' };
const DIR_TITLE = { none: 'Sem seta', forward: 'Seta frente', backward: 'Seta atrás', both: 'Bidirecional' };

export default function MindEdge({
  id,
  sourceX, sourceY, sourcePosition,
  targetX, targetY, targetPosition,
  data, selected,
  markerEnd, markerStart,
  style,
}) {
  const [editing, setEditing] = useState(false);
  const [draft,   setDraft]   = useState(data?.label ?? '');
  const inputRef = useRef(null);
  const { setEdges } = useReactFlow();

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
  });

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  const currentLabel = data?.label ?? '';
  const arrowDir     = data?.arrowDir ?? 'forward';

  const commitLabel = useCallback(() => {
    setEditing(false);
    setEdges(eds =>
      eds.map(e => e.id === id ? { ...e, data: { ...(e.data ?? {}), label: draft } } : e)
    );
  }, [id, draft, setEdges]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') commitLabel();
    if (e.key === 'Escape') { setEditing(false); setDraft(currentLabel); }
    e.stopPropagation();
  }, [commitLabel, currentLabel]);

  const cycleArrow = useCallback((e) => {
    e.stopPropagation();
    const next = DIRS[(DIRS.indexOf(arrowDir) + 1) % DIRS.length];
    setEdges(eds =>
      eds.map(e => {
        if (e.id !== id) return e;
        return {
          ...e,
          markerEnd:   (next === 'forward'  || next === 'both') ? ARROW : undefined,
          markerStart: (next === 'backward' || next === 'both') ? ARROW : undefined,
          data: { ...(e.data ?? {}), arrowDir: next },
        };
      })
    );
  }, [id, arrowDir, setEdges]);

  const deleteEdge = useCallback((e) => {
    e.stopPropagation();
    setEdges(eds => eds.filter(e => e.id !== id));
  }, [id, setEdges]);

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} markerStart={markerStart} style={style} />

      <EdgeLabelRenderer>
        <div
          className="mind-edge-wrap nodrag nopan"
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
        >
          {/* Label area — duplo clique para editar */}
          <div
            className={`mind-edge-label-area${currentLabel || selected ? ' mind-edge-label-area--visible' : ''}`}
            onDoubleClick={() => { setDraft(currentLabel); setEditing(true); }}
          >
            {editing ? (
              <input
                ref={inputRef}
                className="mind-edge-input"
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onBlur={commitLabel}
                onKeyDown={handleKeyDown}
                placeholder="Label da linha..."
                size={Math.max(draft.length, 12)}
              />
            ) : currentLabel ? (
              <span className="mind-edge-label-text">{currentLabel}</span>
            ) : selected ? (
              <span className="mind-edge-label-hint">✎ label</span>
            ) : null}
          </div>

          {/* Controles aparecem quando a aresta está selecionada */}
          {selected && (
            <div className="mind-edge-controls">
              <button
                className="mind-edge-ctrl-btn"
                onClick={cycleArrow}
                title={DIR_TITLE[arrowDir]}
              >
                {DIR_ICON[arrowDir]}
              </button>
              <button
                className="mind-edge-ctrl-btn mind-edge-ctrl-del"
                onClick={deleteEdge}
                title="Remover linha"
              >
                ×
              </button>
            </div>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
