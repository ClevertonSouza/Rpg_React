import { useState } from 'react';
import Modal from './Modal';

const SPELL_LEVELS = ['Truque', '1º Nível', '2º Nível', '3º Nível', '4º Nível', '5º Nível', '6º Nível', '7º Nível', '8º Nível', '9º Nível'];

function SpellForm({ initial, onSave, onCancel }) {
  const [f, setF] = useState(initial || {
    name: '', level: 'Truque', school: '', castTime: '', range: '', duration: '',
    components: '', description: '', prepared: false,
  });

  const save = () => {
    if (!f.name.trim()) return;
    onSave(f);
  };

  return (
    <>
      <div className="form-group">
        <label className="form-label">Nome</label>
        <input className="form-input" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label">Nível</label>
          <select className="form-input" value={f.level} onChange={e => setF({ ...f, level: e.target.value })}>
            {SPELL_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label">Escola</label>
          <input className="form-input" value={f.school} onChange={e => setF({ ...f, school: e.target.value })} placeholder="Evocação, Abjuração..." />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label">Tempo de Conjuração</label>
          <input className="form-input" value={f.castTime} onChange={e => setF({ ...f, castTime: e.target.value })} placeholder="1 Ação" />
        </div>
        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label">Alcance</label>
          <input className="form-input" value={f.range} onChange={e => setF({ ...f, range: e.target.value })} placeholder="36m" />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label">Duração</label>
          <input className="form-input" value={f.duration} onChange={e => setF({ ...f, duration: e.target.value })} placeholder="Instantâneo" />
        </div>
        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label">Componentes</label>
          <input className="form-input" value={f.components} onChange={e => setF({ ...f, components: e.target.value })} placeholder="V, S, M" />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Descrição</label>
        <textarea className="form-textarea" style={{ minHeight: 100 }} value={f.description} onChange={e => setF({ ...f, description: e.target.value })} />
      </div>
      <div className="btn-row">
        <button className="btn" onClick={onCancel}>Cancelar</button>
        <button className="btn btn-gold" onClick={save}>Salvar</button>
      </div>
    </>
  );
}

let nextId = 500;

export default function Spells({ spells, onChange }) {
  const [modal, setModal] = useState(null);
  const closeModal = () => setModal(null);

  const saveSpell = (data) => {
    if (modal.editing) {
      onChange(spells.map(s => s.id === modal.editing.id ? { ...modal.editing, ...data } : s));
    } else {
      onChange([...spells, { ...data, id: ++nextId }]);
    }
    closeModal();
  };

  const deleteSpell = (id) => onChange(spells.filter(s => s.id !== id));

  const togglePrepared = (id) => {
    onChange(spells.map(s => s.id === id ? { ...s, prepared: !s.prepared } : s));
  };

  // Group by level
  const grouped = {};
  spells.forEach(s => {
    if (!grouped[s.level]) grouped[s.level] = [];
    grouped[s.level].push(s);
  });

  return (
    <>
      <div className="card-title" style={{ marginBottom: 8 }}>
        <span>Magias</span>
        <button className="add-btn" onClick={() => setModal({ editing: null })}>+ Adicionar</button>
      </div>

      {spells.length === 0 && (
        <div style={{ textAlign: 'center', color: 'var(--text-dim)', fontStyle: 'italic', padding: 20 }}>
          Nenhuma magia cadastrada. Clique em "+ Adicionar" para começar.
        </div>
      )}

      {SPELL_LEVELS.map(level => {
        const group = grouped[level];
        if (!group) return null;
        return (
          <div key={level} style={{ marginBottom: 12 }}>
            <div className="equip-sub-title"><span>✦ {level}</span></div>
            <div className="power-list">
              {group.map(spell => (
                <div className="power-item spell" key={spell.id}>
                  <div className="power-header">
                    <div
                      className={`skill-check ${spell.prepared ? 'prof' : ''}`}
                      style={{ cursor: 'pointer', marginTop: 2 }}
                      onClick={() => togglePrepared(spell.id)}
                      title={spell.prepared ? 'Preparada' : 'Não preparada'}
                    >
                      {spell.prepared ? '✓' : ''}
                    </div>
                    <div className="power-name">{spell.name}</div>
                    {spell.school && <span className="power-tag">{spell.school}</span>}
                  </div>
                  <div className="power-desc">
                    {spell.castTime && <span><strong>Conjuração:</strong> {spell.castTime} &nbsp;|&nbsp; </span>}
                    {spell.range && <span><strong>Alcance:</strong> {spell.range} &nbsp;|&nbsp; </span>}
                    {spell.duration && <span><strong>Duração:</strong> {spell.duration}</span>}
                    {spell.components && <span> &nbsp;|&nbsp; <strong>Comp:</strong> {spell.components}</span>}
                  </div>
                  {spell.description && (
                    <div className="power-desc" style={{ marginTop: 4 }}>{spell.description}</div>
                  )}
                  <div className="item-actions">
                    <button className="btn btn-sm" onClick={() => setModal({ editing: spell })}>✎</button>
                    <button className="btn btn-sm btn-red" onClick={() => deleteSpell(spell.id)}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {modal && (
        <Modal title={modal.editing ? 'Editar Magia' : 'Nova Magia'} onClose={closeModal}>
          <SpellForm initial={modal.editing} onSave={saveSpell} onCancel={closeModal} />
        </Modal>
      )}
    </>
  );
}
