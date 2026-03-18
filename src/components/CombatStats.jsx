export default function CombatStats({ char, onChange }) {
  const update = (field, val) => onChange({ ...char, [field]: val });

  return (
    <div className="card">
      <div className="card-title">Status de Combate</div>
      <div className="combat-grid">
        <div className="stat-box hp-box">
          <span className="stat-label">PV Atual / Máximo</span>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 4 }}>
            <input
              className="hp-input"
              type="number"
              value={char.hpCurrent}
              min={0}
              max={char.hpMax}
              onChange={e => update('hpCurrent', Math.min(char.hpMax, Math.max(0, Number(e.target.value) || 0)))}
            />
            <span style={{ color: '#e57373', fontFamily: "'Cinzel', serif", fontSize: '1.2em' }}>/</span>
            <input
              className="hp-input"
              type="number"
              value={char.hpMax}
              min={1}
              onChange={e => update('hpMax', Math.max(1, Number(e.target.value) || 1))}
            />
          </div>
        </div>
        <div className="stat-box ac-box">
          <span className="stat-label">Classe de Armadura</span>
          <input
            className="hp-input"
            style={{ color: '#64b5f6', borderColor: '#2e5a8f', width: 50 }}
            type="number"
            value={char.ac}
            onChange={e => update('ac', Number(e.target.value) || 0)}
          />
          <span className="stat-label" style={{ fontSize: '0.6em' }}>{char.acSource}</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Iniciativa</span>
          <span className="stat-val">{char.initiative}</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Deslocamento</span>
          <span className="stat-val">{char.speed}</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Dados de Vida</span>
          <span className="stat-val">{char.hitDice}</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Bônus Proficiência</span>
          <span className="stat-val">+{char.profBonus}</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Ataque Bônus (FOR)</span>
          <span className="stat-val">+{char.attributes.forca.mod + char.profBonus}</span>
          <span className="stat-label" style={{ fontSize: '0.6em' }}>+{char.attributes.forca.mod} mod +{char.profBonus} prof</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Ataque Bônus (DES)</span>
          <span className="stat-val">+{char.attributes.destreza.mod + char.profBonus}</span>
          <span className="stat-label" style={{ fontSize: '0.6em' }}>+{char.attributes.destreza.mod} mod +{char.profBonus} prof</span>
        </div>
      </div>
    </div>
  );
}
