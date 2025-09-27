const HEADER_REGEX = /^(шк товара|стикер товара|стоимость товаров)$/i;
const SKU_REGEX = /^\d{8,}$/;
const PRICE_NUMBER_REGEX = /(\d[\s\d]*[.,]\d{2})/;
const PRICE_WITH_CURRENCY_REGEX = /(\d[\s\d]*[.,]\d{2})\s*₽/i;
const PRICE_LINE_REGEX = /\d[\s\d]*[.,]\d{2}\s*$/;
const STICKER_REGEX = /стикер/i;

interface NormalizeResult {
  text: string;
  lines: string[];
  rawLines: string[];
}

interface ParseSkuOptions {
  unique?: boolean;
}

export type PriceFormat = "report" | "excel";

interface ParsePriceOptions {
  unique?: boolean;
  format?: PriceFormat;
}

function normalizeInput(raw: string): NormalizeResult {
  const text = raw
    .replace(/\r\n?|\r/g, "\n")
    .replace(/[\u00A0\u202F]/g, " ");

  const rawLines = text.split("\n");
  const lines = rawLines
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !HEADER_REGEX.test(line));

  return { text, lines, rawLines };
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

function formatReportValue(value: number): string {
  const formatted = new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

  return formatted.replace(/\u00A0/g, " ");
}

function formatExcelValue(value: number): string {
  return value.toFixed(2);
}

function extractNumericValue(candidate: string): number | null {
  const normalized = candidate.replace(/[\u00A0\u202F]/g, " ").replace(/\s+/g, " ").trim();
  const withCurrency = normalized.match(PRICE_WITH_CURRENCY_REGEX);

  if (withCurrency) {
    return parseNumeric(withCurrency[1]);
  }

  const plainMatch = normalized.match(PRICE_NUMBER_REGEX);
  if (plainMatch) {
    return parseNumeric(plainMatch[1]);
  }

  return null;
}

function parseNumeric(value: string): number | null {
  const digits = value.replace(/\s+/g, "").replace(/,/g, ".");
  const parsed = Number.parseFloat(digits);

  if (Number.isNaN(parsed)) {
    return null;
  }

  return parsed;
}

export function parseSkus(raw: string, options: ParseSkuOptions = {}): string[] {
  const { unique } = options;
  const normalized = normalizeInput(raw);
  const results: string[] = [];

  const hasTabs = normalized.text.includes("\t");

  if (hasTabs) {
    for (const rawLine of normalized.rawLines) {
      if (!rawLine.includes("\t")) continue;
      const [firstColumn] = rawLine.split("\t");
      const value = firstColumn?.trim();
      if (value && SKU_REGEX.test(value)) {
        results.push(value);
      }
    }

    if (results.length > 0) {
      return ensureUnique(results, unique);
    }
  }

  let firstNumberCaptured = false;
  let previousWasPrice = false;

  for (const line of normalized.lines) {
    const isPriceLine = line.includes("₽") || PRICE_LINE_REGEX.test(line);

    if (isPriceLine) {
      previousWasPrice = true;
      continue;
    }

    if (SKU_REGEX.test(line)) {
      if (!firstNumberCaptured) {
        results.push(line);
        firstNumberCaptured = true;
      } else if (previousWasPrice) {
        results.push(line);
      }

      previousWasPrice = false;
      continue;
    }

    previousWasPrice = false;
  }

  if (results.length > 0) {
    return ensureUnique(results, unique);
  }

  const fallbackMatches = Array.from(normalized.text.matchAll(/\d{8,}/g)).map((match) => match[0]);
  const fallbackResults: string[] = [];

  for (let index = 0; index < fallbackMatches.length; index += 2) {
    const value = fallbackMatches[index];
    if (value) {
      fallbackResults.push(value);
    }
  }

  return ensureUnique(fallbackResults, unique);
}

export function parsePrices(
  raw: string,
  options: ParsePriceOptions = {}
): string[] {
  const { unique, format = "report" } = options;
  const normalized = normalizeInput(raw);
  const values: number[] = [];
  const hasTabs = normalized.text.includes("\t");

  if (hasTabs) {
    for (const rawLine of normalized.rawLines) {
      if (!rawLine.includes("\t")) continue;
      const columns = rawLine.split("\t");
      if (columns.length < 3) continue;
      const candidate = columns[2]?.trim();
      if (!candidate) continue;
      const numeric = extractNumericValue(candidate);
      if (numeric !== null) {
        values.push(numeric);
      }
    }

    if (values.length > 0) {
      return formatPrices(values, { unique, format });
    }
  }

  let lastLineType: "none" | "sku" | "sticker" | "price" = "none";

  for (const line of normalized.lines) {
    if (SKU_REGEX.test(line)) {
      lastLineType = "sku";
      continue;
    }

    if (STICKER_REGEX.test(line)) {
      lastLineType = "sticker";
      continue;
    }

    const normalizedLine = line.replace(/\s+/g, " ");
    const withCurrency = normalizedLine.match(PRICE_WITH_CURRENCY_REGEX);
    if (withCurrency) {
      const numeric = parseNumeric(withCurrency[1]);
      if (numeric !== null) {
        values.push(numeric);
        lastLineType = "price";
        continue;
      }
    }

    const plainMatch = normalizedLine.match(PRICE_NUMBER_REGEX);
    if (plainMatch && (lastLineType === "sticker" || lastLineType === "sku")) {
      const numeric = parseNumeric(plainMatch[1]);
      if (numeric !== null) {
        values.push(numeric);
        lastLineType = "price";
        continue;
      }
    }

    if (plainMatch && normalizedLine.toLowerCase().includes("стоим")) {
      const numeric = parseNumeric(plainMatch[1]);
      if (numeric !== null) {
        values.push(numeric);
        lastLineType = "price";
        continue;
      }
    }

    lastLineType = "none";
  }

  return formatPrices(values, { unique, format });
}

function formatPrices(
  values: number[],
  options: Required<Pick<ParsePriceOptions, "format">> & Pick<ParsePriceOptions, "unique">
): string[] {
  const formatted = values.map((value) =>
    options.format === "report" ? formatReportValue(value) : formatExcelValue(value)
  );

  return ensureUnique(formatted, options.unique);
}
