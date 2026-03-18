import { useState } from 'react';
import Modal from './Modal';
import { CLASSES, SPECIES, PROF_BONUS } from '../data/dnd5e';

export default function Header({ char, onChange, user, synced, onLogout, onSwitchChar }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});

  const openEdit = () => {
    setForm({
      name:     char.name,
      class:    char.class,
      subclass: char.subclass,
      level:    char.level,
      race:     char.race,
    });
    setEditing(true);
  };

  const selectedClass = CLASSES.find(c => c.name === form.class);
  const subclasses = selectedClass?.subclasses ?? [];
  const showSubclass = !selectedClass || form.level >= selectedClass.subclassLevel;

  const setField = (field, value) => {
    setForm(prev => {
      const next = { ...prev, [field]: value };
      // Ao trocar de classe, limpa subclasse e atualiza dado de vida
      if (field === 'class') next.subclass = '';
      return next;
    });
  };

  const save = () => {
    const level = Math.min(20, Math.max(1, Number(form.level) || 1));
    const classData = CLASSES.find(c => c.name === form.class);
    onChange({
      ...char,
      name:     form.name.trim() || char.name,
      class:    form.class,
      subclass: form.subclass,
      level,
      race:     form.race,
      profBonus: PROF_BONUS[level] ?? 2,
      hitDice:  classData ? `${level}${classData.hitDice}` : char.hitDice,
    });
    setEditing(false);
  };

  return (
    <>
      <div className="header">
        <div className="header-user-bar">
          <div className="header-user-info">
            {user?.photoURL && (
              <img
                src={user.photoURL}
                alt={user.displayName}
                className="header-avatar"
                referrerPolicy="no-referrer"
              />
            )}
            <span className="header-username">
              {user?.displayName || user?.email}
            </span>
            {synced && <span className="header-synced">☁ salvo</span>}
          </div>
          <div className="header-actions">
            <button className="btn btn-sm" onClick={onSwitchChar} title="Trocar de ficha">
              ⟵ Trocar Ficha
            </button>
            <button className="btn btn-sm btn-red" onClick={onLogout} title="Sair">
              Sair
            </button>
          </div>
        </div>

        <div className="header-char-row">
          <div>
            <div className="char-name">{char.name}</div>
            <div className="char-sub">
              {[char.class, char.subclass].filter(Boolean).join(' — ')}
              {char.class && ' | '}
              Nível {char.level}
              {char.race && ` | ${char.race}`}
            </div>
          </div>
          <button className="btn btn-sm header-edit-btn" onClick={openEdit} title="Editar ficha">
            ✎ Editar
          </button>
        </div>
      </div>

      {editing && (
        <Modal title="Editar Personagem" onClose={() => setEditing(false)}>
          <div className="form-group">
            <label className="form-label">Nome</label>
            <input
              className="form-input"
              value={form.name}
              onChange={e => setField('name', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Espécie (Raça)</label>
            <select
              className="form-input"
              value={form.race}
              onChange={e => setField('race', e.target.value)}
            >
              <option value="">— Selecione —</option>
              {SPECIES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Classe</label>
              <select
                className="form-input"
                value={form.class}
                onChange={e => setField('class', e.target.value)}
              >
                <option value="">— Selecione —</option>
                {CLASSES.map(c => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Nível</label>
              <input
                className="form-input"
                type="number"
                min={1}
                max={20}
                value={form.level}
                onChange={e => setField('level', e.target.value)}
              />
            </div>
          </div>

          {form.class && (
            <div className="form-group">
              <label className="form-label">
                Subclasse
                {selectedClass && !showSubclass && (
                  <span className="form-label-hint"> (disponível ao nível {selectedClass.subclassLevel})</span>
                )}
              </label>
              <select
                className="form-input"
                value={form.subclass}
                onChange={e => setField('subclass', e.target.value)}
                disabled={!showSubclass}
              >
                <option value="">— Selecione —</option>
                {subclasses.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          )}

          <div className="btn-row">
            <button className="btn" onClick={() => setEditing(false)}>Cancelar</button>
            <button className="btn btn-gold" onClick={save}>Salvar</button>
          </div>
        </Modal>
      )}
    </>
  );
}

