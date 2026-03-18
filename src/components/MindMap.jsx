import { useState, useCallback, useEffect, useRef } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  useReactFlow,
  addEdge,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  MarkerType,
} from '@xyflow/react';
import { getStroke } from 'perfect-freehand';
import '@xyflow/react/dist/style.css';
import MindNode  from './MindNode';
import MindGroup from './MindGroup';
import MindEdge  from './MindEdge';
import MindText  from './MindText';
import MindDraw  from './MindDraw';

const nodeTypes = { mindNode: MindNode, mindGroup: MindGroup, mindText: MindText, mindDraw: MindDraw };
const edgeTypes = { mindEdge: MindEdge };

const ARROW      = { type: MarkerType.ArrowClosed, color: '#b8960c', width: 13, height: 13 };
const NEW_EDGE   = { type: 'mindEdge', style: { stroke: '#b8960c', strokeWidth: 1.8 }, markerEnd: ARROW, data: { label: '', arrowDir: 'forward' } };
const DRAW_COLORS = ['#b8960c', '#4a9e5c', '#5c7ab8', '#c04a4a', '#c07e4a', '#d4c9b0'];

function svgPathFromStroke(stroke) {
  if (!stroke.length) return '';
  const d = [];
  const [first] = stroke;
  d.push(`M ${first[0].toFixed(1)} ${first[1].toFixed(1)}`);
  for (let i = 0; i < stroke.length - 1; i++) {
    const [x0, y0] = stroke[i];
    const [x1, y1] = stroke[i + 1];
    const mx = ((x0 + x1) / 2).toFixed(1);
    const my = ((y0 + y1) / 2).toFixed(1);
    d.push(`Q ${x0.toFixed(1)} ${y0.toFixed(1)} ${mx} ${my}`);
  }
  d.push('Z');
  return d.join(' ');
}

// Wrapper: ReactFlowProvider permite useReactFlow() dentro de MindMapCanvas
export default function MindMap(props) {
  return (
    <ReactFlowProvider>
      <MindMapCanvas {...props} />
    </ReactFlowProvider>
  );
}

function MindMapCanvas({ nodes: initNodes, edges: initEdges, onChange }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initNodes ?? []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initEdges ?? []);
  const [drawMode,     setDrawMode]     = useState(false);
  const [drawColorIdx, setDrawColorIdx] = useState(0);
  const [livePoints,   setLivePoints]   = useState(null);

  const drawingRef    = useRef(null);
  const canvasRef     = useRef(null);
  const isFirstRender = useRef(true);
  const onChangeRef   = useRef(onChange);

  const { screenToFlowPosition } = useReactFlow();

  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

  // Salva com debounce, limpando propriedade interna `measured`
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    const timer = setTimeout(() => {
      // eslint-disable-next-line no-unused-vars
      const cleanNodes = nodes.map(({ measured, ...rest }) => rest);
      onChangeRef.current(cleanNodes, edges);
    }, 700);
    return () => clearTimeout(timer);
  }, [nodes, edges]);

  // Esc sai do modo desenho
  useEffect(() => {
    if (!drawMode) return;
    const handler = (e) => { if (e.key === 'Escape') setDrawMode(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [drawMode]);

  // Bloqueia scroll/pan do Safari iOS durante o desenho (Apple Pencil).
  // Precisa ser { passive: false } para poder chamar preventDefault().
  const overlayRef = useRef(null);
  useEffect(() => {
    const el = overlayRef.current;
    if (!el || !drawMode) return;
    const prevent = (e) => e.preventDefault();
    el.addEventListener('touchstart', prevent, { passive: false });
    el.addEventListener('touchmove',  prevent, { passive: false });
    return () => {
      el.removeEventListener('touchstart', prevent);
      el.removeEventListener('touchmove',  prevent);
    };
  }, [drawMode]);

  const onConnect = useCallback((params) => {
    setEdges(eds => addEdge({ ...params, ...NEW_EDGE }, eds));
  }, [setEdges]);

  // ── Agrupamento automático ao soltar nó dentro de um grupo ──────────────
  const onNodeDragStop = useCallback((_event, draggedNode) => {
    if (draggedNode.type === 'mindGroup') return;

    setNodes(nds => {
      const groups = nds.filter(n => n.type === 'mindGroup');
      const parent = draggedNode.parentId ? nds.find(n => n.id === draggedNode.parentId) : null;
      const absX   = (parent?.position.x ?? 0) + draggedNode.position.x;
      const absY   = (parent?.position.y ?? 0) + draggedNode.position.y;

      const targetGroup = groups.find(g => {
        const w = parseFloat(g.style?.width  ?? g.width  ?? 200);
        const h = parseFloat(g.style?.height ?? g.height ?? 150);
        return absX >= g.position.x && absX <= g.position.x + w
            && absY >= g.position.y && absY <= g.position.y + h;
      });

      if (targetGroup) {
        if (draggedNode.parentId === targetGroup.id) return nds;
        return nds.map(n => {
          if (n.id !== draggedNode.id) return n;
          return { ...n, parentId: targetGroup.id, position: { x: absX - targetGroup.position.x, y: absY - targetGroup.position.y } };
        });
      } else if (draggedNode.parentId) {
        return nds.map(n => {
          if (n.id !== draggedNode.id) return n;
          // eslint-disable-next-line no-unused-vars
          const { parentId, extent, ...rest } = n;
          return { ...rest, position: { x: absX, y: absY } };
        });
      }
      return nds;
    });
  }, [setNodes]);

  // ── Adicionar nó bloco ───────────────────────────────────────────────────
  const addBlock = useCallback(() => {
    const id = `mn-${Date.now()}`;
    setNodes(nds => [...nds, {
      id, type: 'mindNode',
      position: { x: 60 + Math.random() * 260, y: 40 + Math.random() * 160 },
      data: { label: 'Novo bloco', colorIdx: Math.floor(Math.random() * 5) },
    }]);
  }, [setNodes]);

  // ── Adicionar texto livre ────────────────────────────────────────────────
  const addText = useCallback(() => {
    const id = `mt-${Date.now()}`;
    setNodes(nds => [...nds, {
      id, type: 'mindText',
      position: { x: 60 + Math.random() * 260, y: 40 + Math.random() * 160 },
      data: { text: '', sizeIdx: 0, colorIdx: 0 },
    }]);
  }, [setNodes]);

  // ── Adicionar grupo ──────────────────────────────────────────────────────
  const addGroup = useCallback(() => {
    const id = `mg-${Date.now()}`;
    setNodes(nds => [{
      id, type: 'mindGroup',
      position: { x: 50 + Math.random() * 200, y: 30 + Math.random() * 120 },
      style: { width: 260, height: 180 },
      data: { label: 'Grupo', colorIdx: Math.floor(Math.random() * 5) },
      zIndex: -1,
    }, ...nds]);
  }, [setNodes]);

  // ── Desenho livre ────────────────────────────────────────────────────────
  const handleDrawPointerDown = useCallback((e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const pt = [e.clientX, e.clientY, e.pressure || 0.5];
    drawingRef.current = { pts: [pt] };
    setLivePoints([pt]);
  }, []);

  const handleDrawPointerMove = useCallback((e) => {
    if (!drawingRef.current) return;
    const pt = [e.clientX, e.clientY, e.pressure || 0.5];
    drawingRef.current.pts.push(pt);
    setLivePoints([...drawingRef.current.pts]);
  }, []);

  const handleDrawPointerUp = useCallback(() => {
    if (!drawingRef.current) return;
    const { pts } = drawingRef.current;
    drawingRef.current = null;
    setLivePoints(null);
    if (pts.length < 2) return;

    // Converte pontos de tela para coordenadas do flow
    const flowPts = pts.map(([x, y, p]) => {
      const fp = screenToFlowPosition({ x, y });
      return [fp.x, fp.y, p];
    });

    const xs   = flowPts.map(p => p[0]);
    const ys   = flowPts.map(p => p[1]);
    const minX = Math.min(...xs), minY = Math.min(...ys);
    const maxX = Math.max(...xs), maxY = Math.max(...ys);
    const pad  = 12;
    const boxW = Math.max(maxX - minX + pad * 2, 40);
    const boxH = Math.max(maxY - minY + pad * 2, 40);

    // Relativiza pontos à origem do nó
    const relativePts = flowPts.map(([x, y, p]) => [x - minX + pad, y - minY + pad, p]);

    const id = `md-${Date.now()}`;
    setNodes(nds => [...nds, {
      id,
      type: 'mindDraw',
      position: { x: minX - pad, y: minY - pad },
      style: { width: boxW, height: boxH },
      data: { strokes: [relativePts], boxW, boxH, color: DRAW_COLORS[drawColorIdx], size: 4 },
    }]);
  }, [drawColorIdx, screenToFlowPosition, setNodes]);

  // Preview em coordenadas de tela (visualização imediata sem conversão)
  const previewPath = livePoints
    ? (() => {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return null;
        const pts = livePoints.map(([x, y, p]) => [x - rect.left, y - rect.top, p]);
        const stroke = getStroke(pts, { size: 4, thinning: 0.5, smoothing: 0.5 });
        return svgPathFromStroke(stroke);
      })()
    : null;

  const isEmpty = nodes.length === 0;

  return (
    <div className="mindmap-container">
      <div className="mindmap-toolbar">
        <button className="btn btn-sm btn-gold" onClick={addBlock} disabled={drawMode}>
          + Bloco
        </button>
        <button className="btn btn-sm btn-outline" onClick={addGroup} disabled={drawMode}>
          ⊞ Grupo
        </button>
        <button className="btn btn-sm btn-outline" onClick={addText} disabled={drawMode}>
          T Texto
        </button>
        <button
          className={`btn btn-sm${drawMode ? ' btn-gold' : ' btn-outline'}`}
          onClick={() => setDrawMode(v => !v)}
          title={drawMode ? 'Sair do modo desenho (Esc)' : 'Desenho livre'}
        >
          ✎ Desenho
        </button>

        {drawMode ? (
          <>
            <div className="mindmap-draw-colors">
              {DRAW_COLORS.map((c, i) => (
                <button
                  key={c}
                  className={`mindmap-draw-color-btn${i === drawColorIdx ? ' active' : ''}`}
                  style={{ background: c }}
                  onClick={() => setDrawColorIdx(i)}
                  title={`Cor ${i + 1}`}
                />
              ))}
            </div>
            <span className="mindmap-hint">Clique e arraste para desenhar · Esc para sair</span>
          </>
        ) : (
          <span className="mindmap-hint">
            2× clique para editar · Del remove · Arraste para agrupar · Clique na linha para opções
          </span>
        )}
      </div>

      <div
        className="mindmap-canvas"
        ref={canvasRef}
        style={{ cursor: drawMode ? 'crosshair' : undefined }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeDragStop={onNodeDragStop}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          connectionMode="loose"
          deleteKeyCode={['Delete', 'Backspace']}
          nodesDraggable={!drawMode}
          panOnDrag={!drawMode}
          zoomOnScroll={!drawMode}
          zoomOnPinch={!drawMode}
          fitView
          fitViewOptions={{ padding: 0.35, maxZoom: 1.4 }}
          minZoom={0.2}
          maxZoom={2}
          proOptions={{ hideAttribution: true }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            color="#2a2a18"
            gap={22}
            size={1.2}
          />
          <Controls
            style={{ background: '#1a1a0f', border: '1px solid #333', borderRadius: 6 }}
            showInteractive={false}
          />
          <MiniMap
            nodeColor={n => n.type === 'mindGroup' ? 'rgba(201,168,76,0.3)' : '#b8960c'}
            maskColor="rgba(8,8,4,0.7)"
            style={{ background: '#12120a', border: '1px solid #2a2a18', borderRadius: 6 }}
          />
        </ReactFlow>

        {/* Overlay captura eventos de ponteiro em modo desenho */}
        {drawMode && (
          <div
            ref={overlayRef}
            className="mindmap-draw-overlay"
            onPointerDown={handleDrawPointerDown}
            onPointerMove={handleDrawPointerMove}
            onPointerUp={handleDrawPointerUp}
            onPointerCancel={handleDrawPointerUp}
          />
        )}

        {/* Preview do traço em tempo real */}
        {previewPath && (
          <svg className="mindmap-draw-preview">
            <path d={previewPath} fill={DRAW_COLORS[drawColorIdx]} opacity={0.85} />
          </svg>
        )}

        {isEmpty && !drawMode && (
          <div className="mindmap-empty">
            <span className="mindmap-empty-icon">🧠</span>
            <p>Seu mapa mental está vazio</p>
            <p className="mindmap-empty-sub">
              Clique em <strong>+ Bloco</strong> para adicionar um bloco ou <strong>⊞ Grupo</strong> para criar um agrupamento
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
