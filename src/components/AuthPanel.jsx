import { useAuth } from '../contexts/AuthContext';

export default function AuthPanel() {
  const { user, login, logout } = useAuth();

  if (user === undefined) return null; // loading

  if (!user) {
    return (
      <div style={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: 200,
      }}>
        <button
          className="btn btn-gold"
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px' }}
          onClick={login}
          title="Faça login para salvar seus dados na nuvem"
        >
          <svg width="16" height="16" viewBox="0 0 533 533" fill="currentColor">
            <path d="M533 272q0 93-65 158t-171 65q-109 0-181-80H93v-80H0v-80h93q0-40 11-77H93V98h81q51-98 159-98 90 0 151 64l-57 57q-39-43-94-43-62 0-104 39l159 160q34-17 53-50h-91v-78h186q6 24 6 45z"/>
          </svg>
          Entrar com Google
        </button>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: 16,
      right: 16,
      zIndex: 200,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      background: 'var(--card-bg)',
      border: '1px solid var(--gold)',
      borderRadius: 6,
      padding: '6px 12px',
    }}>
      {user.photoURL && (
        <img
          src={user.photoURL}
          alt={user.displayName}
          style={{ width: 24, height: 24, borderRadius: '50%' }}
          referrerPolicy="no-referrer"
        />
      )}
      <span style={{ fontSize: '0.8em', color: 'var(--text-dim)', fontFamily: "'Cinzel', serif", maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {user.displayName || user.email}
      </span>
      <span style={{ fontSize: '0.65em', color: 'var(--green-light)' }}>☁ salvo</span>
      <button
        className="btn btn-sm btn-red"
        onClick={logout}
        title="Sair"
        style={{ marginLeft: 4 }}
      >
        Sair
      </button>
    </div>
  );
}
