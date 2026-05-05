function escapeHtml(input: string): string {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function renderBlockVisualTemplateDocument(params: {
  html: string;
  css: string;
  js: string;
  block: { title: string; body: string; bodyFields?: string[] };
  proposalVisualTemplate?: { css: string; js: string } | null;
}) {
  const bodyFields = params.block.bodyFields && params.block.bodyFields.length > 0 ? params.block.bodyFields : [params.block.body];
  const blockBodyHtml = bodyFields[0] ?? params.block.body;
  const blockJson = JSON.stringify({
    title: params.block.title,
    body: blockBodyHtml,
    bodyFields,
  }).replaceAll("</script>", "<\\/script>");
  const safeJs = params.js.replaceAll("</script>", "<\\/script>");
  const scopedJs = `(function(){\nconst BLOCK_DATA = ${blockJson};\nconst BLOCK_ROOT = document.currentScript ? document.currentScript.parentElement : null;\n${safeJs}\n})();`;

  let rendered = params.html
    .replaceAll("{{block_title}}", escapeHtml(params.block.title))
    .replaceAll("{{block_json}}", blockJson)
    .replaceAll("{{block_css}}", params.css)
    .replaceAll("{{block_js}}", scopedJs);
  bodyFields.forEach((body, idx) => {
    const token = `{body_${idx + 1}}`;
    const dblToken = `{{body_${idx + 1}}}`;
    rendered = rendered.replaceAll(token, body).replaceAll(dblToken, body);
  });
  if (params.proposalVisualTemplate?.css) {
    rendered = `<style>${params.proposalVisualTemplate.css}</style>\n${rendered}`;
  }
  if (params.proposalVisualTemplate?.js) {
    const safeHostJs = params.proposalVisualTemplate.js.replaceAll("</script>", "<\\/script>");
    rendered = `${rendered}\n<script>${safeHostJs}</script>`;
  }
  return rendered;
}
