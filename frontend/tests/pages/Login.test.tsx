import { describe, it, expect, vi, beforeEach } from "vitest";

import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react";

import { MemoryRouter, Routes, Route } from "react-router-dom";
import { Login } from "../../src/pages/Login/Login";
import { useAuth } from "../../src/contexts/AuthContext";
import { ApiError } from "../../src/services/api";

vi.mock("../../src/contexts/AuthContext", async (importOriginal) => {
  const original = await importOriginal<
    typeof import("../../src/contexts/AuthContext")
  >();

  return {
    ...original,
    useAuth: vi.fn(),
  };
});

const entrar = vi.fn();

function renderizarLogin() {
  return render(
    <MemoryRouter initialEntries={["/login"]}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/diario" element={<h1>Diario do paciente</h1>} />
        <Route
          path="/profissional/pacientes"
          element={<h1>Painel profissional</h1>}
        />
        <Route
          path="/recepcao/pacientes"
          element={<h1>Painel recepcao</h1>}
        />
      </Routes>
    </MemoryRouter>
  );
}

function selecionarPerfil(perfil: string) {
  fireEvent.click(
    screen.getByRole("button", {
      name: /escolha uma opção/i,
    })
  );

  fireEvent.click(
    screen.getByRole("option", {
      name: new RegExp(perfil, "i"),
    })
  );
}

function preencherCredenciais() {
  fireEvent.change(screen.getByLabelText("Email ou CPF"), {
    target: { value: "usuario@teste.com" },
  });

  fireEvent.change(screen.getByLabelText("Senha"), {
    target: { value: "senhaTeste" },
  });
}

function enviar() {
  fireEvent.click(
    screen.getByRole("button", { name: /^entrar$/i })
  );
}

describe("Tela de Login", () => {
  beforeEach(() => {
    entrar.mockReset();

    vi.mocked(useAuth).mockReturnValue({
      usuario: null,
      isAutenticado: false,
      entrar,
      sair: vi.fn(),
    });
  });

  it("renderiza os campos de autenticacao", () => {
    renderizarLogin();

    expect(screen.getByLabelText("Email ou CPF")).toBeInTheDocument();
    expect(screen.getByLabelText("Senha")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^entrar$/i })
    ).toBeInTheDocument();
  });

  it("exige selecao de perfil", () => {
    renderizarLogin();

    enviar();

    expect(
      screen.getByText("Selecione seu perfil para continuar.")
    ).toBeInTheDocument();

    expect(entrar).not.toHaveBeenCalled();
  });

  it("exige preenchimento das credenciais", () => {
    renderizarLogin();

    selecionarPerfil("Paciente");
    enviar();

    expect(
      screen.getByText("Preencha login e senha para continuar.")
    ).toBeInTheDocument();

    expect(entrar).not.toHaveBeenCalled();
  });

  it("permite mostrar e ocultar a senha", () => {
    renderizarLogin();

    const senha = screen.getByLabelText("Senha");

    expect(senha).toHaveAttribute("type", "password");

    fireEvent.click(
      screen.getByRole("button", { name: "Mostrar senha" })
    );

    expect(senha).toHaveAttribute("type", "text");

    fireEvent.click(
      screen.getByRole("button", { name: "Ocultar senha" })
    );

    expect(senha).toHaveAttribute("type", "password");
  });

  it("redireciona paciente autenticado", async () => {
    entrar.mockResolvedValue("PACIENTE");

    renderizarLogin();
    selecionarPerfil("Paciente");
    preencherCredenciais();
    enviar();

    expect(
      await screen.findByText("Diario do paciente")
    ).toBeInTheDocument();

    expect(entrar).toHaveBeenCalledWith(
      "usuario@teste.com",
      "senhaTeste"
    );
  });

  it("redireciona profissional autenticado", async () => {
    entrar.mockResolvedValue("PROFISSIONAL");

    renderizarLogin();
    selecionarPerfil("Profissional");
    preencherCredenciais();
    enviar();

    expect(
      await screen.findByText("Painel profissional")
    ).toBeInTheDocument();
  });

  it("redireciona recepcao autenticada", async () => {
    entrar.mockResolvedValue("RECEPCAO");

    renderizarLogin();
    selecionarPerfil("Recepção");
    preencherCredenciais();
    enviar();

    expect(
      await screen.findByText("Painel recepcao")
    ).toBeInTheDocument();
  });

  it("informa quando o perfil selecionado e incorreto", async () => {
    entrar.mockResolvedValue("PROFISSIONAL");

    renderizarLogin();
    selecionarPerfil("Paciente");
    preencherCredenciais();
    enviar();

    expect(
      await screen.findByText(
        "Essa conta é de Profissional, não de Paciente."
      )
    ).toBeInTheDocument();
  });

  it("informa credenciais invalidas", async () => {
    entrar.mockRejectedValue(
      new ApiError("Nao autorizado", 401)
    );

    renderizarLogin();
    selecionarPerfil("Paciente");
    preencherCredenciais();
    enviar();

    await waitFor(() => {
      expect(
        screen.getByText("Email ou senha inválidos.")
      ).toBeInTheDocument();
    });
  });
});
