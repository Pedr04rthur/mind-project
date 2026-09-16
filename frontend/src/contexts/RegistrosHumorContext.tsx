import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { RegistroHumor } from "../types/humor";

const STORAGE_KEY = "mindcare:registros-humor";

interface RegistrosHumorContextValue {
  registros: RegistroHumor[];
  getRegistroDoDia: (
    cpfPaciente: string,
    dataDia: string
  ) => RegistroHumor | undefined;
  upsert: (registro: RegistroHumor) => void;
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

  const upsert = (registro: RegistroHumor) => {
    setRegistros((atual) => {
      const existe = atual.some((r) => r.id === registro.id);
      if (existe) {
        return atual.map((r) => (r.id === registro.id ? registro : r));
      }
      return [registro, ...atual];
    });
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
      value={{ registros, getRegistroDoDia, upsert, removerDoDia }}
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
