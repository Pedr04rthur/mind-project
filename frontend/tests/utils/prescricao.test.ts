import { describe, it, expect } from "vitest";

import {
  isOrientacaoTerapeutica,
  criarItemVazio,
  PRESCRICAO_STATUS_LABELS,
  PRESCRICAO_TIPO_LABELS,
} from "../../src/types/prescricao";

describe("Classificacao das prescricoes", () => {
  it("reconhece aconselhamento como orientacao", () => {
    expect(isOrientacaoTerapeutica("COUNSELING")).toBe(true);
  });

  it("reconhece exercicio como orientacao", () => {
    expect(isOrientacaoTerapeutica("EXERCISE")).toBe(true);
  });

  it("reconhece orientacao terapeutica legada", () => {
    expect(isOrientacaoTerapeutica("THERAPEUTIC")).toBe(true);
  });

  it("nao classifica medicamento como orientacao", () => {
    expect(isOrientacaoTerapeutica("MEDICATION")).toBe(false);
  });

  it("nao classifica exame como orientacao", () => {
    expect(isOrientacaoTerapeutica("EXAM")).toBe(false);
  });
});

describe("Estados das prescricoes", () => {
  it("traduz o estado de rascunho", () => {
    expect(PRESCRICAO_STATUS_LABELS.DRAFT).toBe("Rascunho");
  });

  it("traduz o estado emitido", () => {
    expect(PRESCRICAO_STATUS_LABELS.ISSUED).toBe("Emitida");
  });

  it("traduz o estado cancelado", () => {
    expect(PRESCRICAO_STATUS_LABELS.CANCELLED).toBe("Cancelada");
  });
});

describe("Tipos das prescricoes", () => {
  it("traduz medicamento", () => {
    expect(PRESCRICAO_TIPO_LABELS.MEDICATION).toBe("Medicamento");
  });

  it("traduz exame", () => {
    expect(PRESCRICAO_TIPO_LABELS.EXAM).toBe("Exame");
  });

  it("traduz aconselhamento", () => {
    expect(PRESCRICAO_TIPO_LABELS.COUNSELING).toBe("Aconselhamento");
  });

  it("traduz exercicio", () => {
    expect(PRESCRICAO_TIPO_LABELS.EXERCISE).toBe("Exercício");
  });
});

describe("Inicializacao de medicamento", () => {
  it("cria um item com todos os campos vazios", () => {
    expect(criarItemVazio()).toEqual({
      medicationName: "",
      activeIngredient: "",
      concentration: "",
      pharmaceuticalForm: "",
      dose: "",
      route: "",
      frequency: "",
      duration: "",
      quantity: "",
      instructions: "",
    });
  });

  it("cria objetos independentes", () => {
    const primeiro = criarItemVazio();
    const segundo = criarItemVazio();

    primeiro.medicationName = "Medicamento Teste";

    expect(segundo.medicationName).toBe("");
    expect(primeiro).not.toBe(segundo);
  });
});
