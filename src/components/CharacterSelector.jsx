import { useState } from 'react';
import { useCharacterList } from '../hooks/useCharacterList';
import ImportPdfButton from './ImportPdfButton';

export default function CharacterSelector({ user, onSelect }) {
  const { characters, loading, createCharacter, deleteCharacter } = useCharacterList(user?.uid);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [busy, setBusy] = useState(false);

  const handleCreate = async () => {
    if (busy) return;
    setBusy(true);
    const id = await createCharacter(newName);
    setNewName('');
    setCreating(false);
    setBusy(false);
    onSelect(id);
  };

  const handleImportPdf = async (charData) => {
    if (busy) return;
    setBusy(true);
    const id = await createCharacter(charData.name, charData);
    setBusy(false);
    onSelect(id);
  };

  const handleDelete = async (id) => {
    if (busy) return;
    setBusy(true);
    await deleteCharacter(id);
    setConfirmDelete(null);
    setBusy(false);
  };

  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="selector-page">
      <div className="selector-container">
        <div className="selector-logo">⚔</div>
        <h1 className="selector-title">Lorian Sheet</h1>
        <p className="selector-subtitle">Bem-vindo, {user.displayName?.split(' ')[0] ?? 'Aventureiro'}</p>

        <div className="selector-header">
          <span className="selector-section-label">Suas Fichas</span>
          <div className="selector-header-actions">
            {!creating && (
              <button className="btn btn-gold" onClick={() => setCreating(true)}>
                + Nova Ficha
              </button>
            )}
            <ImportPdfButton onImport={handleImportPdf} disabled={busy || creating} />
          </div>
        </div>

        {creating && (
          <div className="selector-create-row">
            <input
              className="form-input selector-new-input"
              placeholder="Nome do personagem"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleCreate();
                if (e.key === 'Escape') setCreating(false);
              }}
              autoFocus
            />
            <button className="btn btn-gold" onClick={handleCreate} disabled={busy}>
              Criar
            </button>
            <button className="btn btn-sm" onClick={() => { setCreating(false); setNewName(''); }}>
              Cancelar
            </button>
          </div>
        )}

        {loading ? (
          <p className="selector-empty">Carregando fichas...</p>
        ) : characters.length === 0 ? (
          <p className="selector-empty">
            Nenhuma ficha encontrada. Crie uma nova para começar.
          </p>
        ) : (
          <div className="selector-list">
            {characters.map(c => (
              <div key={c.id} className="selector-item">
                {confirmDelete === c.id ? (
                  <div className="selector-item-confirm">
                    <span className="selector-confirm-text">Confirmar exclusão de "{c.name}"?</span>
                    <div className="selector-item-actions">
                      <button
                        className="btn btn-red btn-sm"
                        onClick={() => handleDelete(c.id)}
                        disabled={busy}
                      >
                        Excluir
                      </button>
                      <button
                        className="btn btn-sm"
                        onClick={() => setConfirmDelete(null)}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="selector-item-info" onClick={() => onSelect(c.id)}>
                      <span className="selector-item-name">{c.name}</span>
                      {c.updatedAt && (
                        <span className="selector-item-date">
                          Editado em {formatDate(c.updatedAt)}
                        </span>
                      )}
                    </div>
                    <div className="selector-item-actions">
                      <button
                        className="btn btn-gold btn-sm"
                        onClick={() => onSelect(c.id)}
                      >
                        Abrir
                      </button>
                      <button
                        className="btn btn-sm btn-red"
                        onClick={() => setConfirmDelete(c.id)}
                      >
                        Excluir
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
