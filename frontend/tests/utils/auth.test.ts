import { describe, it, expect } from "vitest";

import {
  perfilFromApi,
  usuarioFromMe,
} from "../../src/types/auth";

describe("Conversao de perfis", () => {
  it("converte PATIENT para PACIENTE", () => {
    expect(perfilFromApi("PATIENT")).toBe("PACIENTE");
  });

  it("converte PROFESSIONAL para PROFISSIONAL", () => {
    expect(perfilFromApi("PROFESSIONAL")).toBe("PROFISSIONAL");
  });

  it("converte RECEPTIONIST para RECEPCAO", () => {
    expect(perfilFromApi("RECEPTIONIST")).toBe("RECEPCAO");
  });
});

describe("Conversao de usuario autenticado", () => {
  it("converte os dados do paciente", () => {
    const usuario = usuarioFromMe({
      id: 1,
      cpf: "12345678900",
      nome: "Paciente Teste",
      email: "paciente@teste.com",
      profile: "PATIENT",
      telefone: "83999999999",
      endereco: "Endereco de teste",
    });

    expect(usuario).toMatchObject({
      id: 1,
      perfil: "PACIENTE",
      cpf: "12345678900",
      nome: "Paciente Teste",
      emailLogin: "paciente@teste.com",
      telefone: "83999999999",
      endereco: "Endereco de teste",
    });
  });

  it("converte os dados do profissional", () => {
    const usuario = usuarioFromMe({
      id: 2,
      cpf: null,
      nome: "Profissional Teste",
      email: "profissional@teste.com",
      profile: "PROFESSIONAL",
      especialidade: "Psiquiatria Clinica",
    });

    expect(usuario.perfil).toBe("PROFISSIONAL");
    expect(usuario.especialidade).toBe("Psiquiatria Clinica");
    expect(usuario.cpf).toBe("");
  });

  it("converte os dados da recepcao", () => {
    const usuario = usuarioFromMe({
      cpf: null,
      nome: "Recepcao",
      email: "recepcao@teste.com",
      profile: "RECEPTIONIST",
    });

    expect(usuario.perfil).toBe("RECEPCAO");
    expect(usuario.emailLogin).toBe("recepcao@teste.com");
  });

  it("trata campos opcionais nulos", () => {
    const usuario = usuarioFromMe({
      id: null,
      cpf: null,
      nome: "Usuario",
      email: "usuario@teste.com",
      profile: "PATIENT",
      telefone: null,
      endereco: null,
      especialidade: null,
    });

    expect(usuario.id).toBeUndefined();
    expect(usuario.cpf).toBe("");
    expect(usuario.telefone).toBeUndefined();
    expect(usuario.endereco).toBeUndefined();
    expect(usuario.especialidade).toBeUndefined();
  });
});
