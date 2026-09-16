import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Paciente } from "../types/paciente";
import { MOCK_PACIENTES } from "../data/mockPacientes";

const STORAGE_KEY = "mindcare:pacientes";

interface PacientesContextValue {
  pacientes: Paciente[];
  getByCpf: (cpf: string) => Paciente | undefined;
  upsert: (paciente: Paciente) => void;
  remove: (cpf: string) => void;
}

const PacientesContext = createContext<PacientesContextValue | null>(null);

function loadInitial(): Paciente[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Paciente[];
  } catch {
    // ignora
  }
  return MOCK_PACIENTES;
}

export function PacientesProvider({ children }: { children: ReactNode }) {
  const [pacientes, setPacientes] = useState<Paciente[]>(loadInitial);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pacientes));
    } catch {
      // ignora
    }
  }, [pacientes]);

  const getByCpf = (cpf: string) =>
    pacientes.find((p) => p.cpf === decodeURIComponent(cpf));

  const upsert = (paciente: Paciente) => {
    setPacientes((atual) => {
      const existe = atual.some((p) => p.cpf === paciente.cpf);
      if (existe) {
        return atual.map((p) => (p.cpf === paciente.cpf ? paciente : p));
      }
      return [paciente, ...atual];
    });
  };

  const remove = (cpf: string) => {
    setPacientes((atual) => atual.filter((p) => p.cpf !== cpf));
  };

  return (
    <PacientesContext.Provider value={{ pacientes, getByCpf, upsert, remove }}>
      {children}
    </PacientesContext.Provider>
  );
}

export function usePacientes() {
  const ctx = useContext(PacientesContext);
  if (!ctx) {
    throw new Error("usePacientes precisa estar dentro de <PacientesProvider>");
  }
  return ctx;
}
