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
  { id: "bronze", name: "Bronze", stage: "O chamado", description: "Todo viajante começa formando sua identidade e aprendendo o caminho da classe." },
  { id: "silver", name: "Prata", stage: "A experiência", description: "A jornada ganha forma e o brasão passa a registrar domínio e constância." },
  { id: "gold", name: "Ouro", stage: "O reconhecimento", description: "O personagem deixa sua marca nos reinos e carrega um símbolo mais nobre." },
  { id: "jade", name: "Jade", stage: "A ascensão", description: "O prestígio máximo transforma o brasão na expressão viva da trajetória do personagem." },
] as const;

export function classHref(gameClass: GameClass) {
  return `/classes/${gameClass.slug}`;
}

export function findGameClass(slug: string) {
  return gameClasses.find(gameClass => gameClass.slug === slug);
}
