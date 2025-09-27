import { describe, expect, it } from "vitest";
import { parseIds } from "./extractor";

describe("parseIds", () => {
  const linearInput = `32963665262 - это ШК
38399692351 - это Стикер
4 667,00 ₽
30376042940
38255891276
955,00 ₽
33226146669
38877346304
2\u00A0490,00 ₽`;

  it("extracts SKUs from linear input", () => {
    expect(parseIds(linearInput, { mode: "sku" })).toEqual([
      "32963665262",
      "30376042940",
      "33226146669",
    ]);
  });

  it("extracts stickers from linear input", () => {
    expect(parseIds(linearInput, { mode: "sticker" })).toEqual([
      "38399692351",
      "38255891276",
      "38877346304",
    ]);
  });

  it("supports tabular input", () => {
    const tableInput = `ШК товара\tСтикер товара\tСтоимость товаров
32963665262\t38399692351\t4 667,00 ₽
30376042940\t38255891276\t955,00 ₽`;

    expect(parseIds(tableInput, { mode: "sku" })).toEqual([
      "32963665262",
      "30376042940",
    ]);
    expect(parseIds(tableInput, { mode: "sticker" })).toEqual([
      "38399692351",
      "38255891276",
    ]);
  });

  it("uses fallback extraction when structured parsing fails", () => {
    const fallbackInput = "12345678 99999999 77777777";
    expect(parseIds(fallbackInput, { mode: "sku" })).toEqual([
      "12345678",
      "77777777",
    ]);
    expect(parseIds(fallbackInput, { mode: "sticker" })).toEqual([
      "99999999",
    ]);
  });

  it("respects the unique flag", () => {
    const duplicated = `${linearInput}\n30376042940\n38255891276`;
    expect(parseIds(duplicated, { mode: "sku", unique: true })).toEqual([
      "32963665262",
      "30376042940",
      "33226146669",
    ]);
    expect(parseIds(duplicated, { mode: "sticker", unique: false })).toEqual([
      "38399692351",
      "38255891276",
      "38877346304",
      "38255891276",
    ]);
  });
});
