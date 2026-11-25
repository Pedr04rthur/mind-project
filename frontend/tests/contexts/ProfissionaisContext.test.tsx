import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";

import {
  ProfissionaisProvider,
  useProfissionais,
} from "../../src/contexts/ProfissionaisContext";

import { api } from "../../src/services/api";
import { useAuth } from "../../src/contexts/AuthContext";

import type { UsuarioLogado } from "../../src/types/auth";

vi.mock("../../src/services/api", () => ({
  ApiError: class ApiError extends Error {},
  api: {
    professionals: {
      list: vi.fn(),
    },
  },
}));

vi.mock("../../src/contexts/AuthContext", () => ({
  useAuth: vi.fn(),
}));

const profissionais = [
  {
    id: 1,
    name: "Profissional Teste 1",
    specialty: "Psiquiatria Clinica",
  },
  {
    id: 2,
    name: "Profissional Teste 2",
    specialty: "Psicologia",
  },
];

function autenticar(perfil: UsuarioLogado["perfil"]) {
  vi.mocked(useAuth).mockReturnValue({
    usuario: {
      perfil,
      cpf: "",
      nome: "Usuario Teste",
      emailLogin: "usuario@teste.com",
    },
  } as ReturnType<typeof useAuth>);
}

function iniciarContexto() {
  return renderHook(() => useProfissionais(), {
    wrapper: ProfissionaisProvider,
  });
}

describe("ProfissionaisContext", () => {
  beforeEach(() => {
    vi.resetAllMocks();

    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});

    autenticar("RECEPCAO");

    vi.mocked(api.professionals.list).mockResolvedValue(
      profissionais
    );
  });

  it("carrega profissionais do backend para a recepcao", async () => {
    const { result } = iniciarContexto();

    await waitFor(() => {
      expect(result.current.backendProfissionais).toHaveLength(2);
    });

    expect(api.professionals.list).toHaveBeenCalledTimes(1);
    expect(result.current.erroBackend).toBeNull();
  });

  it("preserva os dados retornados pela API", async () => {
    const { result } = iniciarContexto();

    await waitFor(() => {
      expect(result.current.backendProfissionais).toEqual(
        profissionais
      );
    });
  });

  it("nao carrega a lista administrativa para pacientes", () => {
    autenticar("PACIENTE");

    const { result } = iniciarContexto();

    expect(api.professionals.list).not.toHaveBeenCalled();
    expect(result.current.backendProfissionais).toEqual([]);
  });

  it("nao carrega a lista administrativa para profissionais", () => {
    autenticar("PROFISSIONAL");

    const { result } = iniciarContexto();

    expect(api.professionals.list).not.toHaveBeenCalled();
    expect(result.current.backendProfissionais).toEqual([]);
  });

  it("nao consulta a API sem usuario autenticado", () => {
    vi.mocked(useAuth).mockReturnValue({
      usuario: null,
    } as ReturnType<typeof useAuth>);

    iniciarContexto();

    expect(api.professionals.list).not.toHaveBeenCalled();
  });

  it("trata uma lista vazia", async () => {
    vi.mocked(api.professionals.list).mockResolvedValue([]);

    const { result } = iniciarContexto();

    await waitFor(() => {
      expect(result.current.loadingBackend).toBe(false);
    });

    expect(result.current.backendProfissionais).toEqual([]);
    expect(result.current.erroBackend).toBeNull();
  });

  it("trata falha na comunicacao com a API", async () => {
    vi.mocked(api.professionals.list).mockRejectedValue(
      new Error("Backend indisponivel")
    );

    const { result } = iniciarContexto();

    await waitFor(() => {
      expect(result.current.erroBackend).toBe(
        "Backend indisponivel"
      );
    });

    expect(result.current.backendProfissionais).toEqual([]);
    expect(result.current.loadingBackend).toBe(false);
  });

  it("rejeita formato invalido de resposta", async () => {
    vi.mocked(api.professionals.list).mockResolvedValue(
      null as unknown as typeof profissionais
    );

    const { result } = iniciarContexto();

    await waitFor(() => {
      expect(result.current.erroBackend).toBe(
        "Formato inválido na resposta de profissionais."
      );
    });
  });

  it("permite atualizar a lista de profissionais", async () => {
    const { result } = iniciarContexto();

    await waitFor(() => {
      expect(result.current.backendProfissionais).toHaveLength(2);
    });

    vi.mocked(api.professionals.list).mockResolvedValue([
      profissionais[0],
    ]);

    await act(async () => {
      await result.current.refreshBackend();
    });

    expect(result.current.backendProfissionais).toHaveLength(1);
    expect(api.professionals.list).toHaveBeenCalledTimes(2);
  });
});
