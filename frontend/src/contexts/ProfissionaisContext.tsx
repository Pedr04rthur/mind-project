import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Profissional } from "../types/profissional";
import { MOCK_PROFISSIONAIS } from "../data/mockProfissionais";

const STORAGE_KEY = "mindcare:profissionais";

interface ProfissionaisContextValue {
  profissionais: Profissional[];
  getByCpf: (cpf: string) => Profissional | undefined;
  upsert: (profissional: Profissional) => void;
  remove: (cpf: string) => void;
}

const ProfissionaisContext = createContext<ProfissionaisContextValue | null>(null);

function loadInitial(): Profissional[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Profissional[];
  } catch {
    // ignora
  }
  return MOCK_PROFISSIONAIS;
}

export function ProfissionaisProvider({ children }: { children: ReactNode }) {
  const [profissionais, setProfissionais] = useState<Profissional[]>(loadInitial);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profissionais));
    } catch {
      // ignora
    }
  }, [profissionais]);

  const getByCpf = (cpf: string) =>
    profissionais.find((p) => p.cpf === decodeURIComponent(cpf));

  const upsert = (profissional: Profissional) => {
    setProfissionais((atual) => {
      const existe = atual.some((p) => p.cpf === profissional.cpf);
      if (existe) {
        return atual.map((p) => (p.cpf === profissional.cpf ? profissional : p));
      }
      return [profissional, ...atual];
    });
  };

  const remove = (cpf: string) => {
    setProfissionais((atual) => atual.filter((p) => p.cpf !== cpf));
  };

  return (
    <ProfissionaisContext.Provider
      value={{ profissionais, getByCpf, upsert, remove }}
    >
      {children}
    </ProfissionaisContext.Provider>
  );
}

export function useProfissionais() {
  const ctx = useContext(ProfissionaisContext);
  if (!ctx) {
    throw new Error(
      "useProfissionais precisa estar dentro de <ProfissionaisProvider>"
    );
  }
  return ctx;
}
