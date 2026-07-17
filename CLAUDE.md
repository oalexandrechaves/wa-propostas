# CLAUDE.md, Estúdio WA, Gerador de Propostas

Página administrativa de página única que gera propostas comerciais em PDF com a
identidade visual do deck original do Estúdio WA. O administrador preenche campos,
anexa o logotipo do cliente, escolhe a orientação e baixa o PDF na hora.

## Arquitetura

- Sem backend, sem banco de dados, sem autenticação.
- HTML, CSS e JavaScript vanilla, tudo num único `legado.html` com CSS e JS embutidos.
- Sem framework, sem build step, sem bundler. O Vercel serve estático direto.
- Estado só em memória. Sem `localStorage` e sem `sessionStorage`. Nada é persistido.
- Ativos definitivos na pasta `assets/`, extraídos do deck original. Não regerar.

## Regras globais

- Traço longo é proibido em qualquer lugar: código, comentários, textos de
  interface, conteúdo dos slides e mensagens de commit. Use vírgula, parênteses
  ou dois pontos.
- Acentuação portuguesa completa e correta em tudo que é texto: cedilha, agudos,
  circunflexos, til, crases. Nunca omita.
- Mudanças aditivas. Não reescreva o que já funciona.
- Git obrigatório. Rode `git remote -v` antes de qualquer push, confirme que o
  destino é `oalexandrechaves/wa-propostas`. Todo deploy no Vercel tem que estar
  versionado no repositório remoto.
- Um commit por bloco, não um commit gigante.

## Sincronização com o GitHub

O código está versionado no repositório remoto `oalexandrechaves/wa-propostas`,
público, com o remote `origin` configurado e a branch `main` rastreando
`origin/main`. Todo push deve continuar indo para esse destino, sempre depois
de conferir `git remote -v`.

Fica como próximo passo, quando for conveniente, ligar o projeto Vercel
`wa-propostas` a esse repositório, para que os próximos deploys saiam do GitHub
e não mais do disco pelo Vercel CLI.

## Gerador de orçamentos (orcamentos.html)

Ferramenta interna separada, em `orcamentos.html`, para o Estúdio WA e a
BINAH DIGITAL montarem orçamentos comerciais. Não substitui o `legado.html`,
é uma página adicional e independente.

- Arquivo único, HTML, CSS e JavaScript vanilla, sem backend, sem build.
- Nenhuma dependência externa em runtime. Sem CDN, sem Google Fonts, sem
  bibliotecas. Fontes por pilha do sistema, para funcionar offline.
- Duas colunas: painel de configuração à esquerda, preview ao vivo à direita,
  atualizando a cada alteração. Estado só em memória.
- O catálogo é a constante `CATALOGO` no topo do arquivo, comentada, para
  editar preços, descrições e itens inclusos sem tocar na lógica.
- Cor de identidade por categoria: Estúdio e Podcast magenta, Produção externa
  laranja, Identidade e Pós-produção roxo, EthnosPRO verde, Web e Sistemas azul,
  Assessoria de Imprensa ciano.
- Regras de negócio: exclusividade entre planos e pacotes de estúdio (marcar um
  desmarca os incompatíveis com aviso), cortes desabilitados quando o pacote
  intensivo está selecionado (já inclusos), serviços com valor a definir bloqueiam
  o PDF até o valor ser preenchido, e dois totais separados que nunca se somam:
  total mensal recorrente e total de pagamento único.
- PDF vetorial por `window.print()`, sem rasterização. A regra `@page` é injetada
  conforme a orientação: paisagem `size: 297mm 167mm; margin: 0` e A4 retrato
  `size: A4 portrait; margin: 0`. Um slide por página, sem página em branco no
  final, e o painel de configuração não aparece na impressão.
- WhatsApp de contato no slide de próximos passos: https://wa.me/5511912877060

## Ferramenta ativa e roteamento (vercel.json)

A ferramenta ativa é o `orcamentos.html`, o gerador de orçamentos, servido na
raiz. Ele é a página que deve responder em `/`.

O gerador de propostas antigo foi renomeado de `index.html` para `legado.html`,
com `git mv` para preservar o histórico. Continua preservado e intocado, apenas
com outro nome. É acessível em `/legado`. Depende de CDN (Google Fonts,
html2canvas, jsPDF) e não funciona offline, ao contrário do `orcamentos.html`.

Há um `vercel.json` na raiz, aditivo, com dois rewrites:

- `/` serve o `orcamentos.html`. Como não existe mais `index.html` na raiz, não
  há arquivo estático competindo pelo path `/`, então o rewrite tem efeito.
- `/legado` serve o `legado.html`. Funciona porque não existe arquivo em `/legado`.

## Identidade visual

Cores: grafite `#1F1E1E`, preto `#0F0E0E`, vermelho `#E63329`, creme `#F6F1E7`,
texto claro `#EDE7DC`, texto fraco `#B8B0A4`, tinta `#17161A`.

Tipografia: Poppins para corpo e rótulos, Fraunces para display (substitui a
Quincy CF do original). Rótulos utilitários em Poppins 600, caixa alta, com
espaçamento entre letras.

Assinatura: recorte de jornal rasgado (`papel.png`) preso por um alfinete
vermelho (`alfinete.png`) sobre um círculo de papel amassado (`circulo.png`).
Todo título de slide escuro usa esse dispositivo. Slides claros usam tipografia
pura sobre creme. No máximo um dispositivo de papel rasgado por slide.

## Orientação

Paisagem `1920x1080` e retrato `1080x1920`, controladas por `data-orient` no
contêiner do deck. As duas variações vivem em CSS, sem duplicar o HTML dos slides.

## Exportação em PDF

html2canvas mais jsPDF por CDN. Aguardar `document.fonts.ready`, aplicar a classe
`exportando` para zerar o `scale()` e capturar em tamanho natural, uma página por
slide ativo. Nome do arquivo: `Proposta-{cliente-em-kebab-case}-{AAAA-MM-DD}.pdf`.
