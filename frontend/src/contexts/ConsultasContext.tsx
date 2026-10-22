import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { api, ApiError, type ScheduleItemApi } from "../services/api";
import { cpfToApi } from "../services/adapters";
import { toBackendDate } from "../utils/dates";
import type { Consulta } from "../types/consulta";

interface ConsultasContextValue {
  consultas: Consulta[];
  loading: boolean;
  erro: string | null;
  criar: (dados: {
    patientCpf: string;
    professionalId: number;
    scheduledAt: string;
  }) => Promise<void>;
  cancelar: (id: number) => Promise<void>;
  reagendar: (id: number, scheduledAt: string) => Promise<void>;
  carregarPorData: (dataIso: string) => Promise<void>;
  carregarPorPeriodo: (dataInicio: string, dataFim: string) => Promise<void>;
}

const ConsultasContext = createContext<ConsultasContextValue | null>(null);

function listarDiasEntre(inicio: string, fim: string): string[] {
  const dias: string[] = [];
  const atual = new Date(inicio + "T12:00:00");
  const fimDate = new Date(fim + "T12:00:00");

  while (atual <= fimDate) {
    const y = atual.getFullYear();
    const m = String(atual.getMonth() + 1).padStart(2, "0");
    const d = String(atual.getDate()).padStart(2, "0");
    dias.push(`${y}-${m}-${d}`);
    atual.setDate(atual.getDate() + 1);
  }

  return dias;
}

function mapScheduleToConsulta(item: ScheduleItemApi): Consulta {
  return {
    id: item.consultationId,
    patientCpf: "",
    patientName: item.patientName,
    professionalId: item.professionalId,
    professionalName: item.professionalName,
    scheduledAt: item.scheduledAt,
    status: "SCHEDULED",
  };
}

export function ConsultasProvider({ children }: { children: ReactNode }) {
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const criar = async (dados: {
    patientCpf: string;
    professionalId: number;
    scheduledAt: string;
  }) => {
    try {
      await api.appointments.create({
        patientCpf: cpfToApi(dados.patientCpf),
        professionalId: dados.professionalId,
        scheduledAt: dados.scheduledAt,
      });
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Erro ao agendar";
      setErro(msg);
      throw err;
    }
  };

  const cancelar = async (id: number) => {
    await api.appointments.cancel(id);
  };

  const reagendar = async (id: number, scheduledAt: string) => {
    await api.appointments.reschedule(id, scheduledAt);
  };

  const carregarPorData = useCallback(async (dataIso: string) => {
    setLoading(true);
    setErro(null);
    try {
      const dataBackend = toBackendDate(dataIso);
      const response = await api.schedule.byDate(dataBackend);
      setConsultas(response.map(mapScheduleToConsulta));
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : "Erro ao carregar agenda");
    } finally {
      setLoading(false);
    }
  }, []);

  const carregarPorPeriodo = useCallback(
    async (dataInicio: string, dataFim: string) => {
      setLoading(true);
      setErro(null);

      try {
        const dias = listarDiasEntre(dataInicio, dataFim);

        if (dias.length > 60) {
          setErro("O período máximo é de 60 dias.");
          setLoading(false);
          return;
        }

        const respostas: ScheduleItemApi[][] = await Promise.all(
          dias.map((dia) =>
            api.schedule
              .byDate(toBackendDate(dia))
              .catch((): ScheduleItemApi[] => [])
          )
        );

        const todas: Consulta[] = respostas
          .flat()
          .map(mapScheduleToConsulta)
          .sort(
            (a, b) =>
              new Date(a.scheduledAt).getTime() -
              new Date(b.scheduledAt).getTime()
          );

        setConsultas(todas);
      } catch (err) {
        setErro(err instanceof ApiError ? err.message : "Erro ao carregar período");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return (
    <ConsultasContext.Provider
      value={{
        consultas,
        loading,
        erro,
        criar,
        cancelar,
        reagendar,
        carregarPorData,
        carregarPorPeriodo,
      }}
    >
      {children}
    </ConsultasContext.Provider>
  );
}

export function useConsultas() {
  const ctx = useContext(ConsultasContext);
  if (!ctx) throw new Error("useConsultas precisa estar dentro de <ConsultasProvider>");
  return ctx;
}
