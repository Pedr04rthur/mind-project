import { describe, it, expect } from "vitest";
import {
  cpfToApi,
  cpfFromApi,
  patientFromApi,
  patientToApi,
  humorToApi,
} from "../../src/services/adapters";

const pacienteApi = {
  id: 1,
  cpf: "12345678900",
  name: "Paciente Teste",
  phone: "83999999999",
  email: "paciente@teste.com",
  address: "Endereco Teste",
};

describe("Adapters", () => {
  it("remove a pontuacao do CPF", () => {
    expect(cpfToApi("123.456.789-00")).toBe("12345678900");
  });

  it("preserva CPF sem pontuacao", () => {
    expect(cpfToApi("12345678900")).toBe("12345678900");
  });

  it("formata CPF recebido da API", () => {
    expect(cpfFromApi("12345678900")).toBe("123.456.789-00");
  });

  it("completa CPF com zeros a esquerda", () => {
    expect(cpfFromApi("1234567890")).toBe("012.345.678-90");
  });

  it("converte paciente da API para o frontend", () => {
    expect(patientFromApi(pacienteApi)).toEqual({
      id: 1,
      cpf: "123.456.789-00",
      nome: "Paciente Teste",
      telefone: "83999999999",
      email: "paciente@teste.com",
      endereco: "Endereco Teste",
      status: "ATIVO",
      prioridade: "BAIXA",
    });
  });

  it("converte paciente do frontend para a API", () => {
    const paciente = patientFromApi(pacienteApi);

    expect(patientToApi(paciente, "senhaTeste")).toEqual({
      cpf: "12345678900",
      name: "Paciente Teste",
      phone: "83999999999",
      email: "paciente@teste.com",
      address: "Endereco Teste",
      password: "senhaTeste",
    });
  });

  it("converte humor bom para GOOD", () => {
    expect(humorToApi("bom")).toBe("GOOD");
  });

  it("converte humor ruim para BAD", () => {
    expect(humorToApi("ruim")).toBe("BAD");
  });
});
