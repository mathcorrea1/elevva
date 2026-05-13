import { LiteracyLevel } from '@/utils/literacy.levels';

export const activitiesMock = [
  { id: 'a1', title: 'Nome da familia', type: 'writing', level: LiteracyLevel.PRE_SILABICO, phrase: 'MAMAE', completed: false },
  { id: 'a2', title: 'Sons iniciais', type: 'audio', level: LiteracyLevel.PRE_SILABICO, phrase: 'BOLA', completed: false },
  { id: 'a3', title: 'Silabas BA BE BI', type: 'reading', level: LiteracyLevel.SILABICO_SEM_VALOR, phrase: 'BEBE', completed: false },
  { id: 'a4', title: 'Silabas com valor', type: 'audio', level: LiteracyLevel.SILABICO_COM_VALOR, phrase: 'SAPATO', completed: false },
  { id: 'a5', title: 'Formacao de palavras', type: 'game', level: LiteracyLevel.SILABICO_COM_VALOR, phrase: 'CASA', completed: true },
  { id: 'a6', title: 'Leitura de frase', type: 'audio', level: LiteracyLevel.SILABICO_ALFABETICO, phrase: 'O GATO BEBE LEITE', completed: false },
  { id: 'a7', title: 'Escrita guiada', type: 'writing', level: LiteracyLevel.SILABICO_ALFABETICO, phrase: 'EU GOSTO DE LER', completed: false },
  { id: 'a8', title: 'Leitura autonoma', type: 'reading', level: LiteracyLevel.ALFABETICO, phrase: 'A MENINA LEU UM LIVRO', completed: false },
  { id: 'a9', title: 'Jogo das rimas', type: 'game', level: LiteracyLevel.PRE_SILABICO, phrase: 'RIMA', completed: true },
  { id: 'a10', title: 'Ditado curto', type: 'audio', level: LiteracyLevel.SILABICO_COM_VALOR, phrase: 'PATO', completed: false },
  { id: 'a11', title: 'Trava-linguas infantil', type: 'audio', level: LiteracyLevel.ALFABETICO, phrase: 'O RATO ROEU A ROUPA', completed: false },
];
