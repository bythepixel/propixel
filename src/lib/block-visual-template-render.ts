function escapeHtml(input: string): string {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function nlToBr(input: string): string {
  return escapeHtml(input).replaceAll("\n", "<br />");
}

export function renderBlockVisualTemplateDocument(params: {
  html: string;
  css: string;
  js: string;
  block: { title: string; body: string };
}) {
  const blockBodyHtml = `<p>${nlToBr(params.block.body)}</p>`;
  const blockJson = JSON.stringify(params.block).replaceAll("</script>", "<\\/script>");
  const safeJs = params.js.replaceAll("</script>", "<\\/script>");
  const scopedJs = `(function(){\nconst BLOCK_DATA = ${blockJson};\nconst BLOCK_ROOT = document.currentScript ? document.currentScript.parentElement : null;\n${safeJs}\n})();`;

  return params.html
    .replaceAll("{{block_title}}", escapeHtml(params.block.title))
    .replaceAll("{{block_body}}", blockBodyHtml)
    .replaceAll("{{block_json}}", blockJson)
    .replaceAll("{{block_css}}", params.css)
    .replaceAll("{{block_js}}", scopedJs);
}
