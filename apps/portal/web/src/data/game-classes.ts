export type GameClass = {
  id: "warrior" | "guardian" | "thief" | "priest" | "wizard" | "archer" | "idoll" | "magician";
  slug: string;
  name: string;
  epithet: string;
  summary: string;
  role: string;
  range: string;
  rhythm: string;
  specialty: string;
  calling: string;
};

export const gameClasses: readonly GameClass[] = [
  { id: "warrior", slug: "guerreiro", name: "Guerreiro", epithet: "A lâmina que abre o caminho", summary: "Avança sem hesitar e transforma pressão constante em espaço para seus aliados.", role: "Ofensiva frontal", range: "Corpo a corpo", rhythm: "Direto e intenso", specialty: "Armas pesadas", calling: "Para quem prefere liderar cada investida e sustentar o combate pela força." },
  { id: "guardian", slug: "guardiao", name: "Guardião", epithet: "O escudo que não cede", summary: "Controla o campo, protege o grupo e permanece firme quando o reino exige resistência.", role: "Proteção", range: "Corpo a corpo", rhythm: "Seguro e calculado", specialty: "Defesa do grupo", calling: "Para quem encontra sua força protegendo outros viajantes." },
  { id: "thief", slug: "ladino", name: "Ladino", epithet: "Um golpe antes do aviso", summary: "Explora aberturas, muda de posição rapidamente e decide o confronto com precisão.", role: "Dano oportunista", range: "Curta distância", rhythm: "Ágil e técnico", specialty: "Mobilidade", calling: "Para quem gosta de observar, aproximar-se e agir no instante certo." },
  { id: "priest", slug: "sacerdote", name: "Sacerdote", epithet: "A luz que mantém a jornada", summary: "Canaliza proteção e restauração para sustentar companheiros durante as travessias mais difíceis.", role: "Suporte", range: "Média distância", rhythm: "Tático e atento", specialty: "Recuperação", calling: "Para quem acompanha o campo inteiro e transforma cuidado em vitória." },
  { id: "wizard", slug: "mago", name: "Mago", epithet: "O conhecimento toma forma", summary: "Concentra energia arcana e domina áreas do combate por meio de preparação e poder mágico.", role: "Magia ofensiva", range: "Longa distância", rhythm: "Preparado e explosivo", specialty: "Controle arcano", calling: "Para quem prefere compreender o confronto antes de liberar todo o seu poder." },
  { id: "archer", slug: "arqueiro", name: "Arqueiro", epithet: "Nenhum horizonte está distante", summary: "Mantém distância, escolhe seus alvos e combina movimento com ataques precisos.", role: "Ofensiva à distância", range: "Longa distância", rhythm: "Fluido e preciso", specialty: "Posicionamento", calling: "Para quem quer liberdade de movimento e domínio sobre cada disparo." },
  { id: "idoll", slug: "idol", name: "Idol", epithet: "Presença que transforma o campo", summary: "Conduz energia por meio de encanto e presença, fortalecendo a harmonia entre aliados.", role: "Suporte versátil", range: "Média distância", rhythm: "Expressivo e adaptável", specialty: "Fortalecimento", calling: "Para quem deseja influenciar toda a batalha e elevar o potencial do grupo." },
  { id: "magician", slug: "magician", name: "Magician", epithet: "A surpresa também é poder", summary: "Manipula cristais e artifícios mágicos em um estilo imprevisível, distinto da tradição arcana do Mago.", role: "Magia versátil", range: "Média distância", rhythm: "Criativo e variável", specialty: "Artifícios", calling: "Para quem gosta de experimentar soluções inesperadas e mudar o ritmo do confronto." },
] as const;

export const prestigeTiers = [
  { id: "bronze", name: "Bronze", level: 10, color: "#a96743", stage: "O primeiro passo", description: "O chamado ganha forma e o primeiro brasão reconhece o caminho escolhido." },
  { id: "silver", name: "Prata", level: 20, color: "#b9c8cb", stage: "A disciplina", description: "Técnica e constância começam a aparecer no metal da insígnia." },
  { id: "gold", name: "Ouro", level: 30, color: "#d2a53f", stage: "O reconhecimento", description: "O personagem deixa sua primeira marca permanente nos reinos." },
  { id: "platinum", name: "Platina", level: 40, color: "#d6e2e4", stage: "O domínio", description: "A experiência refina o brasão até um brilho frio e preciso." },
  { id: "topaz", name: "Topázio", level: 50, color: "#d8842e", stage: "A chama", description: "A vontade do viajante passa a irradiar calor através da insígnia." },
  { id: "amethyst", name: "Ametista", level: 60, color: "#955dcc", stage: "A visão arcana", description: "O brasão registra uma ligação mais profunda com a energia dos reinos." },
  { id: "obsidian", name: "Obsidiana", level: 70, color: "#536172", stage: "A resistência", description: "Escuro e lapidado, o símbolo carrega a força de quem não cedeu." },
  { id: "jade", name: "Jade", level: 80, color: "#679a84", stage: "A harmonia", description: "A pedra mineral revela equilíbrio, experiência e controle." },
  { id: "ruby", name: "Rubi", level: 90, color: "#bd334c", stage: "A conquista", description: "O vermelho profundo registra feitos que já atravessaram os reinos." },
  { id: "fernandium", name: "Fernandium", level: 100, color: "#5f88a6", stage: "O legado", description: "Um metal arcano raro, reservado aos nomes que se tornaram história." },
  { id: "miriamite", name: "Miriamita", level: 110, color: "#eadfd3", stage: "A transcendência", description: "O mineral lendário transforma toda a jornada em luz, memória e permanência." },
] as const;

export const MAX_CHARACTER_LEVEL = prestigeTiers.at(-1)!.level;
export type PrestigeTier = (typeof prestigeTiers)[number];

export function prestigeTierForLevel(value: number): PrestigeTier {
  const level = Math.min(MAX_CHARACTER_LEVEL, Math.max(0, Math.floor(value)));
  const attained = [...prestigeTiers].reverse().find(tier => level >= tier.level);
  return attained ?? prestigeTiers[0];
}

export function prestigeBlendForLevel(value: number) {
  const level = Math.min(MAX_CHARACTER_LEVEL, Math.max(0, value));
  if (level <= prestigeTiers[0].level) {
    return { from: prestigeTiers[0], to: prestigeTiers[0], progress: level / prestigeTiers[0].level };
  }

  const exact = prestigeTiers.find(tier => tier.level === level);
  if (exact) return { from: exact, to: exact, progress: 1 };

  const from = prestigeTierForLevel(level);
  const to = prestigeTiers.find(tier => tier.level > level) ?? from;
  return { from, to, progress: (level - from.level) / (to.level - from.level || 1) };
}

export function classHref(gameClass: GameClass) {
  return `/classes/${gameClass.slug}`;
}

export function findGameClass(slug: string) {
  return gameClasses.find(gameClass => gameClass.slug === slug);
}
