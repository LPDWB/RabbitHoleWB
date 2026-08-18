import { NextResponse } from "next/server";
import knowledgeBase from "@/data/knowledgeBase.json";

export interface WMSStatus {
  id: string;
  code: string;
  category: string;
  description: string;
  action: string;
  badgeType?: "blue" | "yellow" | "purple" | "cyan" | "green" | "red";
  priority?: "high" | "normal" | "low";
}

const DEFAULT_STATUSES: WMSStatus[] = knowledgeBase as WMSStatus[];

function detectCategory(code: string, desc: string, action: string): string {
  const text = `${desc} ${action} ${code}`.toLowerCase();
  if (
    text.includes("приемк") ||
    text.includes("приёмк") ||
    text.includes("принят") ||
    text.includes("выгрузк") ||
    text.includes("поступлен")
  ) {
    return "Приемка";
  }
  if (
    text.includes("раскладк") ||
    text.includes("мх") ||
    text.includes("размещен") ||
    text.includes("ячейк") ||
    text.includes("стеллаж") ||
    text.includes("хранен")
  ) {
    return "Раскладка и МХ";
  }
  if (
    text.includes("сборк") ||
    text.includes("собран") ||
    text.includes("отбор") ||
    text.includes("пикинг")
  ) {
    return "Сборка";
  }
  if (
    text.includes("упаковк") ||
    text.includes("переупаковк") ||
    text.includes("завернуть") ||
    text.includes("пакет") ||
    text.includes("скотч")
  ) {
    return "Упаковка";
  }
  if (
    text.includes("сортировк") ||
    text.includes("отгрузк") ||
    text.includes("рейс") ||
    text.includes("пвз") ||
    text.includes("сц") ||
    text.includes("консолидац")
  ) {
    return "Сортировка и Отгрузка";
  }
  if (
    text.includes("перемещен") ||
    text.includes("паллет") ||
    text.includes("карщик") ||
    text.includes("грузчик") ||
    text.includes("транзит")
  ) {
    return "Перемещение";
  }
  if (
    text.includes("инвентар") ||
    text.includes("пересчет") ||
    text.includes("ревизи") ||
    text.includes("остатк")
  ) {
    return "Инвентаризация";
  }
  if (
    text.includes("брак") ||
    text.includes("подмен") ||
    text.includes("неправильн") ||
    text.includes("нв") ||
    text.includes("дефект") ||
    text.includes("утилизац") ||
    text.includes("порч")
  ) {
    return "Брак и Проблемы";
  }
  if (text.includes("возврат") || text.includes("ппвз")) {
    return "Возвраты";
  }
  return "Общие операции";
}

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let current = "";
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"' && insideQuotes && nextChar === '"') {
      current += '"';
      i++;
    } else if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === "," && !insideQuotes) {
      row.push(current.trim());
      current = "";
    } else if ((char === "\r" || char === "\n") && !insideQuotes) {
      if (char === "\r" && nextChar === "\n") i++;
      row.push(current.trim());
      if (row.some((cell) => cell.length > 0)) {
        rows.push(row);
      }
      row = [];
      current = "";
    } else {
      current += char;
    }
  }
  if (current.length > 0 || row.length > 0) {
    row.push(current.trim());
    if (row.some((cell) => cell.length > 0)) {
      rows.push(row);
    }
  }
  return rows;
}

export async function GET() {
  try {
    const sheetId =
      process.env.GOOGLE_SHEETS_ID || "1brVhUcgvrVHTbZtmzk5n1JZ1cBUDWRNC0sry2tDTEjw";
    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=0`;

    const response = await fetch(csvUrl, { next: { revalidate: 60 } });
    if (response.ok) {
      const text = await response.text();
      const parsedRows = parseCSV(text);
      if (parsedRows.length > 1) {
        const parsedStatuses: WMSStatus[] = [];
        for (let i = 1; i < parsedRows.length; i++) {
          const cols = parsedRows[i];
          const code = (cols[0] || "").trim();
          const desc = (cols[1] || "").trim();
          const action = (cols[2] || "").trim();

          if (!code && !desc && !action) continue;

          const category = detectCategory(code, desc, action);
          let badgeType: WMSStatus["badgeType"] = "blue";
          if (category === "Брак и Проблемы") badgeType = "red";
          else if (category === "Сортировка и Отгрузка") badgeType = "green";
          else if (category === "Сборка" || category === "Возвраты") badgeType = "yellow";
          else if (category === "Упаковка" || category === "Инвентаризация") badgeType = "purple";
          else if (category === "Раскладка и МХ" || category === "Перемещение") badgeType = "cyan";

          parsedStatuses.push({
            id: `stat-${i}`,
            code: code || `ID-${i}`,
            category,
            description: desc || "Описание отсутствует",
            action: action || "Действие не указано",
            badgeType,
          });
        }

        if (parsedStatuses.length > 0) {
          return NextResponse.json({
            statuses: parsedStatuses,
            count: parsedStatuses.length,
            timestamp: new Date().toISOString(),
          });
        }
      }
    }

    return NextResponse.json({
      statuses: DEFAULT_STATUSES,
      count: DEFAULT_STATUSES.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Status fetch error:", error);
    return NextResponse.json({
      statuses: DEFAULT_STATUSES,
      count: DEFAULT_STATUSES.length,
      timestamp: new Date().toISOString(),
    });
  }
}
