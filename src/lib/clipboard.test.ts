import { describe, expect, it } from "vitest";

import {
  normalizeClipboardText,
  writePlainTextClipboardData,
} from "./clipboard";
import { getStatusCodeCopyText, getStatusTextCopyText } from "./statusCopy";

describe("normalizeClipboardText", () => {
  it("normalizes multi-line clipboard text without empty edge lines", () => {
    expect(normalizeClipboardText("\n\n  Line one  \n\n  Line two \n\n")).toBe(
      "Line one\nLine two"
    );
  });

  it("normalizes single-line clipboard text", () => {
    expect(
      normalizeClipboardText("  PAP \n\n  status text \t", { singleLine: true })
    ).toBe("PAP status text");
  });
});

describe("status copy payloads", () => {
  it("copies exact status code without whitespace or line breaks", () => {
    expect(getStatusCodeCopyText("  P\nA P \n")).toBe("PAP");
  });

  it("builds status text as a single readable plain-text line", () => {
    expect(
      getStatusTextCopyText({
        code: "PAP",
        description: "\n Приемка завершена \n",
        action: "\n Переместить палету в буфер \n",
      })
    ).toBe("Приемка завершена | Действия: Переместить палету в буфер");
  });
});

describe("writePlainTextClipboardData", () => {
  it("writes only normalized text/plain data for manual selection copy", () => {
    const clipboardStore = new Map<string, string>();
    let cleared = false;

    const success = writePlainTextClipboardData(
      {
        clearData: () => {
          cleared = true;
          clipboardStore.clear();
        },
        setData: (type, value) => {
          clipboardStore.set(type, value);
        },
      },
      "\n\nОписание\n\nДействия: Проверить ячейку \n\n"
    );

    expect(success).toBe(true);
    expect(cleared).toBe(true);
    expect(Array.from(clipboardStore.keys())).toEqual(["text/plain"]);
    expect(clipboardStore.get("text/plain")).toBe("Описание\nДействия: Проверить ячейку");
  });
});
