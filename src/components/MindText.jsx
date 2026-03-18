import { useState, useEffect, useRef, useCallback } from 'react';
import { NodeResizer, useReactFlow } from '@xyflow/react';

const SIZES = ['0.78em', '0.9em', '1.05em', '1.25em'];
const COLORS = ['#d4c9b0', '#c9a84c', '#4a9e5c', '#5c7ab8', '#c04a4a', '#c07e4a'];

export default function MindText({ id, data, selected }) {
    const [editing, setEditing] = useState(false);
    const [text, setText] = useState(data.text ?? '');
    const textareaRef = useRef(null);
    const { setNodes } = useReactFlow();

    const displayText = editing ? text : (data.text ?? '');

    useEffect(() => {
        if (editing && textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
            textareaRef.current.focus();
        }
    }, [editing]);

    const commitEdit = useCallback(() => {
        setEditing(false);
        const trimmed = text.trim();
        setText(trimmed || '');
        setNodes(ns =>
            ns.map(n => n.id === id ? { ...n, data: { ...n.data, text: trimmed } } : n)
        );
    }, [id, text, setNodes]);

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Escape') { setEditing(false); setText(data.text ?? ''); }
        e.stopPropagation();
    }, [data.text]);

    const handleInput = useCallback((e) => {
        setText(e.target.value);
        e.target.style.height = 'auto';
        e.target.style.height = e.target.scrollHeight + 'px';
    }, []);

    const deleteNode = useCallback((e) => {
        e.stopPropagation();
        setNodes(ns => ns.filter(n => n.id !== id));
    }, [id, setNodes]);

    const cycleSize = useCallback((e) => {
        e.stopPropagation();
        setNodes(ns =>
            ns.map(n =>
                n.id === id
                    ? { ...n, data: { ...n.data, sizeIdx: ((n.data.sizeIdx ?? 0) + 1) % SIZES.length } }
                    : n
            )
        );
    }, [id, setNodes]);

    const cycleColor = useCallback((e) => {
        e.stopPropagation();
        setNodes(ns =>
            ns.map(n =>
                n.id === id
                    ? { ...n, data: { ...n.data, colorIdx: ((n.data.colorIdx ?? 0) + 1) % COLORS.length } }
                    : n
            )
        );
    }, [id, setNodes]);

    const fontSize = SIZES[data.sizeIdx ?? 0];
    const textColor = COLORS[data.colorIdx ?? 0];

    return (
        <>
            <NodeResizer
                minWidth={80}
                minHeight={24}
                isVisible={selected}
                lineStyle={{ borderColor: 'rgba(201,168,76,0.4)', borderWidth: 1, borderStyle: 'dashed' }}
                handleStyle={{ background: '#b8960c', width: 7, height: 7, borderRadius: 2, border: 'none' }}
            />

            <div
                className={`mind-text-node${selected ? ' mind-text-node--selected' : ''}`}
                onDoubleClick={() => setEditing(true)}
            >
                {editing ? (
                    <textarea
                        ref={textareaRef}
                        className="mind-text-textarea nodrag nopan"
                        value={text}
                        onChange={handleInput}
                        onBlur={commitEdit}
                        onKeyDown={handleKeyDown}
                        style={{ fontSize, color: textColor }}
                        placeholder="Digite o texto..."
                    />
                ) : (
                    <p
                        className="mind-text-label"
                        style={{ fontSize, color: textColor }}
                    >
                        {displayText || <em className="mind-text-placeholder">duplo clique para editar</em>}
                    </p>
                )}

                {selected && (
                    <div className="mind-text-actions nodrag nopan">
                        <button className="mind-text-btn" onClick={cycleSize} title="Tamanho do texto">A</button>
                        <button className="mind-text-btn" onClick={cycleColor} title="Cor do texto" style={{ color: textColor }}>●</button>
                        <button className="mind-text-btn mind-text-del" onClick={deleteNode} title="Remover">×</button>
                    </div>
                )}
            </div>
        </>
    );
}
