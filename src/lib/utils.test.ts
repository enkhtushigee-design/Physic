import { describe, expect, it } from "vitest";
import { parseCsv } from "./admin/csv";
import { placeAt, shift, closeGap } from "./admin/ordering";
import { createSessionToken, verifySessionToken } from "./auth/session-token";
import { formatClock, parseDuration, toIsoDuration } from "./duration";
import { mn } from "./i18n/mn";
import { slugify, uniqueSlug } from "./slug";

describe("slugify", () => {
  it.each([
    ["Кинематик", "kinematik"],
    ["Механик", "mekhanik"],
    ["Хөдөлгөөн", "khodolgoon"],
    ["Дулаан ба молекул физик", "dulaan-ba-molekul-fizik"],
    ["Ньютоны хуулиуд", "nyutony-khuuliud"],
    ["Хичээл 1: Шилжилт", "khicheel-1-shiljilt"],
    ["Үндсэн ойлголт", "undsen-oilgolt"],
    ["  ---  ", ""],
  ])("%s → %s", (input, expected) => {
    expect(slugify(input)).toBe(expected);
  });

  it("makes slugs unique", () => {
    expect(uniqueSlug("kinematik", ["kinematik", "kinematik-2"])).toBe("kinematik-3");
    expect(uniqueSlug("", [], "hicheel")).toBe("hicheel");
  });
});

describe("duration", () => {
  it("parses seconds and clock formats", () => {
    expect(parseDuration("754")).toBe(754);
    expect(parseDuration("12:34")).toBe(754);
    expect(parseDuration("1:02:03")).toBe(3723);
    expect(parseDuration("")).toBeNull();
    expect(parseDuration("12:75")).toBeUndefined();
    expect(parseDuration("abc")).toBeUndefined();
    expect(parseDuration("-5")).toBeUndefined();
  });

  it("formats", () => {
    expect(formatClock(754)).toBe("12:34");
    expect(formatClock(3723)).toBe("1:02:03");
    expect(toIsoDuration(754)).toBe("PT12M34S");
    expect(mn.duration.format(754)).toBe("12 минут");
    expect(mn.duration.format(3900)).toBe("1 цаг 5 минут");
    expect(mn.duration.format(3600)).toBe("1 цаг");
    expect(mn.duration.format(45)).toBe("45 секунд");
  });
});

describe("parseCsv", () => {
  it("handles quotes, commas, newlines and BOM", () => {
    const text = '﻿a,b,c\r\n"x, y","he said ""hi""","line1\nline2"\r\n\r\n1,2,3';
    expect(parseCsv(text)).toEqual([
      ["a", "b", "c"],
      ["x, y", 'he said "hi"', "line1\nline2"],
      ["1", "2", "3"],
    ]);
  });

  it("detects semicolon delimiters (Excel)", () => {
    expect(parseCsv("a;b\n1;2")).toEqual([
      ["a", "b"],
      ["1", "2"],
    ]);
  });
});

describe("ordering", () => {
  const item = (id: string, order_index: number) => ({ id, order_index, created_at: "2026-01-01", title: id });
  const siblings = [item("a", 1), item("b", 2), item("c", 3)];

  it("places a new item at a position and renumbers", () => {
    expect(placeAt([...siblings, item("n", 99)], "n", 2)).toEqual([
      { id: "n", order_index: 2 },
      { id: "b", order_index: 3 },
      { id: "c", order_index: 4 },
    ]);
  });

  it("appends when no position is given", () => {
    expect(placeAt([...siblings, item("n", 0)], "n", null)).toEqual([{ id: "n", order_index: 4 }]);
  });

  it("clamps out-of-range positions", () => {
    expect(placeAt(siblings, "a", 99)).toEqual([
      { id: "b", order_index: 1 },
      { id: "c", order_index: 2 },
      { id: "a", order_index: 3 },
    ]);
  });

  it("shifts up and down, ignoring edges", () => {
    expect(shift(siblings, "b", -1)).toEqual([
      { id: "b", order_index: 1 },
      { id: "a", order_index: 2 },
    ]);
    expect(shift(siblings, "a", -1)).toEqual([]);
    expect(shift(siblings, "c", 1)).toEqual([]);
  });

  it("closes gaps after removal and normalizes messy indexes", () => {
    expect(closeGap([item("a", 10), item("b", 20), item("c", 30)], "b")).toEqual([
      { id: "a", order_index: 1 },
      { id: "c", order_index: 2 },
    ]);
  });
});

describe("admin session token", () => {
  const secret = "x".repeat(40);

  it("verifies a fresh token and rejects tampering or expiry", async () => {
    const now = Date.now();
    const token = await createSessionToken(secret, now);
    expect(await verifySessionToken(token, secret, now)).toBe(true);
    expect(await verifySessionToken(token, "y".repeat(40), now)).toBe(false);
    expect(await verifySessionToken(token.replace(/.$/, (c) => (c === "A" ? "B" : "A")), secret, now)).toBe(false);
    const [, sig] = token.split(".");
    expect(await verifySessionToken(`${now + 10 ** 12}.${sig}`, secret, now)).toBe(false);
    expect(await verifySessionToken(token, secret, now + 13 * 3600 * 1000)).toBe(false);
    expect(await verifySessionToken(undefined, secret)).toBe(false);
    expect(await verifySessionToken(token, null)).toBe(false);
  });
});
