import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { useCharacterData } from './hooks/useCharacterData';
import Header from './components/Header';
import Attributes from './components/Attributes';
import CombatStats from './components/CombatStats';
import Equipment from './components/Equipment';
import Powers from './components/Powers';
import Spells from './components/Spells';
import Notes from './components/Notes';
import CharacterSelector from './components/CharacterSelector';

const TABS = [
  { key: 'poderes', label: 'Poderes' },
  { key: 'talentos', label: 'Talentos' },
  { key: 'magias', label: 'Magias' },
  { key: 'equip', label: 'Equipamentos' },
  { key: 'notas', label: 'Anotações' },
];

export default function App() {
  const { user, login, logout } = useAuth();
  const [characterId, setCharacterId] = useState(null);
  const [char, setChar, synced] = useCharacterData(user?.uid ?? null, characterId);
  const [activeTab, setActiveTab] = useState('poderes');

  // Loading auth state
  if (user === undefined) {
    return (
      <div className="login-page">
        <div className="login-logo">⚔</div>
        <h1 className="login-title">Lorian Sheet</h1>
        <p className="login-sub">Carregando...</p>
      </div>
    );
  }

  // Not logged in → show login screen
  if (!user) {
    return (
      <div className="login-page">
        <div className="login-logo">⚔</div>
        <h1 className="login-title">Lorian Sheet</h1>
        <p className="login-sub">Gerencie suas fichas de personagem na nuvem</p>
        <button className="btn btn-gold login-btn" onClick={login}>
          <svg width="18" height="18" viewBox="0 0 533 533" fill="currentColor" style={{ flexShrink: 0 }}>
            <path d="M533 272q0 93-65 158t-171 65q-109 0-181-80H93v-80H0v-80h93q0-40 11-77H93V98h81q51-98 159-98 90 0 151 64l-57 57q-39-43-94-43-62 0-104 39l159 160q34-17 53-50h-91v-78h186q6 24 6 45z"/>
          </svg>
          Entrar com Google
        </button>
      </div>
    );
  }

  // Logged in but no character selected → show selector
  if (!characterId) {
    return (
      <CharacterSelector
        user={user}
        onSelect={(id) => { setCharacterId(id); setActiveTab('poderes'); }}
      />
    );
  }

  const updateChar = (newChar) => setChar(newChar);

  const toggleInspiration = () => {
    updateChar({ ...char, inspiration: !char.inspiration });
  };

  return (
    <>
      <Header
        char={char}
        onChange={updateChar}
        user={user}
        synced={synced}
        onLogout={() => { logout(); setCharacterId(null); }}
        onSwitchChar={() => setCharacterId(null)}
      />

      <div className="main-grid">
        {/* LEFT COL */}
        <div className="left-col">
          {/* Bônus de Proficiência */}
          <div className="prof-bonus-card">
            <div className="prof-bonus-label">Bônus de Proficiência</div>
            <div className="prof-bonus-val">+{char.profBonus}</div>
          </div>

          {/* Inspiração */}
          <div
            className={`inspiracao-card ${char.inspiration ? 'used' : ''}`}
            onClick={toggleInspiration}
            title="Clique para marcar como usada"
          >
            <span className="inspiracao-star">✦</span>
            <div className="inspiracao-label">Inspiração Heroica</div>
            <div className="inspiracao-sub">
              {char.inspiration ? 'usada — recupera em Descanso Longo' : 'disponível — clique para usar'}
            </div>
          </div>

          {/* Atributos */}
          <Attributes char={char} onChange={updateChar} />

          {/* Dinheiro */}
          <div className="card">
            <div className="card-title">Dinheiro</div>
            <div className="money-grid">
              <div className="money-item">
                <input
                  className="money-input"
                  type="number"
                  min={0}
                  value={char.money.gold}
                  onChange={e => updateChar({ ...char, money: { ...char.money, gold: Math.max(0, Number(e.target.value) || 0) } })}
                />
                <span className="money-label">Ouro</span>
              </div>
              <div className="money-item" style={{ borderColor: '#999' }}>
                <input
                  className="money-input"
                  style={{ color: '#ccc', borderColor: '#999' }}
                  type="number"
                  min={0}
                  value={char.money.silver}
                  onChange={e => updateChar({ ...char, money: { ...char.money, silver: Math.max(0, Number(e.target.value) || 0) } })}
                />
                <span className="money-label">Prata</span>
              </div>
              <div className="money-item" style={{ borderColor: '#c87533' }}>
                <input
                  className="money-input"
                  style={{ color: '#c87533', borderColor: '#c87533' }}
                  type="number"
                  min={0}
                  value={char.money.copper}
                  onChange={e => updateChar({ ...char, money: { ...char.money, copper: Math.max(0, Number(e.target.value) || 0) } })}
                />
                <span className="money-label">Cobre</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COL */}
        <div className="right-col">
          <CombatStats char={char} onChange={updateChar} />

          {/* Tabs */}
          <div className="tabs">
            {TABS.map(tab => (
              <button
                key={tab.key}
                className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'poderes' && (
            <Powers
              items={char.powers}
              onChange={powers => updateChar({ ...char, powers })}
              title="Poderes"
              category=""
            />
          )}
          {activeTab === 'talentos' && (
            <Powers
              items={char.talents}
              onChange={talents => updateChar({ ...char, talents })}
              title="Talentos"
              category="talent"
            />
          )}
          {activeTab === 'magias' && (
            <Spells
              spells={char.spells}
              onChange={spells => updateChar({ ...char, spells })}
            />
          )}
          {activeTab === 'equip' && (
            <Equipment char={char} onChange={updateChar} />
          )}
          {activeTab === 'notas' && (
            <Notes
              notes={char.notes}
              onChange={notes => updateChar({ ...char, notes })}
            />
          )}
        </div>
      </div>
    </>
  );
}
