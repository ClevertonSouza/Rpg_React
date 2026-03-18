import { useCallback, useEffect, useRef } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import MindNode  from './MindNode';
import MindGroup from './MindGroup';
import MindEdge  from './MindEdge';

const nodeTypes = { mindNode: MindNode, mindGroup: MindGroup };
const edgeTypes = { mindEdge: MindEdge };

const ARROW    = { type: MarkerType.ArrowClosed, color: '#b8960c', width: 13, height: 13 };
const NEW_EDGE = { type: 'mindEdge', style: { stroke: '#b8960c', strokeWidth: 1.8 }, markerEnd: ARROW, data: { label: '', arrowDir: 'forward' } };

export default function MindMap({ nodes: initNodes, edges: initEdges, onChange }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initNodes ?? []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initEdges ?? []);

  const isFirstRender = useRef(true);
  const onChangeRef   = useRef(onChange);
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

  const onConnect = useCallback((params) => {
    setEdges(eds => addEdge({ ...params, ...NEW_EDGE }, eds));
  }, [setEdges]);

  // ── Agrupamento automático ao soltar nó dentro de um grupo ──────────────
  const onNodeDragStop = useCallback((_event, draggedNode) => {
    if (draggedNode.type === 'mindGroup') return;

    setNodes(nds => {
      const groups = nds.filter(n => n.type === 'mindGroup');

      // Posição absoluta do nó arrastado
      const parent = draggedNode.parentId ? nds.find(n => n.id === draggedNode.parentId) : null;
      const absX   = (parent?.position.x ?? 0) + draggedNode.position.x;
      const absY   = (parent?.position.y ?? 0) + draggedNode.position.y;

      // Achar grupo que contém a posição absoluta
      const targetGroup = groups.find(g => {
        const w = parseFloat(g.style?.width  ?? g.width  ?? 200);
        const h = parseFloat(g.style?.height ?? g.height ?? 150);
        return absX >= g.position.x && absX <= g.position.x + w
            && absY >= g.position.y && absY <= g.position.y + h;
      });

      if (targetGroup) {
        if (draggedNode.parentId === targetGroup.id) return nds; // já está neste grupo
        return nds.map(n => {
          if (n.id !== draggedNode.id) return n;
          return {
            ...n,
            parentId: targetGroup.id,
            position: { x: absX - targetGroup.position.x, y: absY - targetGroup.position.y },
          };
        });
      } else if (draggedNode.parentId) {
        // Saiu do grupo — libera para posição absoluta
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
    setNodes(nds => [
      ...nds,
      {
        id,
        type: 'mindNode',
        position: { x: 60 + Math.random() * 260, y: 40 + Math.random() * 160 },
        data: { label: 'Novo bloco', colorIdx: Math.floor(Math.random() * 5) },
      },
    ]);
  }, [setNodes]);

  // ── Adicionar grupo ──────────────────────────────────────────────────────
  const addGroup = useCallback(() => {
    const id = `mg-${Date.now()}`;
    setNodes(nds => [
      // Grupos vão para o INÍCIO para ficarem atrás dos outros nós
      {
        id,
        type: 'mindGroup',
        position: { x: 50 + Math.random() * 200, y: 30 + Math.random() * 120 },
        style: { width: 260, height: 180 },
        data: { label: 'Grupo', colorIdx: Math.floor(Math.random() * 5) },
        zIndex: -1,
      },
      ...nds,
    ]);
  }, [setNodes]);

  const isEmpty = nodes.length === 0;

  return (
    <div className="mindmap-container">
      <div className="mindmap-toolbar">
        <button className="btn btn-sm btn-gold" onClick={addBlock}>
          + Bloco
        </button>
        <button className="btn btn-sm btn-outline" onClick={addGroup}>
          ⊞ Grupo
        </button>
        <span className="mindmap-hint">
          2× clique para editar · Del remove · Arraste para agrupar · Clique na linha para opções
        </span>
      </div>

      <div className="mindmap-canvas">
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

        {isEmpty && (
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
