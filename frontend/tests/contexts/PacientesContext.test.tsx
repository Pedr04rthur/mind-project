import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

import {
  PacientesProvider,
  usePacientes,
} from "../../src/contexts/PacientesContext";

import { useAuth } from "../../src/contexts/AuthContext";
import { api } from "../../src/services/api";
import { patientFromApi } from "../../src/services/adapters";

import type { UsuarioLogado } from "../../src/types/auth";
import type { AppointmentDetailsApi } from "../../src/services/api";

vi.mock("../../src/contexts/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../../src/services/api", () => ({
  ApiError: class ApiError extends Error {},
  api: {
    patients: {
      list: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
    },
    appointments: {
      listMine: vi.fn(),
    },
  },
}));

const pacienteApi = {
  id: 1,
  cpf: "12345678900",
  name: "Paciente Teste",
  phone: "83999999999",
  email: "paciente@teste.com",
  address: "Endereco Teste",
};

const paciente = patientFromApi(pacienteApi);

const pagina = {
  content: [pacienteApi],
  totalElements: 1,
  totalPages: 1,
  number: 0,
  size: 200,
};

const consulta: AppointmentDetailsApi = {
  id: 1,
  scheduledAt: "2026-11-24T10:00:00",
  status: "SCHEDULED",
  patient: {
    id: 1,
    cpf: "12345678900",
    name: "Paciente Teste",
  },
  professional: {
    id: 2,
    name: "Profissional Teste",
    specialty: "Psicologia",
  },
};

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
  return renderHook(() => usePacientes(), {
    wrapper: PacientesProvider,
  });
}

describe("PacientesContext", () => {
  beforeEach(() => {
    vi.resetAllMocks();

    vi.spyOn(console, "error").mockImplementation(() => {});

    autenticar("RECEPCAO");

    vi.mocked(api.patients.list).mockResolvedValue(pagina);
    vi.mocked(api.appointments.listMine).mockResolvedValue([]);
  });

  it("carrega pacientes para a recepcao", async () => {
    const { result } = iniciarContexto();

    await waitFor(() => {
      expect(result.current.pacientes).toHaveLength(1);
    });

    expect(api.patients.list).toHaveBeenCalledWith(0, 200);
    expect(result.current.pacientes[0]).toEqual(paciente);
  });

  it("localiza paciente pelo CPF sem pontuacao", async () => {
    const { result } = iniciarContexto();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(
      result.current.getByCpf("12345678900")
    ).toEqual(paciente);
  });

  it("cadastra paciente e atualiza a lista", async () => {
    const { result } = iniciarContexto();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.create(paciente, "senhaTeste");
    });

    expect(api.patients.create).toHaveBeenCalledWith({
      cpf: "12345678900",
      name: "Paciente Teste",
      phone: "83999999999",
      email: "paciente@teste.com",
      address: "Endereco Teste",
      password: "senhaTeste",
    });

    expect(api.patients.list).toHaveBeenCalledTimes(2);
  });

  it("atualiza dados do paciente", async () => {
    const { result } = iniciarContexto();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.update({
        ...paciente,
        nome: "Nome Atualizado",
      }, "senhaTeste");
    });

    expect(api.patients.update).toHaveBeenCalledWith(
      "12345678900",
      expect.objectContaining({
        name: "Nome Atualizado",
      })
    );
  });

  it("exclui paciente e atualiza a listagem", async () => {
    const { result } = iniciarContexto();

    await waitFor(() => {
      expect(result.current.pacientes).toHaveLength(1);
    });

    vi.mocked(api.patients.list).mockResolvedValue({
      ...pagina,
      content: [],
      totalElements: 0,
      totalPages: 0,
    });

    await act(async () => {
      await result.current.remove("123.456.789-00");
    });

    expect(api.patients.remove).toHaveBeenCalledWith(
      "12345678900"
    );

    expect(result.current.pacientes).toEqual([]);
  });

  it("nao carrega lista administrativa para pacientes", async () => {
    autenticar("PACIENTE");

    const { result } = iniciarContexto();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(api.patients.list).not.toHaveBeenCalled();
    expect(result.current.pacientes).toEqual([]);
  });

  it("nao carrega dados sem autenticacao", async () => {
    vi.mocked(useAuth).mockReturnValue({
      usuario: null,
    } as ReturnType<typeof useAuth>);

    const { result } = iniciarContexto();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(api.patients.list).not.toHaveBeenCalled();
    expect(api.appointments.listMine).not.toHaveBeenCalled();
  });

  it("carrega pacientes vinculados ao profissional", async () => {
    autenticar("PROFISSIONAL");

    vi.mocked(api.appointments.listMine).mockResolvedValue([
      consulta,
    ]);

    const { result } = iniciarContexto();

    await waitFor(() => {
      expect(result.current.pacientes).toHaveLength(1);
    });

    expect(api.patients.list).not.toHaveBeenCalled();

    expect(result.current.pacientes[0].nome).toBe(
      "Paciente Teste"
    );
  });

  it("ignora consultas canceladas e pacientes duplicados", async () => {
    autenticar("PROFISSIONAL");

    vi.mocked(api.appointments.listMine).mockResolvedValue([
      consulta,
      { ...consulta, id: 2 },
      {
        ...consulta,
        id: 3,
        status: "CANCELLED",
        patient: {
          id: 9,
          cpf: "98765432100",
          name: "Paciente Cancelado",
        },
      },
    ]);

    const { result } = iniciarContexto();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.pacientes).toHaveLength(1);
    expect(result.current.pacientes[0].id).toBe(1);
  });

  it("trata erro de comunicacao com o backend", async () => {
    vi.mocked(api.patients.list).mockRejectedValue(
      new Error("Backend indisponivel")
    );

    const { result } = iniciarContexto();

    await waitFor(() => {
      expect(result.current.erro).toBe("Backend indisponivel");
    });

    expect(result.current.pacientes).toEqual([]);
    expect(result.current.loading).toBe(false);
  });
});
