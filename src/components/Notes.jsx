export default function Notes({ notes, onChange }) {
  return (
    <>
      <div className="card-title" style={{ marginBottom: 8 }}>
        <span>Anotações</span>
      </div>
      <textarea
        className="notes-area"
        value={notes}
        onChange={e => onChange(e.target.value)}
        placeholder="Escreva suas anotações aqui... (eventos da sessão, planos, NPCs, etc.)"
      />
    </>
  );
}
