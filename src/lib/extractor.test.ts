import { describe, expect, it } from "vitest";
import { parsePrices, parseSkus } from "./extractor";

describe("parseSkus", () => {
  const linearInput = `32963665262
38399692351
4 667,00 ₽
30376042940
38255891276
955,00 ₽
33226146669
38877346304
2 490,00 ₽`;

  it("extracts SKUs from linear input", () => {
    expect(parseSkus(linearInput)).toEqual([
      "32963665262",
      "30376042940",
      "33226146669",
    ]);
  });

  it("uses fallback extraction when other strategies fail", () => {
    const fallbackInput = "12345678 99999999 77777777";
    expect(parseSkus(fallbackInput)).toEqual(["12345678", "77777777"]);
  });

  it("supports tabular input", () => {
    const tableInput = `ШК товара\tСтикер товара\tСтоимость товаров
32963665262\tSticker A\t4 667,00 ₽
30376042940\tSticker B\t955,00 ₽`;

    expect(parseSkus(tableInput)).toEqual(["32963665262", "30376042940"]);
  });

  it("respects the unique flag", () => {
    const duplicated = `${linearInput}\n30376042940`;
    expect(parseSkus(duplicated, { unique: true })).toEqual([
      "32963665262",
      "30376042940",
      "33226146669",
    ]);
    expect(parseSkus(duplicated, { unique: false })).toEqual([
      "32963665262",
      "30376042940",
      "33226146669",
      "30376042940",
    ]);
  });
});

describe("parsePrices", () => {
  const linearInput = `32963665262
38399692351
4 667,00 ₽
30376042940
38255891276
955,00 ₽
33226146669
38877346304
2 490,00 ₽`;

  it("extracts report-formatted prices from linear input", () => {
    expect(parsePrices(linearInput, { format: "report" })).toEqual([
      "4 667,00 ₽",
      "955,00 ₽",
      "2 490,00 ₽",
    ]);
  });

  it("extracts excel-formatted prices from linear input", () => {
    expect(parsePrices(linearInput, { format: "excel" })).toEqual([
      "4667.00",
      "955.00",
      "2490.00",
    ]);
  });

  it("supports tabular input", () => {
    const tableInput = `ШК товара\tСтикер товара\tСтоимость товаров
32963665262\tSticker A\t4 667,00 ₽
30376042940\tSticker B\t955,00 ₽`;

    expect(parsePrices(tableInput, { format: "report" })).toEqual([
      "4 667,00 ₽",
      "955,00 ₽",
    ]);
    expect(parsePrices(tableInput, { format: "excel" })).toEqual([
      "4667.00",
      "955.00",
    ]);
  });

  it("respects the unique flag", () => {
    const duplicated = `${linearInput}\n955,00 ₽`;
    expect(parsePrices(duplicated, { format: "report", unique: true })).toEqual([
      "4 667,00 ₽",
      "955,00 ₽",
      "2 490,00 ₽",
    ]);
    expect(parsePrices(duplicated, { format: "report", unique: false })).toEqual([
      "4 667,00 ₽",
      "955,00 ₽",
      "2 490,00 ₽",
      "955,00 ₽",
    ]);
  });
});
