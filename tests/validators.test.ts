import { describe, it, expect } from "vitest";
import { validateEmail, validatePassword, formatDate, truncate } from "../src/utils/validators";

describe("validators", () => {
  it("validates email correctly", () => {
    expect(validateEmail("test@example.com")).toBe(true);
    expect(validateEmail("invalid")).toBe(false);
    expect(validateEmail("")).toBe(false);
  });

  it("validates password requirements", () => {
    expect(validatePassword("short").valid).toBe(false);
    expect(validatePassword("validpass").valid).toBe(true);
  });

  it("formats dates in es-ES", () => {
    const date = new Date("2024-01-15T12:00:00Z");
    const formatted = formatDate(date);
    expect(formatted).toContain("2024");
    expect(formatted).toContain("15");
  });

  it("truncates text longer than length", () => {
    expect(truncate("abcdef", 3)).toBe("abc...");
    expect(truncate("abc", 5)).toBe("abc");
  });
});
