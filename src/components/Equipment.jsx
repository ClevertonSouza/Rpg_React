import { useState } from 'react';
import Modal from './Modal';

function WeaponForm({ initial, onSave, onCancel }) {
  const [f, setF] = useState(initial || { name: '', damage: '', attackBonus: '', properties: [], weight: '', cost: '' });
  const [propStr, setPropStr] = useState((initial?.properties || []).join(', '));

  const save = () => {
    if (!f.name.trim()) return;
    onSave({ ...f, properties: propStr.split(',').map(p => p.trim()).filter(Boolean) });
  };

  return (
    <>
      <div className="form-group">
        <label className="form-label">Nome</label>
        <input className="form-input" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} />
      </div>
      <div className="form-group">
        <label className="form-label">Dano</label>
        <input className="form-input" value={f.damage} onChange={e => setF({ ...f, damage: e.target.value })} placeholder="1d6 Cortante" />
      </div>
      <div className="form-group">
        <label className="form-label">Bônus de Ataque</label>
        <input className="form-input" value={f.attackBonus} onChange={e => setF({ ...f, attackBonus: e.target.value })} placeholder="+5 (DES) ou +7 (FOR)" />
      </div>
      <div className="form-group">
        <label className="form-label">Propriedades (separar por vírgula)</label>
        <input className="form-input" value={propStr} onChange={e => setPropStr(e.target.value)} placeholder="Acuidade, Leve, Maestria: Ágil" />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label">Peso</label>
          <input className="form-input" value={f.weight} onChange={e => setF({ ...f, weight: e.target.value })} />
        </div>
        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label">Custo</label>
          <input className="form-input" value={f.cost} onChange={e => setF({ ...f, cost: e.target.value })} />
        </div>
      </div>
      <div className="btn-row">
        <button className="btn" onClick={onCancel}>Cancelar</button>
        <button className="btn btn-gold" onClick={save}>Salvar</button>
      </div>
    </>
  );
}

function ArmorForm({ initial, onSave, onCancel }) {
  const [f, setF] = useState(initial || { name: '', acFormula: '', properties: [], weight: '', cost: '' });
  const [propStr, setPropStr] = useState((initial?.properties || []).join(', '));

  const save = () => {
    if (!f.name.trim()) return;
    onSave({ ...f, properties: propStr.split(',').map(p => p.trim()).filter(Boolean) });
  };

  return (
    <>
      <div className="form-group">
        <label className="form-label">Nome</label>
        <input className="form-input" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} />
      </div>
      <div className="form-group">
        <label className="form-label">Fórmula de CA</label>
        <input className="form-input" value={f.acFormula} onChange={e => setF({ ...f, acFormula: e.target.value })} placeholder="CA: 14 + Des (máx. 2) = 16" />
      </div>
      <div className="form-group">
        <label className="form-label">Propriedades (vírgula)</label>
        <input className="form-input" value={propStr} onChange={e => setPropStr(e.target.value)} />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label">Peso</label>
          <input className="form-input" value={f.weight} onChange={e => setF({ ...f, weight: e.target.value })} />
        </div>
        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label">Custo</label>
          <input className="form-input" value={f.cost} onChange={e => setF({ ...f, cost: e.target.value })} />
        </div>
      </div>
      <div className="btn-row">
        <button className="btn" onClick={onCancel}>Cancelar</button>
        <button className="btn btn-gold" onClick={save}>Salvar</button>
      </div>
    </>
  );
}

function ItemForm({ initial, onSave, onCancel }) {
  const [f, setF] = useState(initial || { name: '', qty: 1 });

  const save = () => {
    if (!f.name.trim()) return;
    onSave({ ...f, qty: Math.max(1, Number(f.qty) || 1) });
  };

  return (
    <>
      <div className="form-group">
        <label className="form-label">Nome do Item</label>
        <input className="form-input" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} />
      </div>
      <div className="form-group">
        <label className="form-label">Quantidade</label>
        <input className="form-input" type="number" min={1} value={f.qty} onChange={e => setF({ ...f, qty: e.target.value })} />
      </div>
      <div className="btn-row">
        <button className="btn" onClick={onCancel}>Cancelar</button>
        <button className="btn btn-gold" onClick={save}>Salvar</button>
      </div>
    </>
  );
}

let nextId = 100;
function genId() { return ++nextId; }

export default function Equipment({ char, onChange }) {
  const [modal, setModal] = useState(null); // { type, editing }
  const { weapons, armors, equipment } = char;

  const closeModal = () => setModal(null);

  // Weapons
  const saveWeapon = (data) => {
    if (modal.editing) {
      const newWeapons = weapons.map(w => w.id === modal.editing.id ? { ...modal.editing, ...data } : w);
      onChange({ ...char, weapons: newWeapons });
    } else {
      onChange({ ...char, weapons: [...weapons, { ...data, id: genId() }] });
    }
    closeModal();
  };
  const deleteWeapon = (id) => onChange({ ...char, weapons: weapons.filter(w => w.id !== id) });

  // Armors
  const saveArmor = (data) => {
    if (modal.editing) {
      const newArmors = armors.map(a => a.id === modal.editing.id ? { ...modal.editing, ...data } : a);
      onChange({ ...char, armors: newArmors });
    } else {
      onChange({ ...char, armors: [...armors, { ...data, id: genId() }] });
    }
    closeModal();
  };
  const deleteArmor = (id) => onChange({ ...char, armors: armors.filter(a => a.id !== id) });

  // Items
  const saveItem = (data) => {
    if (modal.editing) {
      const newEquip = equipment.map(i => i.id === modal.editing.id ? { ...modal.editing, ...data } : i);
      onChange({ ...char, equipment: newEquip });
    } else {
      onChange({ ...char, equipment: [...equipment, { ...data, id: genId() }] });
    }
    closeModal();
  };
  const deleteItem = (id) => onChange({ ...char, equipment: equipment.filter(i => i.id !== id) });

  return (
    <>
      {/* ARMAS */}
      <div style={{ marginBottom: 16 }}>
        <div className="equip-sub-title">
          <span>⚔ Armas</span>
          <button className="add-btn" onClick={() => setModal({ type: 'weapon', editing: null })}>+ Adicionar</button>
        </div>
        {weapons.map(w => (
          <div className="weapon-card" key={w.id}>
            <div className="weapon-name">{w.name}</div>
            <div className="weapon-stats">
              <span className="weapon-stat-badge damage">{w.damage}</span>
              <span className="weapon-stat-badge atk">Ataque: {w.attackBonus}</span>
              {w.properties.map((p, i) => (
                <span className="weapon-stat-badge" key={i}>{p}</span>
              ))}
              {w.weight && <span className="weapon-stat-badge">{w.weight} · {w.cost}</span>}
            </div>
            <div className="item-actions">
              <button className="btn btn-sm" onClick={() => setModal({ type: 'weapon', editing: w })}>✎</button>
              <button className="btn btn-sm btn-red" onClick={() => deleteWeapon(w.id)}>✕</button>
            </div>
          </div>
        ))}
      </div>

      {/* ARMADURAS */}
      <div style={{ marginBottom: 16 }}>
        <div className="equip-sub-title">
          <span>🛡 Armaduras</span>
          <button className="add-btn" onClick={() => setModal({ type: 'armor', editing: null })}>+ Adicionar</button>
        </div>
        {armors.map(a => (
          <div className="armor-card" key={a.id}>
            <div className="armor-name">{a.name}</div>
            <div className="weapon-stats">
              <span className="weapon-stat-badge" style={{ borderColor: '#64b5f6', color: '#64b5f6' }}>{a.acFormula}</span>
              {a.properties.map((p, i) => (
                <span className="weapon-stat-badge" key={i}>{p}</span>
              ))}
              {a.weight && <span className="weapon-stat-badge">{a.weight} · {a.cost}</span>}
            </div>
            <div className="item-actions">
              <button className="btn btn-sm" onClick={() => setModal({ type: 'armor', editing: a })}>✎</button>
              <button className="btn btn-sm btn-red" onClick={() => deleteArmor(a.id)}>✕</button>
            </div>
          </div>
        ))}
      </div>

      {/* ITENS */}
      <div style={{ marginBottom: 16 }}>
        <div className="equip-sub-title">
          <span>🎒 Itens</span>
          <button className="add-btn" onClick={() => setModal({ type: 'item', editing: null })}>+ Adicionar</button>
        </div>
        <div className="item-grid">
          {equipment.map(item => (
            <div className="item-card" key={item.id}>
              <div className="item-qty">x{item.qty}</div>
              <div className="item-name">{item.name}</div>
              <div className="item-actions">
                <button className="btn btn-sm" onClick={() => setModal({ type: 'item', editing: item })}>✎</button>
                <button className="btn btn-sm btn-red" onClick={() => deleteItem(item.id)}>✕</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAIS */}
      {modal?.type === 'weapon' && (
        <Modal title={modal.editing ? 'Editar Arma' : 'Nova Arma'} onClose={closeModal}>
          <WeaponForm initial={modal.editing} onSave={saveWeapon} onCancel={closeModal} />
        </Modal>
      )}
      {modal?.type === 'armor' && (
        <Modal title={modal.editing ? 'Editar Armadura' : 'Nova Armadura'} onClose={closeModal}>
          <ArmorForm initial={modal.editing} onSave={saveArmor} onCancel={closeModal} />
        </Modal>
      )}
      {modal?.type === 'item' && (
        <Modal title={modal.editing ? 'Editar Item' : 'Novo Item'} onClose={closeModal}>
          <ItemForm initial={modal.editing} onSave={saveItem} onCancel={closeModal} />
        </Modal>
      )}
    </>
  );
}
