export const VARIABLE_TOKEN_HELP = "Use {{var.NAME}} tokens in block content, overrides, Block Visuals, and Global Visuals.";

export function buildVariableMap(
  globals: { name: string; value: string }[],
  proposalVars: { name: string; value: string }[],
): Record<string, string> {
  const map: Record<string, string> = {};
  for (const item of globals) {
    const key = item.name.trim();
    if (!key) continue;
    map[key] = item.value ?? "";
  }
  for (const item of proposalVars) {
    const key = item.name.trim();
    if (!key) continue;
    map[key] = item.value ?? "";
  }
  return map;
}

function missingVariableHtml(name: string): string {
  return `<span style="background:#ff0000;color:#ffff00;font-weight:700;padding:0 4px;border-radius:2px;">MISSING VAR: ${name}</span>`;
}

export function applyVariableTokens(
  input: string,
  variables: Record<string, string>,
  options?: { missingMode?: "empty" | "keep-token" | "html-warning" },
): string {
  const missingMode = options?.missingMode ?? "empty";
  return input.replace(/\{\{var\.([a-zA-Z0-9_.-]+)\}\}/g, (_match, name: string) => {
    const found = variables[name];
    if (found !== undefined) return found;
    if (missingMode === "keep-token") return `{{var.${name}}}`;
    if (missingMode === "html-warning") return missingVariableHtml(name);
    return "";
  });
}

export function applyCommonTokens(input: string, params: { proposalTitle?: string }): string {
  return input.replaceAll("{{proposal_title}}", params.proposalTitle ?? "");
}
