import { describe, expect, it } from "vitest";
import { formatCurrency, formatDateInput, formatTimeInput } from "./formatters";

describe("formatters", () => {
  it("formats COP currency without decimals", () => {
    expect(formatCurrency(150000)).toMatch(/150[.\s]?000/);
  });

  it("returns $0 for empty currency values", () => {
    expect(formatCurrency(null)).toBe("$0");
    expect(formatCurrency("")).toBe("$0");
  });

  it("keeps non-numeric currency values visible", () => {
    expect(formatCurrency("pendiente")).toBe("$pendiente");
  });

  it("extracts date and time portions used by form controls", () => {
    expect(formatDateInput("2026-09-10T14:35:00")).toBe("2026-09-10");
    expect(formatTimeInput("14:35:00")).toBe("14:35");
  });
});
