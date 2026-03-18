const ATTR_LABELS = {
  forca: 'Força',
  destreza: 'Destreza',
  constituicao: 'Constituição',
  inteligencia: 'Inteligência',
  sabedoria: 'Sabedoria',
  carisma: 'Carisma',
};

const ATTR_SKILLS = {
  forca: ['Atletismo'],
  destreza: ['Acrobacia', 'Furtividade', 'Prestidigitação'],
  constituicao: [],
  inteligencia: ['Arcanismo', 'História', 'Investigação', 'Natureza', 'Religião'],
  sabedoria: ['Intuição', 'Lidar com Animais', 'Medicina', 'Percepção', 'Sobrevivência'],
  carisma: ['Atuação', 'Enganação', 'Intimidação', 'Persuasão'],
};

export default function Attributes({ char, onChange }) {
  const { attributes, skills, profBonus } = char;

  const getSkillBonus = (attrKey, skillName) => {
    const mod = attributes[attrKey].mod;
    const sk = skills.find(s => s.name === skillName);
    const prof = sk ? sk.proficient : false;
    return mod + (prof ? profBonus : 0);
  };

  const getSaveBonus = (attrKey) => {
    const mod = attributes[attrKey].mod;
    return mod + (attributes[attrKey].saveProficient ? profBonus : 0);
  };

  const toggleSkillProf = (skillName) => {
    const newSkills = skills.map(s =>
      s.name === skillName ? { ...s, proficient: !s.proficient } : s
    );
    onChange({ ...char, skills: newSkills });
  };

  const toggleSaveProf = (attrKey) => {
    const newAttrs = {
      ...attributes,
      [attrKey]: { ...attributes[attrKey], saveProficient: !attributes[attrKey].saveProficient },
    };
    onChange({ ...char, attributes: newAttrs });
  };

  const updateAttrValue = (attrKey, newVal) => {
    const v = Math.max(1, Math.min(30, Number(newVal) || 1));
    const mod = Math.floor((v - 10) / 2);
    const newAttrs = {
      ...attributes,
      [attrKey]: { ...attributes[attrKey], value: v, mod },
    };
    onChange({ ...char, attributes: newAttrs });
  };

  const formatMod = (m) => (m >= 0 ? `+${m}` : `${m}`);

  return (
    <>
      {Object.keys(ATTR_LABELS).map(key => {
        const attr = attributes[key];
        const label = ATTR_LABELS[key];
        const relSkills = ATTR_SKILLS[key];

        return (
          <div className="attr-block" key={key}>
            <div className="attr-name">{label}</div>
            <div className="attr-labels"><span>Modificador</span><span>Valor</span></div>
            <div className="attr-header">
              <div className="attr-mod-circle">{formatMod(attr.mod)}</div>
              <div style={{ flex: 1 }} />
              <input
                className="attr-valor"
                type="number"
                value={attr.value}
                min={1}
                max={30}
                onChange={e => updateAttrValue(key, e.target.value)}
                style={{ width: 50, cursor: 'text' }}
              />
            </div>
            {/* Salvaguarda */}
            <div className="skill-row" onClick={() => toggleSaveProf(key)} style={{ cursor: 'pointer' }}>
              <div className={`skill-check ${attr.saveProficient ? 'prof' : ''}`}>
                {attr.saveProficient ? '✓' : ''}
              </div>
              <div className="skill-bonus">{formatMod(getSaveBonus(key))}</div>
              <div className="skill-name save">Salvaguarda</div>
            </div>
            {/* Perícias */}
            {relSkills.map(sk => {
              const skData = skills.find(s => s.name === sk);
              const prof = skData ? skData.proficient : false;
              return (
                <div className="skill-row" key={sk} onClick={() => toggleSkillProf(sk)} style={{ cursor: 'pointer' }}>
                  <div className={`skill-check ${prof ? 'prof' : ''}`}>
                    {prof ? '✓' : ''}
                  </div>
                  <div className="skill-bonus">{formatMod(getSkillBonus(key, sk))}</div>
                  <div className="skill-name">{sk}</div>
                </div>
              );
            })}
          </div>
        );
      })}
    </>
  );
}
