
import { NextResponse } from "next/server";
import { getSheetData } from "@/lib/googleSheets";

export async function GET() {
  try {
    const data = await getSheetData();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Ошибка при получении данных из Google Sheets:", error);
    return NextResponse.json({ error: "Не удалось получить данные" }, { status: 500 });
  }
}
