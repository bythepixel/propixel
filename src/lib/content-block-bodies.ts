type BlockWithBodies = { body: string; bodyFieldsJson: string };

export function parseBodyFields(block: BlockWithBodies): string[] {
  try {
    const parsed = JSON.parse(block.bodyFieldsJson);
    if (Array.isArray(parsed)) {
      const fields = parsed.map((v) => String(v));
      if (fields.length > 0) return fields;
    }
  } catch {
    // Fall back to legacy single body field.
  }
  return [block.body];
}

export function normalizeBodyFields(rawFields: string[]): string[] {
  const fields = rawFields.map((v) => v ?? "").map(String);
  const compact = fields.filter((v) => v.trim() !== "");
  return compact.length > 0 ? compact : [""];
}
