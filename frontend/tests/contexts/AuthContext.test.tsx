import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

import {
  AuthProvider,
  useAuth,
  getHomeDoPerfil,
} from "../../src/contexts/AuthContext";

import {
  api,
  setAccessToken,
  setOnUnauthorized,
} from "../../src/services/api";

vi.mock("../../src/services/api", () => ({
  api: {
    auth: {
      signin: vi.fn(),
      me: vi.fn(),
      logout: vi.fn(),
    },
  },
  setAccessToken: vi.fn(),
  setOnUnauthorized: vi.fn(),
}));

const usuarioApi = {
  id: 1,
  cpf: "12345678900",
  nome: "Paciente Teste",
  email: "paciente@teste.com",
  profile: "PATIENT" as const,
};

function iniciarContexto() {
  return renderHook(() => useAuth(), {
    wrapper: AuthProvider,
  });
}

describe("AuthContext", () => {
  beforeEach(() => {
    vi.resetAllMocks();

    vi.mocked(api.auth.signin).mockResolvedValue({
      token: "token-teste",
      profile: "PATIENT",
    });

    vi.mocked(api.auth.me).mockResolvedValue(usuarioApi);
    vi.mocked(api.auth.logout).mockResolvedValue(undefined);
  });

  it("inicia sem autenticacao", () => {
    const { result } = iniciarContexto();

    expect(result.current.usuario).toBeNull();
    expect(result.current.isAutenticado).toBe(false);
  });

  it("autentica um paciente", async () => {
    const { result } = iniciarContexto();

    await act(async () => {
      const perfil = await result.current.entrar(
        "paciente@teste.com",
        "senhaTeste"
      );

      expect(perfil).toBe("PACIENTE");
    });

    expect(api.auth.signin).toHaveBeenCalledWith(
      "paciente@teste.com",
      "senhaTeste"
    );

    expect(setAccessToken).toHaveBeenCalledWith("token-teste");
    expect(api.auth.me).toHaveBeenCalled();
    expect(result.current.isAutenticado).toBe(true);
    expect(result.current.usuario?.nome).toBe("Paciente Teste");
  });

  it("persiste usuario no sessionStorage", async () => {
    const { result } = iniciarContexto();

    await act(async () => {
      await result.current.entrar("paciente@teste.com", "senhaTeste");
    });

    const dados = JSON.parse(
      sessionStorage.getItem("mindcare:usuario")!
    );

    expect(dados.perfil).toBe("PACIENTE");
    expect(dados.emailLogin).toBe("paciente@teste.com");
  });

  it("recupera uma sessao existente", () => {
    sessionStorage.setItem(
      "mindcare:usuario",
      JSON.stringify({
        perfil: "PACIENTE",
        cpf: "12345678900",
        nome: "Paciente Teste",
        emailLogin: "paciente@teste.com",
      })
    );

    const { result } = iniciarContexto();

    expect(result.current.isAutenticado).toBe(true);
    expect(result.current.usuario?.nome).toBe("Paciente Teste");
  });

  it("ignora sessao com JSON invalido", () => {
    sessionStorage.setItem("mindcare:usuario", "json-invalido");

    const { result } = iniciarContexto();

    expect(result.current.usuario).toBeNull();
  });

  it("rejeita credenciais invalidas", async () => {
    vi.mocked(api.auth.signin).mockRejectedValue(
      new Error("Credenciais invalidas")
    );

    const { result } = iniciarContexto();

    await act(async () => {
      await expect(
        result.current.entrar("teste@teste.com", "errada")
      ).rejects.toThrow("Credenciais invalidas");
    });

    expect(result.current.isAutenticado).toBe(false);
    expect(api.auth.me).not.toHaveBeenCalled();
  });

  it("realiza logout e limpa a sessao", async () => {
    const { result } = iniciarContexto();

    await act(async () => {
      await result.current.entrar("paciente@teste.com", "senhaTeste");
    });

    await act(async () => {
      await result.current.sair();
    });

    expect(api.auth.logout).toHaveBeenCalled();
    expect(setAccessToken).toHaveBeenLastCalledWith(null);
    expect(result.current.usuario).toBeNull();
    expect(sessionStorage.getItem("mindcare:usuario")).toBeNull();
  });

  it("limpa a sessao mesmo quando logout falha", async () => {
    const { result } = iniciarContexto();

    await act(async () => {
      await result.current.entrar("paciente@teste.com", "senhaTeste");
    });

    vi.mocked(api.auth.logout).mockRejectedValue(
      new Error("Backend indisponivel")
    );

    await act(async () => {
      await result.current.sair();
    });

    expect(result.current.isAutenticado).toBe(false);
    expect(setAccessToken).toHaveBeenLastCalledWith(null);
  });

  it("encerra sessao quando recebe acesso nao autorizado", async () => {
    const { result } = iniciarContexto();

    await act(async () => {
      await result.current.entrar("paciente@teste.com", "senhaTeste");
    });

    const callback = vi.mocked(setOnUnauthorized).mock.calls[0][0];

    act(() => {
      callback?.();
    });

    expect(result.current.usuario).toBeNull();
    expect(setAccessToken).toHaveBeenLastCalledWith(null);
  });

  it("retorna a rota inicial de cada perfil", () => {
    expect(getHomeDoPerfil("PACIENTE")).toBe("/diario");

    expect(getHomeDoPerfil("PROFISSIONAL")).toBe(
      "/profissional/pacientes"
    );

    expect(getHomeDoPerfil("RECEPCAO")).toBe(
      "/recepcao/pacientes"
    );
  });
});
