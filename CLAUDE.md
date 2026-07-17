# CLAUDE.md, Estúdio WA, Gerador de Propostas

Página administrativa de página única que gera propostas comerciais em PDF com a
identidade visual do deck original do Estúdio WA. O administrador preenche campos,
anexa o logotipo do cliente, escolhe a orientação e baixa o PDF na hora.

## Arquitetura

- Sem backend, sem banco de dados, sem autenticação.
- HTML, CSS e JavaScript vanilla, tudo num único `index.html` com CSS e JS embutidos.
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

## Pendência de sincronização (dívida a quitar)

O deploy no Vercel foi feito primeiro, pelo Vercel CLI já logado no ambiente
(conta `alexandrechaves847-4576`), subindo os arquivos direto do disco para um
projeto novo e isolado chamado `wa-propostas`, sem passar pelo GitHub.

Isto é uma dívida a quitar, não um estado aceitável: existe um deploy em produção
sem repositório remoto correspondente. Enquanto essa dívida não for paga, o código
em produção não tem origem versionada e rastreável. Precisa ser resolvido assim
que possível:

- Criar o repositório `oalexandrechaves/wa-propostas` no GitHub.
- Adicionar o remote e fazer o push de todo este código, que já está commitado
  localmente em commits separados por bloco.
- Ligar o projeto Vercel `wa-propostas` a esse repositório, para que deploy e
  repositório fiquem sincronizados nos próximos deploys.

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
