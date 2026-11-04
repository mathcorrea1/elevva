// Deliberately empty: media, license and human review have not been supplied (D05).
export type LibrasVideo = {
  id: string;
  title: string;
  url: string;
  transcript: string;
  reviewer: string;
  reviewedAt: string;
  license: string;
};
export const librasManifest: LibrasVideo[] = [];
export const essentialScripts = [
  { id: 'welcome', text: 'Bem-vindo ao Eleva. Escolha o estudante que você acompanha.' },
  {
    id: 'activity',
    text: 'Leia a instrução. Escolha uma resposta e confirme. Você pode repetir a instrução.',
  },
  { id: 'save', text: 'Aguarde a confirmação de que a resposta foi salva.' },
];
