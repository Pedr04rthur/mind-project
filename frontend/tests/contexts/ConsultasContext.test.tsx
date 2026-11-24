import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

import {
  ConsultasProvider,
  useConsultas,
} from "../../src/contexts/ConsultasContext";

import { api } from "../../src/services/api";

vi.mock("../../src/services/api", () => ({
  ApiError: class ApiError extends Error {},
  api: {
    appointments: {
      create: vi.fn(),
      cancel: vi.fn(),
      reschedule: vi.fn(),
    },
    schedule: {
      byDate: vi.fn(),
    },
  },
}));

const consulta = {
  consultationId: 1,
  patientName: "Paciente Teste",
  professionalId: 2,
  professionalName: "Profissional Teste",
  scheduledAt: "2026-11-24T10:00:00",
};

function iniciarContexto() {
  return renderHook(() => useConsultas(), {
    wrapper: ConsultasProvider,
  });
}

describe("ConsultasContext", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("inicia sem consultas e sem erros", () => {
    const { result } = iniciarContexto();

    expect(result.current.consultas).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.erro).toBeNull();
  });

  it("agenda uma consulta normalizando o CPF", async () => {
    const { result } = iniciarContexto();

    await act(async () => {
      await result.current.criar({
        patientCpf: "123.456.789-00",
        professionalId: 2,
        scheduledAt: "2026-11-24T10:00:00",
      });
    });

    expect(api.appointments.create).toHaveBeenCalledWith({
      patientCpf: "12345678900",
      professionalId: 2,
      scheduledAt: "2026-11-24T10:00:00",
    });
  });

  it("cancela uma consulta pelo identificador", async () => {
    const { result } = iniciarContexto();

    await act(async () => {
      await result.current.cancelar(10);
    });

    expect(api.appointments.cancel).toHaveBeenCalledWith(10);
  });

  it("reagenda uma consulta", async () => {
    const { result } = iniciarContexto();

    await act(async () => {
      await result.current.reagendar(
        10,
        "2026-11-25T14:00:00"
      );
    });

    expect(api.appointments.reschedule).toHaveBeenCalledWith(
      10,
      "2026-11-25T14:00:00"
    );
  });

  it("carrega consultas por data", async () => {
    vi.mocked(api.schedule.byDate).mockResolvedValue([
      consulta,
    ]);

    const { result } = iniciarContexto();

    await act(async () => {
      await result.current.carregarPorData("2026-11-24");
    });

    expect(api.schedule.byDate).toHaveBeenCalledWith(
      "24-11-2026"
    );

    expect(result.current.consultas).toHaveLength(1);

    expect(result.current.consultas[0]).toMatchObject({
      id: 1,
      patientName: "Paciente Teste",
      professionalId: 2,
      status: "SCHEDULED",
    });

    expect(result.current.loading).toBe(false);
  });

  it("trata uma agenda vazia", async () => {
    vi.mocked(api.schedule.byDate).mockResolvedValue([]);

    const { result } = iniciarContexto();

    await act(async () => {
      await result.current.carregarPorData("2026-11-24");
    });

    expect(result.current.consultas).toEqual([]);
    expect(result.current.erro).toBeNull();
  });

  it("trata erro ao carregar a agenda", async () => {
    vi.mocked(api.schedule.byDate).mockRejectedValue(
      new Error("Falha de conexao")
    );

    const { result } = iniciarContexto();

    await act(async () => {
      await result.current.carregarPorData("2026-11-24");
    });

    expect(result.current.erro).toBe("Erro ao carregar agenda");
    expect(result.current.loading).toBe(false);
  });

  it("consulta todos os dias de um periodo", async () => {
    vi.mocked(api.schedule.byDate).mockResolvedValue([]);

    const { result } = iniciarContexto();

    await act(async () => {
      await result.current.carregarPorPeriodo(
        "2026-11-24",
        "2026-11-26"
      );
    });

    expect(api.schedule.byDate).toHaveBeenCalledTimes(3);

    expect(api.schedule.byDate).toHaveBeenCalledWith(
      "24-11-2026"
    );

    expect(api.schedule.byDate).toHaveBeenCalledWith(
      "25-11-2026"
    );

    expect(api.schedule.byDate).toHaveBeenCalledWith(
      "26-11-2026"
    );
  });

  it("ordena as consultas cronologicamente", async () => {
    vi.mocked(api.schedule.byDate)
      .mockResolvedValueOnce([
        {
          ...consulta,
          consultationId: 2,
          scheduledAt: "2026-11-24T15:00:00",
        },
        {
          ...consulta,
          consultationId: 1,
          scheduledAt: "2026-11-24T09:00:00",
        },
      ]);

    const { result } = iniciarContexto();

    await act(async () => {
      await result.current.carregarPorPeriodo(
        "2026-11-24",
        "2026-11-24"
      );
    });

    expect(
      result.current.consultas.map((item) => item.id)
    ).toEqual([1, 2]);
  });

  it("bloqueia periodos superiores a 60 dias", async () => {
    const { result } = iniciarContexto();

    await act(async () => {
      await result.current.carregarPorPeriodo(
        "2026-01-01",
        "2026-04-01"
      );
    });

    expect(result.current.erro).toBe(
      "O período máximo é de 60 dias."
    );

    expect(api.schedule.byDate).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
  });

  it("trata falha no agendamento", async () => {
    vi.mocked(api.appointments.create).mockRejectedValue(
      new Error("Falha no agendamento")
    );

    const { result } = iniciarContexto();

    await act(async () => {
      await expect(
        result.current.criar({
          patientCpf: "12345678900",
          professionalId: 2,
          scheduledAt: "2026-11-24T10:00:00",
        })
      ).rejects.toThrow("Falha no agendamento");
    });

    expect(result.current.erro).toBe("Erro ao agendar");
  });
});
