import { describe, expect, it } from "vitest";
import { countryCodeToFlag, enumLabel, prefixLabel } from "./public";

describe("public utilities", () => {
  it("converts API enum values into readable Spanish labels", () => {
    expect(enumLabel("cedula_chilena")).toBe("Cédula chilena");
    expect(enumLabel("documento_extranjero")).toBe("Documento extranjero");
  });

  it("converts country codes to emoji flags", () => {
    expect(countryCodeToFlag("co")).toBe("🇨🇴");
    expect(countryCodeToFlag("cl")).toBe("🇨🇱");
  });

  it("builds a readable phone prefix label", () => {
    expect(prefixLabel("57", "CO", "Colombia")).toBe("🇨🇴 Colombia +57");
  });
});
