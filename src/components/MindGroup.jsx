import { useState, useCallback } from 'react';
import { NodeResizer, useReactFlow } from '@xyflow/react';

const GROUP_COLORS = [
    { border: 'rgba(201,168,76,0.55)', bg: 'rgba(201,168,76,0.04)', header: 'rgba(201,168,76,0.10)' },
    { border: 'rgba(74,158,92,0.55)', bg: 'rgba(74,158,92,0.04)', header: 'rgba(74,158,92,0.10)' },
    { border: 'rgba(92,122,184,0.55)', bg: 'rgba(92,122,184,0.04)', header: 'rgba(92,122,184,0.10)' },
    { border: 'rgba(192,74,74,0.55)', bg: 'rgba(192,74,74,0.04)', header: 'rgba(192,74,74,0.10)' },
    { border: 'rgba(192,126,74,0.55)', bg: 'rgba(192,126,74,0.04)', header: 'rgba(192,126,74,0.10)' },
];

export default function MindGroup({ id, data, selected }) {
    const [editing, setEditing] = useState(false);
    const [title, setTitle] = useState(data?.label ?? 'Grupo');
    const { setNodes } = useReactFlow();

    const displayTitle = editing ? title : (data?.label ?? 'Grupo');
    const colorIdx = data?.colorIdx ?? 0;
    const color = GROUP_COLORS[colorIdx % GROUP_COLORS.length];

    const commitEdit = useCallback(() => {
        setEditing(false);
        const trimmed = title.trim() || 'Grupo';
        setTitle(trimmed);
        setNodes(ns =>
            ns.map(n => n.id === id ? { ...n, data: { ...n.data, label: trimmed } } : n)
        );
    }, [id, title, setNodes]);

    const cycleColor = useCallback((e) => {
        e.stopPropagation();
        setNodes(ns =>
            ns.map(n =>
                n.id === id
                    ? { ...n, data: { ...n.data, colorIdx: ((data?.colorIdx ?? 0) + 1) % GROUP_COLORS.length } }
                    : n
            )
        );
    }, [id, data?.colorIdx, setNodes]);

    const deleteGroup = useCallback((e) => {
        e.stopPropagation();
        setNodes(ns => {
            // Libera filhos: converte posição relativa → absoluta ao remover parentId
            const group = ns.find(g => g.id === id);
            const gx = group?.position.x ?? 0;
            const gy = group?.position.y ?? 0;
            const updated = ns.map(n => {
                if (n.parentId !== id) return n;
                // eslint-disable-next-line no-unused-vars
                const { parentId, extent, ...rest } = n;
                return { ...rest, position: { x: gx + n.position.x, y: gy + n.position.y } };
            });
            return updated.filter(n => n.id !== id);
        });
    }, [id, setNodes]);

    return (
        <>
            <NodeResizer
                minWidth={160}
                minHeight={110}
                isVisible={selected}
                lineStyle={{ borderColor: color.border, borderWidth: 1.5, borderStyle: 'dashed' }}
                handleStyle={{ background: '#b8960c', width: 8, height: 8, borderRadius: 2, border: 'none' }}
            />

            <div
                className={`mind-group${selected ? ' mind-group--selected' : ''}`}
                style={{ borderColor: color.border, background: color.bg }}
            >
                <div
                    className="mind-group-header"
                    style={{ background: color.header, borderBottomColor: color.border }}
                    onDoubleClick={(e) => {
                        e.stopPropagation();
                        setTitle(data?.label ?? 'Grupo');
                        setEditing(true);
                    }}
                >
                    {editing ? (
                        <input
                            className="mind-group-input nodrag nopan"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            onBlur={commitEdit}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') commitEdit();
                                if (e.key === 'Escape') { setEditing(false); setTitle(data?.label ?? 'Grupo'); }
                                e.stopPropagation();
                            }}
                            autoFocus
                        />
                    ) : (
                        <span className="mind-group-title">{displayTitle}</span>
                    )}

                    <div className="mind-group-actions nodrag nopan">
                        <button
                            className="mind-group-action-btn"
                            onClick={cycleColor}
                            title="Trocar cor"
                            style={{ color: color.border }}
                        >●</button>
                        <button
                            className="mind-group-action-btn mind-group-del"
                            onClick={deleteGroup}
                            title="Remover grupo (libera os blocos internos)"
                        >×</button>
                    </div>
                </div>
            </div>
        </>
    );
}
