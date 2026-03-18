import { useState } from 'react';
import Modal from './Modal';

const TYPES = [
  { value: 'passive', label: 'Passivo' },
  { value: 'limited', label: 'Limitado' },
  { value: 'subclass', label: 'Subclasse' },
];

function PowerForm({ initial, onSave, onCancel }) {
  const [f, setF] = useState(initial || {
    name: '', tag: '', type: 'passive', description: '', maxUses: 0, usesLeft: 0, restore: '',
  });

  const save = () => {
    if (!f.name.trim()) return;
    onSave({
      ...f,
      maxUses: Number(f.maxUses) || 0,
      usesLeft: Number(f.usesLeft) || 0,
    });
  };

  return (
    <>
      <div className="form-group">
        <label className="form-label">Nome</label>
        <input className="form-input" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} />
      </div>
      <div className="form-group">
        <label className="form-label">Tag (ex: Nível 1 · Ação Bônus)</label>
        <input className="form-input" value={f.tag} onChange={e => setF({ ...f, tag: e.target.value })} />
      </div>
      <div className="form-group">
        <label className="form-label">Tipo</label>
        <select className="form-input" value={f.type} onChange={e => setF({ ...f, type: e.target.value })}>
          {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Descrição</label>
        <textarea className="form-textarea" value={f.description} onChange={e => setF({ ...f, description: e.target.value })} />
      </div>
      {f.type === 'limited' && (
        <>
          <div style={{ display: 'flex', gap: 8 }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Usos Máximos</label>
              <input className="form-input" type="number" min={0} value={f.maxUses} onChange={e => setF({ ...f, maxUses: e.target.value })} />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Usos Restantes</label>
              <input className="form-input" type="number" min={0} value={f.usesLeft} onChange={e => setF({ ...f, usesLeft: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Restauração</label>
            <input className="form-input" value={f.restore} onChange={e => setF({ ...f, restore: e.target.value })} placeholder="Descanso Curto ou Longo" />
          </div>
        </>
      )}
      <div className="btn-row">
        <button className="btn" onClick={onCancel}>Cancelar</button>
        <button className="btn btn-gold" onClick={save}>Salvar</button>
      </div>
    </>
  );
}

let nextId = 200;

export default function Powers({ items, onChange, title, category }) {
  const [modal, setModal] = useState(null);

  const closeModal = () => setModal(null);

  const toggleUse = (powerId, idx) => {
    const newItems = items.map(p => {
      if (p.id !== powerId) return p;
      const newUsesLeft = idx < (p.maxUses - p.usesLeft) ? p.usesLeft : p.usesLeft - 1;
      // Toggle: if box idx is already used, restore it
      const usedCount = p.maxUses - p.usesLeft;
      if (idx < usedCount) {
        return { ...p, usesLeft: p.usesLeft + 1 };
      } else {
        return { ...p, usesLeft: Math.max(0, p.usesLeft - 1) };
      }
    });
    onChange(newItems);
  };

  const savePower = (data) => {
    if (modal.editing) {
      const newItems = items.map(p => p.id === modal.editing.id ? { ...modal.editing, ...data } : p);
      onChange(newItems);
    } else {
      onChange([...items, { ...data, id: ++nextId }]);
    }
    closeModal();
  };

  const deletePower = (id) => onChange(items.filter(p => p.id !== id));

  return (
    <>
      <div className="card-title" style={{ marginBottom: 8 }}>
        <span>{title}</span>
        <button className="add-btn" onClick={() => setModal({ editing: null })}>+ Adicionar</button>
      </div>
      <div className="power-list">
        {items.map(power => (
          <div className={`power-item ${power.type || ''} ${category || ''}`} key={power.id}>
            <div className="power-header">
              <div className="power-name">{power.name}</div>
              {power.tag && <span className="power-tag">{power.tag}</span>}
            </div>
            <div className="power-desc">{power.description}</div>
            {power.type === 'limited' && power.maxUses > 0 && (
              <div className="uses-row">
                <span className="uses-label">Usos ({power.maxUses}):</span>
                <div className="uses-boxes">
                  {Array.from({ length: power.maxUses }).map((_, i) => {
                    const usedCount = power.maxUses - power.usesLeft;
                    const isUsed = i < usedCount;
                    return (
                      <div
                        key={i}
                        className={`use-box ${category === 'talent' ? 'luck' : ''} ${isUsed ? 'used' : ''}`}
                        onClick={() => toggleUse(power.id, i)}
                      >
                        {i + 1}
                      </div>
                    );
                  })}
                </div>
                {power.restore && <span className="uses-restore">↻ {power.restore}</span>}
              </div>
            )}
            <div className="item-actions">
              <button className="btn btn-sm" onClick={() => setModal({ editing: power })}>✎</button>
              <button className="btn btn-sm btn-red" onClick={() => deletePower(power.id)}>✕</button>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-dim)', fontStyle: 'italic', padding: 20 }}>
            Nenhum item cadastrado
          </div>
        )}
      </div>

      {modal && (
        <Modal title={modal.editing ? `Editar ${title}` : `Novo ${title}`} onClose={closeModal}>
          <PowerForm initial={modal.editing} onSave={savePower} onCancel={closeModal} />
        </Modal>
      )}
    </>
  );
}
