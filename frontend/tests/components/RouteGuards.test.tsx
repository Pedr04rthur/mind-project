import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import {
  MemoryRouter,
  Routes,
  Route,
} from "react-router-dom";

import { RequirePerfil } from "../../src/components/RouteGuards/RouteGuards";
import { useAuth } from "../../src/contexts/AuthContext";

import type { PerfilUsuario } from "../../src/types/auth";

vi.mock("../../src/contexts/AuthContext", async (importOriginal) => {
  const original = await importOriginal<
    typeof import("../../src/contexts/AuthContext")
  >();

  return {
    ...original,
    useAuth: vi.fn(),
  };
});

function autenticar(perfil: PerfilUsuario | null) {
  vi.mocked(useAuth).mockReturnValue({
    usuario: perfil
      ? {
          perfil,
          cpf: "",
          nome: "Usuario Teste",
          emailLogin: "usuario@teste.com",
        }
      : null,
    isAutenticado: perfil !== null,
    entrar: vi.fn(),
    sair: vi.fn(),
  });
}

function renderizarRota(permitidos: PerfilUsuario[]) {
  render(
    <MemoryRouter initialEntries={["/protegida"]}>
      <Routes>
        <Route
          element={<RequirePerfil permitidos={permitidos} />}
        >
          <Route
            path="/protegida"
            element={<h1>Conteudo protegido</h1>}
          />
        </Route>

        <Route path="/login" element={<h1>Tela de login</h1>} />

        <Route path="/diario" element={<h1>Diario</h1>} />

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

describe("Protecao de rotas", () => {
  it("redireciona usuario nao autenticado para login", () => {
    autenticar(null);
    renderizarRota(["PACIENTE"]);

    expect(screen.getByText("Tela de login")).toBeInTheDocument();
  });

  it("permite acesso ao perfil autorizado", () => {
    autenticar("PACIENTE");
    renderizarRota(["PACIENTE"]);

    expect(
      screen.getByText("Conteudo protegido")
    ).toBeInTheDocument();
  });

  it("redireciona paciente sem permissao", () => {
    autenticar("PACIENTE");
    renderizarRota(["RECEPCAO"]);

    expect(screen.getByText("Diario")).toBeInTheDocument();

    expect(
      screen.queryByText("Conteudo protegido")
    ).not.toBeInTheDocument();
  });

  it("redireciona profissional sem permissao", () => {
    autenticar("PROFISSIONAL");
    renderizarRota(["RECEPCAO"]);

    expect(
      screen.getByText("Painel profissional")
    ).toBeInTheDocument();
  });

  it("redireciona recepcao sem permissao", () => {
    autenticar("RECEPCAO");
    renderizarRota(["PACIENTE"]);

    expect(
      screen.getByText("Painel recepcao")
    ).toBeInTheDocument();
  });
});
