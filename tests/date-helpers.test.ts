import { describe, it, expect } from "vitest";
import { formatDateForInput, parseDateInput } from "../src/utils/dates";

describe("date helpers", () => {
  it("formats a local calendar date for input type=date without timezone conversion", () => {
    const date = new Date(2026, 7, 31, 23, 30);
    expect(formatDateForInput(date)).toBe("2026-08-31");
  });

  it("parses an input date as a local calendar date", () => {
    const date = parseDateInput("2026-09-01");
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(8);
    expect(date.getDate()).toBe(1);
  });

  it("rejects invalid calendar dates", () => {
    expect(() => parseDateInput("2026-02-30")).toThrow("Fecha inválida");
    expect(() => parseDateInput("01/09/2026")).toThrow("Fecha inválida");
  });
});
