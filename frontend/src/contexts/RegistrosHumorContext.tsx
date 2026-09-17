import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { api, ApiError } from "../services/api";
import { cpfToApi, humorToApi } from "../services/adapters";
import { getDataDiaAtual } from "../utils/dates";
import type { RegistroHumor, HumorType } from "../types/humor";

const STORAGE_KEY = "mindcare:registros-humor";

interface RegistrosHumorContextValue {
  registros: RegistroHumor[];
  getRegistroDoDia: (
    cpfPaciente: string,
    dataDia: string
  ) => RegistroHumor | undefined;
  registrar: (
    cpfPaciente: string,
    humor: HumorType,
    comentario: string | null
  ) => Promise<RegistroHumor>;
  removerDoDia: (cpfPaciente: string, dataDia: string) => void;
}

const RegistrosHumorContext = createContext<RegistrosHumorContextValue | null>(
  null
);

function loadInitial(): RegistroHumor[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as RegistroHumor[];
  } catch {
    // ignora
  }
  return [];
}

export function RegistrosHumorProvider({ children }: { children: ReactNode }) {
  const [registros, setRegistros] = useState<RegistroHumor[]>(loadInitial);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(registros));
    } catch {
      // ignora
    }
  }, [registros]);

  const getRegistroDoDia = (cpfPaciente: string, dataDia: string) =>
    registros.find(
      (r) => r.cpfPaciente === cpfPaciente && r.dataDia === dataDia
    );

  const registrar = async (
    cpfPaciente: string,
    humor: HumorType,
    comentario: string | null
  ): Promise<RegistroHumor> => {
    try {
      await api.mood.register({
        patientCpf: cpfToApi(cpfPaciente),
        moodLevel: humorToApi(humor),
        comment: comentario,
      });
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        // Backend já rejeitou por duplicidade do dia — propaga com a mesma msg
        throw err;
      }
      throw err;
    }

    const agora = new Date();
    const dataDia = getDataDiaAtual(agora);
    const registro: RegistroHumor = {
      id: `${cpfPaciente}-${dataDia}`,
      cpfPaciente,
      humor,
      comentario,
      criadoEm: agora.toISOString(),
      dataDia,
    };

    setRegistros((atual) => [registro, ...atual]);
    return registro;
  };

  const removerDoDia = (cpfPaciente: string, dataDia: string) => {
    setRegistros((atual) =>
      atual.filter(
        (r) => !(r.cpfPaciente === cpfPaciente && r.dataDia === dataDia)
      )
    );
  };

  return (
    <RegistrosHumorContext.Provider
      value={{ registros, getRegistroDoDia, registrar, removerDoDia }}
    >
      {children}
    </RegistrosHumorContext.Provider>
  );
}

export function useRegistrosHumor() {
  const ctx = useContext(RegistrosHumorContext);
  if (!ctx) {
    throw new Error(
      "useRegistrosHumor precisa estar dentro de <RegistrosHumorProvider>"
    );
  }
  return ctx;
}
