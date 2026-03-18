/**
 * Parser para a ficha oficial de D&D 5.5 (2024) em formato PDF brasileiro.
 *
 * Os nomes de campo do PDF são baseados em layout (não semânticos), então
 * usamos a posição Y das anotações para determinar a ordem das habilidades.
 */

// Decodifica nomes de campo com percentagem-encoding (ex: #C3#BAmero → Número)
function decodeFieldName(raw) {
  return decodeURIComponent(raw.replace(/#([0-9A-Fa-f]{2})/g, '%$1'));
}

// Mapeamento direto: nome do campo (decodificado) → propriedade do personagem
const DIRECT_FIELD_MAP = {
  'Esquerda Centro Single 12':             'name',
  'Esquerda Centro Single 12_2':           'background',
  'Esquerda Centro Single 12_3':           'class',
  'Esquerda Centro Single 12_4':           'subclass',
  'Esquerda Centro Single 12_5':           'race',

  // Números centralizados HV 8
  'Números Centralizados HV 8 Single_2':  'level',        // → parseInt
  'Números Centralizados HV 8 Single_4':  'ac',           // → parseInt
  'Números Centralizados HV 8 Single_5':  'inteligencia_value',
  'Números Centralizados HV 8 Single_6':  'sabedoria_mod',
  'Números Centralizados HV 8 Single_7':  'sabedoria_value',
  'Números Centralizados HV 8 Single_8':  'carisma_mod',
  'Números Centralizados HV 8 Single_9':  'carisma_value',
  'Números Centralizados HV 8 Single_10': 'constituicao_mod',
  'Números Centralizados HV 8 Single_11': 'constituicao_value',
  'Números Centralizados HV 8 Single_12': 'destreza_mod',
  'Números Centralizados HV 8 Single_13': 'destreza_value',
  'Números Centralizados HV 8 Single_14': 'forca_mod',
  'Números Centralizados HV 8 Single_15': 'forca_value',

  // Números centralizados HV 12
  'Números Centralizados HV 12 Single':   'initiative',
  'Números Centralizados HV 12 Single_2': 'profBonus',    // → parseInt
  'Números Centralizados HV 12 Single_3': 'speedRaw',     // → transformar em "Xm"
  'Números Centralizados HV 12 Single_4': 'passivePerception',

  // HP e dados de vida
  'Esquerda baixo 12_2': 'hitDice',
  'Esquerda baixo 12_5': 'hpMax',          // → parseInt
  'Esquerda baixo 12_3': 'hpCurrentRaw',   // ex: "4 - 4" → pegar segundo número

  // Inspiração
  'Caixa de seleção 1': 'inspirationRaw',  // "Yes" → true

  // Moeda
  'Caixa de texto 5_4': 'goldRaw',         // → parseInt

  // Idiomas (página 2)
  'Caixa de texto 6_3': 'languages',
};

// Ordem das habilidades no PDF (confirmada por posição Y, de cima para baixo)
// Mapeadas aos nomes em defaultCharacter.js
// Os campos do PDF têm índices 4, 4_2...4_24 (checkboxes) e 6, 6_2...6_24 (bônus)
// Ordenados por Y decrescente (de cima da página para baixo):
//   4(Off), 4_2(Off), 4_3(Off), 4_4(Off), 4_5(Off), 4_6(Off)+4_23(Yes),
//   4_24(Yes), 4_7(Off), 4_8(Off)+4_18(Off), 4_9(Off)+4_19(Off),
//   4_10(Off)+4_20(Yes), 4_11(Yes)+4_21(Off), 4_12(Yes),
//   4_22(Yes), 4_13(Off), 4_14(Off), 4_15(Off), 4_16(Yes), 4_17(Off)
// Por posição Y decrescente (cima→baixo):
const SKILL_CHECKBOX_ORDER = [
  // [checkboxField, skillName em defaultCharacter]
  // Bloco superior (Y ~581 → ~406)
  'Caixa de seleção 4',      // 0 → Acrobacia
  'Caixa de seleção 4_2',    // 1 → Arcanismo
  'Caixa de seleção 4_3',    // 2 → ...
  'Caixa de seleção 4_4',
  'Caixa de seleção 4_5',
  'Caixa de seleção 4_6',
  'Caixa de seleção 4_23',   // 6 (mesma linha que _6)
  'Caixa de seleção 4_24',   // 7
  // Bloco meio (Y ~408 → ~332)
  'Caixa de seleção 4_7',    // 8
  'Caixa de seleção 4_8',    // 9
  'Caixa de seleção 4_18',   // 10
  'Caixa de seleção 4_9',    // 11
  'Caixa de seleção 4_19',   // 12
  'Caixa de seleção 4_10',   // 13
  'Caixa de seleção 4_20',   // 14
  'Caixa de seleção 4_11',   // 15
  'Caixa de seleção 4_21',   // 16
  'Caixa de seleção 4_12',   // 17
  // Bloco inferior (Y ~240 → ~172)
  'Caixa de seleção 4_22',   // 18
  'Caixa de seleção 4_13',   // 19
  'Caixa de seleção 4_14',   // 20
  'Caixa de seleção 4_15',   // 21
  'Caixa de seleção 4_16',   // 22
  'Caixa de seleção 4_17',   // 23
];

// Mapeamento posicional → skill name (ordem da ficha D&D 5.5 PT)
// A ficha oficial D&D 5.5 lista as habilidades em ordem ALFABÉTICA em PT:
// Acrobacia, Arcanismo, Atletismo, Atuação, Enganação, Furtividade,
// História, Intimidação, Intuição, Investigação, Lidar com Animais,
// Medicina, Natureza, Percepção, Persuasão, Prestidigitação, Religião, Sobrevivência
// O PDF tem 24 checkboxes para 18 habilidades + 6 de outra seção.
// Mas baseado nos Y positions, os checkboxes estão em pares interleaved.
// Analisando: checkboxes com Y acima de 500 = bloco de DEX skills (Acrobacia, etc.)
// Vamos mapear por posição Y ordenada:
const SKILL_BY_POSITION = [
  'Acrobacia',         // 0
  'Arcanismo',         // 1
  'Atletismo',         // 2
  'Atuação',           // 3
  'Enganação',         // 4
  'Furtividade',       // 5
  'História',          // 6
  'Intimidação',       // 7
  'Intuição',          // 8
  'Investigação',      // 9
  'Lidar com Animais', // 10
  'Medicina',          // 11
  'Natureza',          // 12
  'Percepção',         // 13
  'Persuasão',         // 14
  'Prestidigitação',   // 15
  'Religião',          // 16
  'Sobrevivência',     // 17
];

/**
 * Extrai todos os campos de anotação de todas as páginas do PDF.
 * Retorna um Map de fieldName → fieldValue.
 */
async function extractFields(pdfDoc) {
  const fieldMap = new Map();
  const numPages = pdfDoc.numPages;

  for (let p = 1; p <= numPages; p++) {
    const page = await pdfDoc.getPage(p);
    const annotations = await page.getAnnotations();
    for (const ann of annotations) {
      if (ann.subtype === 'Widget' && ann.fieldName) {
        const decodedName = decodeFieldName(ann.fieldName);
        fieldMap.set(decodedName, {
          value: ann.fieldValue ?? '',
          y: ann.rect ? ann.rect[1] : 0,
          x: ann.rect ? ann.rect[0] : 0,
        });
      }
    }
  }
  return fieldMap;
}

/**
 * Obtém os checkboxes de habilidade ordenados por posição Y (de cima para baixo).
 */
function getSkillCheckboxesByY(fieldMap) {
  const prefix = 'Caixa de seleção 4';
  const entries = [];
  for (const [name, data] of fieldMap.entries()) {
    if (name === prefix || name.startsWith(prefix + '_')) {
      entries.push({ name, value: data.value, y: data.y, x: data.x });
    }
  }
  // Ordenar por Y decrescente (top → bottom na página)
  entries.sort((a, b) => b.y - a.y);
  return entries;
}

/**
 * Converte os campos extraídos numa estrutura parcial de personagem
 * compatível com defaultCharacter.js
 */
function buildCharacter(fieldMap) {
  const get = (name) => fieldMap.get(name)?.value ?? '';

  // Campos diretos
  const raw = {};
  for (const [fieldName, charProp] of Object.entries(DIRECT_FIELD_MAP)) {
    raw[charProp] = get(fieldName);
  }

  // Atributos
  const attrs = {
    forca: {
      value: parseInt(raw.forca_value) || 10,
      mod: parseInt(raw.forca_mod) || 0,
      saveProficient: false,
    },
    destreza: {
      value: parseInt(raw.destreza_value) || 10,
      mod: parseInt(raw.destreza_mod) || 0,
      saveProficient: false,
    },
    constituicao: {
      value: parseInt(raw.constituicao_value) || 10,
      mod: parseInt(raw.constituicao_mod) || 0,
      saveProficient: false,
    },
    inteligencia: {
      value: parseInt(raw.inteligencia_value) || 10,
      mod: Math.floor((parseInt(raw.inteligencia_value) - 10) / 2),
      saveProficient: false,
    },
    sabedoria: {
      value: parseInt(raw.sabedoria_value) || 10,
      mod: parseInt(raw.sabedoria_mod) || 0,
      saveProficient: false,
    },
    carisma: {
      value: parseInt(raw.carisma_value) || 10,
      mod: parseInt(raw.carisma_mod) || 0,
      saveProficient: false,
    },
  };

  // Habilidades (proficiências por posição Y)
  const skillCheckboxes = getSkillCheckboxesByY(fieldMap);
  const skillsFromDefaultOrder = [
    'Atletismo',
    'Acrobacia',
    'Furtividade',
    'Prestidigitação',
    'Arcanismo',
    'História',
    'Investigação',
    'Natureza',
    'Religião',
    'Intuição',
    'Lidar com Animais',
    'Medicina',
    'Percepção',
    'Sobrevivência',
    'Atuação',
    'Enganação',
    'Intimidação',
    'Persuasão',
  ];

  // Mapear posição no PDF (ordem Y) para skill name (ordem alfabética do PDF D&D 5.5)
  // Posição Y → nome da skill em ordem alfabética PT D&D 5.5
  const pdfSkillOrder = [
    'Acrobacia',
    'Arcanismo',
    'Atletismo',
    'Atuação',
    'Enganação',
    'Furtividade',
    'História',
    'Intimidação',
    'Intuição',
    'Investigação',
    'Lidar com Animais',
    'Medicina',
    'Natureza',
    'Percepção',
    'Persuasão',
    'Prestidigitação',
    'Religião',
    'Sobrevivência',
  ];

  // skillCheckboxes já estão ordenados por Y desc (topo→base), mapeando para pdfSkillOrder
  const proficientSkills = new Set();

  // O PDF tem 24 checkboxes mas apenas 18 skills. Alguns checkboxes são de seção dupla.
  // Vamos pegar apenas os primeiros 18 em ordem de Y que correspondem às skills
  // Porém o PDF tem pares interleaved (dois campos por Y próximo).
  // Estratégia: agrupar por Y próximo (delta < 5) e para cada grupo pegar o que está "Yes"
  const yGroups = [];
  let currentGroup = null;
  for (const cb of skillCheckboxes) {
    if (!currentGroup || Math.abs(currentGroup.y - cb.y) > 8) {
      currentGroup = { y: cb.y, items: [cb] };
      yGroups.push(currentGroup);
    } else {
      currentGroup.items.push(cb);
    }
  }

  // Cada grupo corresponde a uma linha de skill no PDF
  // O PDF D&D 5.5 tem 18 skills em 18 linhas
  for (let i = 0; i < Math.min(yGroups.length, pdfSkillOrder.length); i++) {
    const group = yGroups[i];
    const skillName = pdfSkillOrder[i];
    // Se qualquer checkbox do grupo for "Yes", a skill é proficiente
    if (group.items.some(item => item.value === 'Yes')) {
      proficientSkills.add(skillName);
    }
  }

  const skills = skillsFromDefaultOrder.map(name => ({
    name,
    attr: getAttrForSkill(name),
    proficient: proficientSkills.has(name),
  }));

  // HP Current: campo "hpCurrentRaw" pode ter formato "X - Y" (temp - current) ou só "X"
  let hpCurrent = 0;
  const hpRaw = raw.hpCurrentRaw || '';
  if (hpRaw.includes('-')) {
    const parts = hpRaw.split('-');
    hpCurrent = parseInt(parts[parts.length - 1].trim()) || 0;
  } else {
    hpCurrent = parseInt(hpRaw) || 0;
  }

  // Velocidade: campo "speedRaw" → adicionar "m" para metros
  let speed = '';
  if (raw.speedRaw) {
    const sNum = parseInt(raw.speedRaw);
    if (!isNaN(sNum)) speed = sNum * 1.5 + 'm'; // 9 casas × 1.5m = 13.5m — ou manter como está
    speed = raw.speedRaw + 'm';
  }

  // Notas: idiomas
  const notes = raw.languages ? `Idiomas: ${raw.languages.trim()}` : '';

  return {
    name:       raw.name || 'Personagem Importado',
    class:      raw.class || '',
    subclass:   raw.subclass || '',
    level:      parseInt(raw.level) || 1,
    race:       raw.race || '',
    background: raw.background || '',
    profBonus:  parseInt(raw.profBonus) || 2,
    speed,
    initiative: raw.initiative || '+0',
    hitDice:    raw.hitDice || '1d8',
    hpMax:      parseInt(raw.hpMax) || 0,
    hpCurrent,
    ac:         parseInt(raw.ac) || 10,
    acSource:   '',
    inspiration: raw.inspirationRaw === 'Yes',
    attributes: attrs,
    skills,
    weapons:    [],
    armors:     [],
    equipment:  [],
    powers:     [],
    talents:    [],
    spells:     [],
    money: {
      gold:   parseInt(raw.goldRaw) || 0,
      silver: 0,
      copper: 0,
    },
    notes,
  };
}

function getAttrForSkill(name) {
  const map = {
    'Atletismo':         'forca',
    'Acrobacia':         'destreza',
    'Furtividade':       'destreza',
    'Prestidigitação':   'destreza',
    'Arcanismo':         'inteligencia',
    'História':          'inteligencia',
    'Investigação':      'inteligencia',
    'Natureza':          'inteligencia',
    'Religião':          'inteligencia',
    'Intuição':          'sabedoria',
    'Lidar com Animais': 'sabedoria',
    'Medicina':          'sabedoria',
    'Percepção':         'sabedoria',
    'Sobrevivência':     'sabedoria',
    'Atuação':           'carisma',
    'Enganação':         'carisma',
    'Intimidação':       'carisma',
    'Persuasão':         'carisma',
  };
  return map[name] ?? 'forca';
}

/**
 * Função principal: recebe um File ou ArrayBuffer e retorna os dados do personagem.
 */
export async function parsePdfSheet(file) {
  // Importação dinâmica para não bloquear o bundle principal
  const pdfjsLib = await import('pdfjs-dist');

  // Configurar worker para Vite (v5.x usa build/pdf.worker.mjs)
  const { default: workerUrl } = await import('pdfjs-dist/build/pdf.worker.mjs?url');
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

  let arrayBuffer;
  if (file instanceof ArrayBuffer) {
    arrayBuffer = file;
  } else {
    arrayBuffer = await file.arrayBuffer();
  }

  const typedArray = new Uint8Array(arrayBuffer);
  const pdfDoc = await pdfjsLib.getDocument({ data: typedArray }).promise;

  const fieldMap = await extractFields(pdfDoc);
  return buildCharacter(fieldMap);
}
