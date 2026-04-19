import { normalizeClipboardText } from "@/lib/clipboard";

type StatusCopyShape = {
  code: string;
  description: string;
  action?: string;
};

export function getStatusCodeCopyText(code: string) {
  return normalizeClipboardText(code, { singleLine: true }).replace(/\s+/g, "");
}

export function getStatusTextCopyText(status: StatusCopyShape) {
  const description = normalizeClipboardText(status.description, { singleLine: true });
  const action = normalizeClipboardText(status.action ?? "", { singleLine: true });

  if (description && action) {
    return `${description} | Действия: ${action}`;
  }

  return description || action;
}
