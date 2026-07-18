/*
 * gerar-pdf.js, gerador de PDF do mídia kit ÉthnosPRO.
 *
 * Renderiza o index.html com fidelidade ao layout de tela, sem depender do
 * Cmd+P do navegador. Usa Chrome headless via Puppeteer, emula media screen
 * (ignora as regras problemáticas de @media print) e força uma seção por
 * página, medindo a seção mais alta para que nada seja cortado.
 *
 * Como rodar (na pasta ethnospro-midiakit):
 *   1) npm install
 *   2) npm run pdf
 *
 * O PDF é salvo como ethnospro-midiakit.pdf nesta mesma pasta.
 *
 * Requer o servidor de preview no ar em http://localhost:4599. Se ele não
 * estiver rodando, o script cai automaticamente para file:// do index.html.
 */

const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");

const LARGURA = 1320; // largura de projeto das seções (.page max-width: 1320px)
const URL_PREVIEW = "http://localhost:4599/ethnospro-midiakit/index.html";
const CAMINHO_LOCAL = "file://" + path.resolve(__dirname, "index.html");
const SAIDA = path.resolve(__dirname, "ethnospro-midiakit.pdf");

async function abrirPagina(page) {
  // tenta o servidor de preview primeiro, cai para file:// se não responder
  try {
    await page.goto(URL_PREVIEW, { waitUntil: "networkidle0", timeout: 15000 });
    return URL_PREVIEW;
  } catch (e) {
    await page.goto(CAMINHO_LOCAL, { waitUntil: "networkidle0", timeout: 60000 });
    return CAMINHO_LOCAL;
  }
}

async function garantirImagensEFontes(page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    const imgs = Array.from(document.images);
    await Promise.all(
      imgs.map((img) =>
        img.complete && img.naturalWidth > 0
          ? Promise.resolve()
          : new Promise((resolve) => {
              img.addEventListener("load", resolve, { once: true });
              img.addEventListener("error", resolve, { once: true });
            })
      )
    );
  });
}

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.setViewport({ width: LARGURA, height: 800, deviceScaleFactor: 2 });

  const origem = await abrirPagina(page);
  await garantirImagensEFontes(page);

  // emula tela para o PDF sair igual ao layout de tela
  await page.emulateMediaType("screen");

  // mede a altura de conteúdo da seção mais alta, na largura de projeto,
  // desligando temporariamente o min-height: 100vh para medir o conteúdo real
  const { altura, secoes } = await page.evaluate(() => {
    const lista = Array.from(document.querySelectorAll(".page"));
    const anterior = lista.map((s) => s.style.minHeight);
    lista.forEach((s) => (s.style.minHeight = "auto"));
    const maior = Math.max(...lista.map((s) => Math.ceil(s.getBoundingClientRect().height)));
    lista.forEach((s, i) => (s.style.minHeight = anterior[i]));
    return { altura: maior, secoes: lista.length };
  });

  // ajusta a viewport para a altura final e força uma seção por página,
  // injetando CSS mínimo só na geração, sem tocar no index.html
  await page.setViewport({ width: LARGURA, height: altura, deviceScaleFactor: 2 });
  await page.addStyleTag({
    content:
      "@page { size: " + LARGURA + "px " + altura + "px; margin: 0; }" +
      "html, body { margin: 0; padding: 0; }" +
      ".page { min-height: " + altura + "px !important; height: " + altura + "px !important; page-break-after: always; break-after: page; }" +
      ".page:last-child { page-break-after: auto; break-after: auto; }" +
      ".page + .page { border-top: none !important; }",
  });

  await page.pdf({
    path: SAIDA,
    printBackground: true,
    preferCSSPageSize: true,
    width: LARGURA + "px",
    height: altura + "px",
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
  });

  await browser.close();

  const tamanho = fs.statSync(SAIDA).size;
  console.log("Origem: " + origem);
  console.log("Seções: " + secoes + " (uma por página)");
  console.log("Página: " + LARGURA + "x" + altura + "px (paisagem)");
  console.log("PDF gerado: " + SAIDA + " (" + Math.round(tamanho / 1024) + " KB)");
})();
