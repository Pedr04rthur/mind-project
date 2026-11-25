import { describe, it, expect } from "vitest";
import {
  getDataDiaAtual,
  formatarHora,
  toBackendDate,
} from "../../src/utils/dates";

describe("Funcoes de datas", () => {
  it("formata uma data local", () => {
    expect(
      getDataDiaAtual(new Date(2026, 10, 24))
    ).toBe("2026-11-24");
  });

  it("preenche dia e mes com zeros", () => {
    expect(
      getDataDiaAtual(new Date(2026, 0, 5))
    ).toBe("2026-01-05");
  });

  it("formata horario com horas e minutos", () => {
    expect(
      formatarHora("2026-11-24T09:05:00")
    ).toBe("09:05");
  });

  it("converte data para o formato do backend", () => {
    expect(
      toBackendDate("2026-11-24")
    ).toBe("24-11-2026");
  });
});
