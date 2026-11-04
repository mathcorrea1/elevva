# Eleva — pacote para o Codex

1. Extraia este ZIP em uma pasta de documentos dentro do workspace que contém o projeto Eleva. Não substitua os arquivos do aplicativo.
2. Envie/cole o conteúdo de `Eleva-V2-Prompt-Codex.md` ao Codex.
3. Peça para ele começar por `Eleva-TCC.md` e abrir também as figuras referenciadas.

## Conteúdo

- `Eleva-TCC.md`: conversão das 63 páginas do PDF, com tabelas e marcadores de página. Não é resumo nem uma nova FRD.
- `figuras/`: imagens do documento; versões originais e recortes de exibição vinculados no Markdown.
- `Eleva-TCC-original.pdf`: cópia idêntica do PDF anexado, para conferir diagramas ou tabelas ambíguas.
- `Eleva-V2-Prompt-Codex.md`: prompt atualizado, priorizando avaliar o reaproveitamento do projeto e planejar UX, acessibilidade, IA e persistência.
- `conferencia/Texto-integral-por-pagina.txt`: extração nativa do texto, sem reconstrução de tabelas, para conferência.
- `conferencia/Indice-das-figuras.md`: índice das 29 imagens originais com página e resolução.

## Observações de fidelidade

O original tem 63 páginas físicas; nas seções numeradas, a página impressa é a física menos seis. A conversão mantém essa correspondência. Algumas tabelas estão divididas entre páginas, como no PDF. Cabeçalhos neutros `Coluna N` são estrutura adicionada na conversão, não requisitos novos.

O texto dentro de figuras não foi transcrito por OCR. O Codex deve inspecionar essas imagens, em especial diagramas e protótipos das figuras 21–29. O texto do TCC mantém suas inconsistências e grafias originais; os pedidos atuais estão somente no prompt. Não confundir a conversão com especificação já consolidada.
