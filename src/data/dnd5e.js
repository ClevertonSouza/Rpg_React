// D&D 5.5e (2024 PHB) — Classes, Subclasses e Espécies

export const CLASSES = [
  {
    name: 'Bárbaro',
    hitDice: 'd12',
    subclassLevel: 3,
    subclasses: [
      'Caminho do Berserker',
      'Caminho do Coração Selvagem',
      'Caminho da Árvore do Mundo',
      'Caminho do Zelota',
    ],
  },
  {
    name: 'Bardo',
    hitDice: 'd8',
    subclassLevel: 3,
    subclasses: [
      'Colégio da Dança',
      'Colégio do Glamour',
      'Colégio do Saber',
      'Colégio do Valor',
    ],
  },
  {
    name: 'Clérigo',
    hitDice: 'd8',
    subclassLevel: 1,
    subclasses: [
      'Domínio da Vida',
      'Domínio da Luz',
      'Domínio do Ardil',
      'Domínio da Guerra',
      'Domínio do Conhecimento',
      'Domínio da Natureza',
      'Domínio da Tempestade',
    ],
  },
  {
    name: 'Druida',
    hitDice: 'd8',
    subclassLevel: 3,
    subclasses: [
      'Círculo da Terra',
      'Círculo da Lua',
      'Círculo do Mar',
      'Círculo das Estrelas',
    ],
  },
  {
    name: 'Feiticeiro',
    hitDice: 'd6',
    subclassLevel: 1,
    subclasses: [
      'Feitiçaria Dracônica',
      'Magia Selvagem',
      'Mente Aberrante',
      'Alma Relojoeira',
    ],
  },
  {
    name: 'Guerreiro',
    hitDice: 'd10',
    subclassLevel: 3,
    subclasses: [
      'Mestre de Batalha',
      'Campeão',
      'Cavaleiro Élfico',
      'Guerreiro Psi',
    ],
  },
  {
    name: 'Ladino',
    hitDice: 'd8',
    subclassLevel: 3,
    subclasses: [
      'Trapaceiro Arcano',
      'Assassino',
      'Alma-Lâmina',
      'Ladrão',
    ],
  },
  {
    name: 'Mago',
    hitDice: 'd6',
    subclassLevel: 2,
    subclasses: [
      'Abjurador',
      'Adivinhador',
      'Conjurador',
      'Encantador',
      'Evocador',
      'Ilusionista',
      'Necromante',
      'Transmutador',
    ],
  },
  {
    name: 'Monge',
    hitDice: 'd8',
    subclassLevel: 3,
    subclasses: [
      'Guerreiro dos Elementos',
      'Guerreiro da Mão Aberta',
      'Guerreiro das Sombras',
      'Guerreiro da Misericórdia',
    ],
  },
  {
    name: 'Paladino',
    hitDice: 'd10',
    subclassLevel: 3,
    subclasses: [
      'Juramento da Devoção',
      'Juramento da Glória',
      'Juramento dos Ancestrais',
      'Juramento da Vingança',
    ],
  },
  {
    name: 'Patrulheiro',
    hitDice: 'd10',
    subclassLevel: 3,
    subclasses: [
      'Mestre das Feras',
      'Errante Feérico',
      'Rastreador das Trevas',
      'Caçador',
    ],
  },
  {
    name: 'Bruxo',
    hitDice: 'd8',
    subclassLevel: 1,
    subclasses: [
      'Patrono Arquifada',
      'Patrono Celestial',
      'Patrono Demônio',
      'Patrono Grande Antigo',
    ],
  },
];

export const SPECIES = [
  'Aasimar',
  'Anão',
  'Draconato',
  'Elfo',
  'Gnomo',
  'Goliath',
  'Halfling',
  'Humano',
  'Orc',
  'Tiefling',
];

// Bônus de proficiência por nível (D&D 5e/5.5e)
export const PROF_BONUS = {
  1: 2, 2: 2, 3: 2, 4: 2,
  5: 3, 6: 3, 7: 3, 8: 3,
  9: 4, 10: 4, 11: 4, 12: 4,
  13: 5, 14: 5, 15: 5, 16: 5,
  17: 6, 18: 6, 19: 6, 20: 6,
};
