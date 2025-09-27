const HEADER_REGEX = /^(шк товара|стикер товара|стоимость товаров)$/i;
const STRICT_NUMBER_REGEX = /^\d{8,}$/;
const PRICE_LINE_REGEX = /\d[\s\d]*[.,]\d{2}\s*$/;

type ExtractMode = "sku" | "sticker";

interface NormalizeResult {
  text: string;
  rawLines: string[];
  lines: string[];
}

interface ParseIdOptions {
  mode?: ExtractMode;
  unique?: boolean;
}

interface Token {
  type: "number" | "price";
  value: string;
}

interface TokenizeResult {
  tokens: Token[];
  hasPrice: boolean;
}

function normalizeInput(raw: string): NormalizeResult {
  const text = raw
    .replace(/\r\n?|\r/g, "\n")
    .replace(/[\u00A0\u202F]/g, " ");

  const rawLines = text.split("\n");
  const lines = rawLines
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !HEADER_REGEX.test(line));

  return { text, rawLines, lines };
}

function ensureUnique(values: string[], unique?: boolean): string[] {
  if (!unique) {
    return values;
  }

  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    if (seen.has(value)) continue;
    seen.add(value);
    result.push(value);
  }

  return result;
}

function isPriceLine(line: string): boolean {
  const normalized = line.replace(/\s+/g, " ");
  return normalized.includes("₽") || PRICE_LINE_REGEX.test(normalized);
}

function extractFromTable(
  normalized: NormalizeResult,
  columnIndex: number
): string[] {
  const results: string[] = [];

  for (const rawLine of normalized.rawLines) {
    if (!rawLine.includes("\t")) continue;

    const columns = rawLine.split("\t");
    if (columns.length <= columnIndex) continue;

    const candidate = columns[columnIndex]?.trim();
    if (candidate && STRICT_NUMBER_REGEX.test(candidate)) {
      results.push(candidate);
    }
  }

  return results;
}

function tokenize(lines: string[]): TokenizeResult {
  const tokens: Token[] = [];
  let hasPrice = false;

  for (const line of lines) {
    if (line.includes("\t")) continue;

    if (isPriceLine(line)) {
      tokens.push({ type: "price", value: line });
      hasPrice = true;
      continue;
    }

    const matches = line.match(/\d{8,}/g);
    if (!matches) continue;

    for (const match of matches) {
      if (STRICT_NUMBER_REGEX.test(match)) {
        tokens.push({ type: "number", value: match });
      }
    }
  }

  return { tokens, hasPrice };
}

function extractFromTokens(tokens: Token[]): { sku: string; sticker: string }[] {
  const pairs: { sku: string; sticker: string }[] = [];

  for (let index = 0; index < tokens.length; ) {
    const first = tokens[index];
    const second = tokens[index + 1];

    if (first?.type === "number" && second?.type === "number") {
      const third = tokens[index + 2];
      pairs.push({ sku: first.value, sticker: second.value });

      if (third?.type === "price") {
        index += 3;
      } else {
        index += 2;
      }
      continue;
    }

    index += 1;
  }

  return pairs;
}

export function parseIds(raw: string, options: ParseIdOptions = {}): string[] {
  const { mode = "sku", unique = true } = options;
  const normalized = normalizeInput(raw);
  const hasTabs = normalized.text.includes("\t");

  if (hasTabs) {
    const columnIndex = mode === "sku" ? 0 : 1;
    const tabular = extractFromTable(normalized, columnIndex);
    if (tabular.length > 0) {
      return ensureUnique(tabular, unique);
    }
  }

  const { tokens, hasPrice } = tokenize(normalized.lines);
  const pairs = extractFromTokens(tokens);

  if (pairs.length > 0 && hasPrice) {
    const extracted = pairs.map((pair) => (mode === "sku" ? pair.sku : pair.sticker));
    return ensureUnique(extracted, unique);
  }

  const fallbackMatches = Array.from(normalized.text.matchAll(/\d{8,}/g)).map(
    (match) => match[0]
  );

  const fallback: string[] = [];
  const startIndex = mode === "sku" ? 0 : 1;

  for (let index = startIndex; index < fallbackMatches.length; index += 2) {
    const value = fallbackMatches[index];
    if (value && STRICT_NUMBER_REGEX.test(value)) {
      fallback.push(value);
    }
  }

  return ensureUnique(fallback, unique);
}
