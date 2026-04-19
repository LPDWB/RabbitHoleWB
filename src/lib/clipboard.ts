type NormalizeClipboardOptions = {
  singleLine?: boolean;
};

type PlainTextClipboardData = {
  clearData?: () => void;
  setData: (type: string, value: string) => void;
};

const INVISIBLE_CHARACTERS = /[\u200B-\u200D\uFEFF]/g;
const LINE_ENDINGS = /\r\n?/g;
const INLINE_WHITESPACE = /[^\S\n]+/g;

function trimEmptyEdgeLines(lines: string[]) {
  let start = 0;
  let end = lines.length;

  while (start < end && lines[start] === "") start += 1;
  while (end > start && lines[end - 1] === "") end -= 1;

  return lines.slice(start, end);
}

export function normalizeClipboardText(
  value: string,
  options: NormalizeClipboardOptions = {}
) {
  const normalizedSource = String(value ?? "")
    .replace(INVISIBLE_CHARACTERS, "")
    .replace(/\u00A0/g, " ")
    .replace(LINE_ENDINGS, "\n");

  const lines = trimEmptyEdgeLines(
    normalizedSource
      .split("\n")
      .map((line) => line.replace(INLINE_WHITESPACE, " ").trim())
  );

  if (options.singleLine) {
    return lines.filter(Boolean).join(" ").replace(INLINE_WHITESPACE, " ").trim();
  }

  return lines.filter(Boolean).join("\n").trim();
}

function fallbackCopyPlainText(value: string) {
  if (typeof document === "undefined") return false;

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "true");
  textarea.setAttribute("aria-hidden", "true");
  textarea.style.position = "fixed";
  textarea.style.top = "0";
  textarea.style.left = "0";
  textarea.style.opacity = "0";
  textarea.style.pointerEvents = "none";
  textarea.style.whiteSpace = "pre";

  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  textarea.setSelectionRange(0, textarea.value.length);

  const success = document.execCommand("copy");
  document.body.removeChild(textarea);

  return success;
}

export async function copyPlainText(text: string): Promise<boolean> {
  const normalized = normalizeClipboardText(text);

  if (!normalized) return false;

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(normalized);
      return true;
    }
  } catch {
    // Fall back to a temporary textarea when async clipboard access is blocked.
  }

  return fallbackCopyPlainText(normalized);
}

export function writePlainTextClipboardData(
  clipboardData: PlainTextClipboardData | null | undefined,
  text: string
) {
  const normalized = normalizeClipboardText(text);
  if (!clipboardData || !normalized) return false;

  clipboardData.clearData?.();
  clipboardData.setData("text/plain", normalized);
  return true;
}
