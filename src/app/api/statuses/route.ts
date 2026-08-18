import { NextResponse } from "next/server";

export interface WMSStatus {
  id: string;
  code: string;
  category: string;
  description: string;
  action: string;
  badgeType?: "blue" | "yellow" | "purple" | "cyan" | "green" | "red";
  priority?: "high" | "normal" | "low";
}

const DEFAULT_STATUSES: WMSStatus[] = [
  {
    id: "stat-10",
    code: "10",
    category: "Приемка",
    description: "Товар зарегистрирован в зоне выгрузки, ожидает первичного сканирования и сверки с накладной.",
    action: "Отсканируйте ШК грузового места на ТСД, проверьте целостность паллеты и передайте в зону сортировки.",
    badgeType: "blue",
    priority: "normal",
  },
  {
    id: "stat-20",
    code: "20",
    category: "Приемка",
    description: "Товар принят поштучно, выполнена проверка габаритов и сроков годности.",
    action: "Наклейте стикер сгенерированного ШК партии, переместите в буферную зону размещения.",
    badgeType: "blue",
    priority: "normal",
  },
  {
    id: "stat-30",
    code: "30",
    category: "Хранение",
    description: "Товар размещен в ячейке долгосрочного или мезонинного хранения.",
    action: "Подтвердите ячейку сканированием контрольного адреса стеллажа (Ряд-Секция-Полка).",
    badgeType: "cyan",
    priority: "normal",
  },
  {
    id: "stat-40",
    code: "40",
    category: "Сборка",
    description: "Сформировано сборочное задание (Pick List), товар зарезервирован под заказ покупателя.",
    action: "Следуйте маршруту ТСД к ячейке отбора, подтвердите изъятие нужного количества сканированием ШК товара.",
    badgeType: "yellow",
    priority: "high",
  },
  {
    id: "stat-50",
    code: "50",
    category: "Сборка",
    description: "Сборка завершена, контейнер с заказами перемещен на линию упаковки.",
    action: "Передайте сборочный лоток оператору стола контроля и упаковки, закройте волну в ТСД.",
    badgeType: "yellow",
    priority: "normal",
  },
  {
    id: "stat-60",
    code: "60",
    category: "Упаковка",
    description: "Заказ упакован в сейф-пакет или гофрокороб, нанесен транспортный стикер доставки.",
    action: "Отсканируйте транспортный ШК места, поместите короб на конвейер сортировки по направлениям.",
    badgeType: "purple",
    priority: "high",
  },
  {
    id: "stat-70",
    code: "70",
    category: "Сортировка",
    description: "Заказ распределен по маршруту магистрального рейса или ПВЗ.",
    action: "Поместите грузовое место в тарную тележку или на паллету соответствующего направления рейса.",
    badgeType: "cyan",
    priority: "normal",
  },
  {
    id: "stat-80",
    code: "80",
    category: "Отгрузка",
    description: "Паллета запаллетирована, сформирован реестр передачи и опломбирована фура.",
    action: "Подпишите путевой лист у водителя-экспедитора, измените статус рейса на 'В пути'.",
    badgeType: "green",
    priority: "high",
  },
  {
    id: "stat-90",
    code: "90",
    category: "Инвентаризация",
    description: "Ячейка заблокирована для циклического пересчета остатков или расследования расхождений.",
    action: "Проведите полный пересчет всех единиц в ячейке, внесите фактическое количество через ТСД ревизора.",
    badgeType: "purple",
    priority: "high",
  },
  {
    id: "stat-95",
    code: "95",
    category: "Брак",
    description: "Товар поврежден, имеет истекший срок годности или нечитаемый заводской штрихкод.",
    action: "Переместите единицу в изолятор брака (зона Quarantine), оформите акт расхождений ТОРГ-2.",
    badgeType: "red",
    priority: "high",
  },
  {
    id: "stat-99",
    code: "99",
    category: "Возвраты",
    description: "Возвратный заказ от клиента поступил на склад для дефектовки и повторной приемки.",
    action: "Отсканируйте номер возвратной возвратной накладной, проверьте товарный вид и примите решение о ресток/утилизации.",
    badgeType: "yellow",
    priority: "normal",
  },
  {
    id: "stat-105",
    code: "105",
    category: "Кросс-докинг",
    description: "Прямая перегрузка без размещения в зоне длительного хранения.",
    action: "Сверьте маркировку транзитного паллета и сразу направьте в зону консолидации выезда.",
    badgeType: "blue",
    priority: "normal",
  },
];

export async function GET() {
  try {
    // Attempt Google Sheets fetch if sheet url or config is provided
    const sheetId = process.env.GOOGLE_SHEETS_ID;
    if (sheetId) {
      const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
      const response = await fetch(csvUrl, { next: { revalidate: 60 } });
      if (response.ok) {
        const text = await response.text();
        const lines = text.split("\n").filter((l) => l.trim().length > 0);
        if (lines.length > 1) {
          const parsedStatuses: WMSStatus[] = [];
          for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(",").map((c) => c.replace(/^"|"$/g, "").trim());
            if (cols.length >= 4) {
              const [code, category, description, action] = cols;
              parsedStatuses.push({
                id: `sheet-${i}`,
                code: code || String(i),
                category: category || "Общее",
                description: description || "Описание отсутствует",
                action: action || "Действие не указано",
                badgeType: category.includes("Брак")
                  ? "red"
                  : category.includes("Отгруз")
                  ? "green"
                  : category.includes("Сбор")
                  ? "yellow"
                  : "blue",
              });
            }
          }
          if (parsedStatuses.length > 0) {
            return NextResponse.json({
              statuses: parsedStatuses,
              source: "Google Sheets Live",
              timestamp: new Date().toISOString(),
            });
          }
        }
      }
    }

    return NextResponse.json({
      statuses: DEFAULT_STATUSES,
      source: "Google Antigravity WMS Core Engine",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Status fetch error:", error);
    return NextResponse.json({
      statuses: DEFAULT_STATUSES,
      source: "Antigravity Fallback Cache",
      timestamp: new Date().toISOString(),
    });
  }
}
