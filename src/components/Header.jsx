export default function Header({ char, onChange, user, synced, onLogout, onSwitchChar }) {
  return (
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
      <div className="char-name">{char.name}</div>
      <div className="char-sub">
        {char.class} — Subclasse: {char.subclass} &nbsp;|&nbsp; Nível {char.level} &nbsp;|&nbsp; {char.race}
      </div>
    </div>
  );
}
