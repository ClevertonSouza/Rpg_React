import { useState, useEffect, useRef, useCallback } from 'react';
import { Handle, Position, NodeResizer, useReactFlow } from '@xyflow/react';

// Paleta de cores para os blocos
const COLORS = [
    { border: '#b8960c', bg: 'rgba(184,150,12,0.08)' },   // dourado
    { border: '#4a9e5c', bg: 'rgba(74,158,92,0.08)' },    // verde
    { border: '#5c7ab8', bg: 'rgba(92,122,184,0.08)' },   // azul
    { border: '#c04a4a', bg: 'rgba(192,74,74,0.08)' },    // vermelho
    { border: '#c07e4a', bg: 'rgba(192,126,74,0.08)' },   // laranja
];

/** Redimensiona uma imagem via canvas para max 360px e retorna base64 JPEG */
function resizeImage(file) {
    return new Promise((resolve, reject) => {
        const MAX = 360;
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
            const scale = Math.min(MAX / img.width, MAX / img.height, 1);
            const canvas = document.createElement('canvas');
            canvas.width = Math.round(img.width * scale);
            canvas.height = Math.round(img.height * scale);
            canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
            URL.revokeObjectURL(url);
            resolve(canvas.toDataURL('image/jpeg', 0.72));
        };
        img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Imagem inválida')); };
        img.src = url;
    });
}

export default function MindNode({ id, data, selected }) {
    const [editing, setEditing] = useState(false);
    const [label, setLabel] = useState(data.label ?? '');
    const [showImgPanel, setShowImgPanel] = useState(false);
    const [imgMode, setImgMode] = useState('url'); // 'url' | 'file'
    const [urlDraft, setUrlDraft] = useState('');
    const [imgError, setImgError] = useState('');
    const textareaRef = useRef(null);
    const fileInputRef = useRef(null);
    const { setNodes } = useReactFlow();

    // Durante edição mantém rascunho em label; fora, exibe data.label
    const displayLabel = editing ? label : (data.label ?? '');
    const imageUrl = data.imageUrl ?? null;

    // Auto-resize da textarea ao entrar em modo edição
    useEffect(() => {
        if (editing && textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
            textareaRef.current.select();
        }
    }, [editing]);

    const startEdit = useCallback(() => setEditing(true), []);

    const commitEdit = useCallback(() => {
        setEditing(false);
        const trimmed = label.trim() || 'Bloco';
        setLabel(trimmed);
        setNodes(ns =>
            ns.map(n => n.id === id ? { ...n, data: { ...n.data, label: trimmed } } : n)
        );
    }, [id, label, setNodes]);

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commitEdit(); }
        if (e.key === 'Escape') { setEditing(false); setLabel(data.label ?? ''); }
        e.stopPropagation();
    }, [commitEdit, data.label]);

    const handleTextareaInput = useCallback((e) => {
        setLabel(e.target.value);
        e.target.style.height = 'auto';
        e.target.style.height = e.target.scrollHeight + 'px';
    }, []);

    const deleteNode = useCallback((e) => {
        e.stopPropagation();
        setNodes(ns => ns.filter(n => n.id !== id));
    }, [id, setNodes]);

    const cycleColor = useCallback((e) => {
        e.stopPropagation();
        setNodes(ns =>
            ns.map(n => {
                if (n.id !== id) return n;
                const next = ((n.data.colorIdx ?? 0) + 1) % COLORS.length;
                return { ...n, data: { ...n.data, colorIdx: next } };
            })
        );
    }, [id, setNodes]);

    // ── Imagem ──────────────────────────────────────────────────────
    const applyImage = useCallback((url) => {
        if (!url) return;
        setNodes(ns =>
            ns.map(n => n.id === id ? { ...n, data: { ...n.data, imageUrl: url } } : n)
        );
        setShowImgPanel(false);
        setUrlDraft('');
        setImgError('');
    }, [id, setNodes]);

    const handleUrlConfirm = useCallback(() => {
        const trimmed = urlDraft.trim();
        if (!trimmed) return;
        applyImage(trimmed);
    }, [urlDraft, applyImage]);

    const handleFileChange = useCallback(async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        e.target.value = '';
        setImgError('');
        try {
            const base64 = await resizeImage(file);
            applyImage(base64);
        } catch {
            setImgError('Não foi possível carregar a imagem.');
        }
    }, [applyImage]);

    const removeImage = useCallback((e) => {
        e.stopPropagation();
        setNodes(ns =>
            ns.map(n => {
                if (n.id !== id) return n;
                const { imageUrl: _, ...restData } = n.data;
                return { ...n, data: restData };
            })
        );
        setShowImgPanel(false);
    }, [id, setNodes]);

    const toggleImgPanel = useCallback((e) => {
        e.stopPropagation();
        if (imageUrl) {
            removeImage(e);
        } else {
            setShowImgPanel(v => !v);
            setImgError('');
        }
    }, [imageUrl, removeImage]);

    const colorIdx = data.colorIdx ?? 0;
    const color = COLORS[colorIdx] ?? COLORS[0];

    return (
        <>
            <NodeResizer
                minWidth={110}
                minHeight={44}
                isVisible={selected}
                lineStyle={{ borderColor: 'transparent' }}
                handleStyle={{ background: color.border, width: 8, height: 8, borderRadius: 2, border: 'none' }}
            />
            <div
                className={`mind-node${selected ? ' mind-node--selected' : ''}`}
                style={{ borderColor: color.border, background: color.bg }}
                onDoubleClick={startEdit}
            >
                {/* Handles nos 4 lados */}
                <Handle type="source" position={Position.Top} id="top" className="mind-handle" />
                <Handle type="source" position={Position.Bottom} id="bottom" className="mind-handle" />
                <Handle type="source" position={Position.Left} id="left" className="mind-handle" />
                <Handle type="source" position={Position.Right} id="right" className="mind-handle" />

                {/* Imagem (acima do texto se existir) */}
                {imageUrl && (
                    <div className="mind-node-image-wrap">
                        <img
                            src={imageUrl}
                            className="mind-node-image"
                            alt="imagem do bloco"
                            draggable={false}
                        />
                    </div>
                )}

                {/* Texto */}
                {editing ? (
                    <textarea
                        ref={textareaRef}
                        className="mind-node-textarea nodrag nopan"
                        value={label}
                        onChange={handleTextareaInput}
                        onBlur={commitEdit}
                        onKeyDown={handleKeyDown}
                        rows={2}
                    />
                ) : (
                    <p className="mind-node-label">
                        {displayLabel || <em className="mind-node-placeholder">duplo clique para editar</em>}
                    </p>
                )}

                {/* Painel de imagem */}
                {showImgPanel && !imageUrl && (
                    <div className="mind-node-img-panel nodrag nopan" onClick={e => e.stopPropagation()}>
                        <div className="mind-node-img-tabs">
                            <button
                                className={`mind-node-img-tab${imgMode === 'url' ? ' active' : ''}`}
                                onClick={() => setImgMode('url')}
                            >URL</button>
                            <button
                                className={`mind-node-img-tab${imgMode === 'file' ? ' active' : ''}`}
                                onClick={() => setImgMode('file')}
                            >Arquivo</button>
                        </div>

                        {imgMode === 'url' ? (
                            <div className="mind-node-img-url-row">
                                <input
                                    className="mind-node-img-input"
                                    placeholder="https://..."
                                    value={urlDraft}
                                    onChange={e => setUrlDraft(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') handleUrlConfirm(); e.stopPropagation(); }}
                                />
                                <button className="mind-node-img-ok" onClick={handleUrlConfirm}>OK</button>
                            </div>
                        ) : (
                            <>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={handleFileChange}
                                />
                                <button
                                    className="mind-node-img-pick"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    Escolher imagem…
                                </button>
                            </>
                        )}
                        {imgError && <span className="mind-node-img-error">{imgError}</span>}
                    </div>
                )}

                {/* Barra de ações */}
                <div className="mind-node-actions nodrag nopan">
                    <button
                        className="mind-node-action-btn"
                        onClick={cycleColor}
                        title="Trocar cor"
                        style={{ color: color.border }}
                    >●</button>
                    <button
                        className={`mind-node-action-btn${imageUrl ? ' mind-node-action-btn--active' : ''}`}
                        onClick={toggleImgPanel}
                        title={imageUrl ? 'Remover imagem' : 'Adicionar imagem'}
                    >🖼</button>
                    <button
                        className="mind-node-action-btn mind-node-del"
                        onClick={deleteNode}
                        title="Remover bloco"
                    >×</button>
                </div>
            </div>
        </>
    );
}
