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
import AuthPanel from './components/AuthPanel';

const TABS = [
  { key: 'poderes', label: 'Poderes' },
  { key: 'talentos', label: 'Talentos' },
  { key: 'magias', label: 'Magias' },
  { key: 'equip', label: 'Equipamentos' },
  { key: 'notas', label: 'Anotações' },
];

export default function App() {
  const { user } = useAuth();
  const [char, setChar, synced] = useCharacterData(user?.uid ?? null);
  const [activeTab, setActiveTab] = useState('poderes');

  const updateChar = (newChar) => setChar(newChar);

  const toggleInspiration = () => {
    updateChar({ ...char, inspiration: !char.inspiration });
  };

  return (
    <>
      <Header char={char} onChange={updateChar} />

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
      <AuthPanel />
    </>
  );
}
