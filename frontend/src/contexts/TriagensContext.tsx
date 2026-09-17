import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Triagem } from "../types/triagem";
import type { Prioridade } from "../types/paciente";

const STORAGE_KEY = "mindcare:triagens";

interface TriagensContextValue {
  triagens: Triagem[];
  getByCpf: (cpf: string) => Triagem | undefined;
  salvar: (cpf: string, prioridade: Prioridade, observacao: string) => void;
  remover: (cpf: string) => void;
}

const TriagensContext = createContext<TriagensContextValue | null>(null);

function loadInitial(): Triagem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Triagem[];
  } catch {
    // ignora
  }
  return [];
}

export function TriagensProvider({ children }: { children: ReactNode }) {
  const [triagens, setTriagens] = useState<Triagem[]>(loadInitial);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(triagens));
    } catch {
      // ignora
    }
  }, [triagens]);

  const getByCpf = (cpf: string) => triagens.find((t) => t.cpf === cpf);

  const salvar = (
    cpf: string,
    prioridade: Prioridade,
    observacao: string
  ) => {
    const nova: Triagem = {
      cpf,
      prioridade,
      observacao: observacao.trim(),
      triadoEm: new Date().toISOString(),
    };
    setTriagens((atual) => {
      const existe = atual.some((t) => t.cpf === cpf);
      if (existe) return atual.map((t) => (t.cpf === cpf ? nova : t));
      return [nova, ...atual];
    });
  };

  const remover = (cpf: string) => {
    setTriagens((atual) => atual.filter((t) => t.cpf !== cpf));
  };

  return (
    <TriagensContext.Provider value={{ triagens, getByCpf, salvar, remover }}>
      {children}
    </TriagensContext.Provider>
  );
}

export function useTriagens() {
  const ctx = useContext(TriagensContext);
  if (!ctx) {
    throw new Error("useTriagens precisa estar dentro de <TriagensProvider>");
  }
  return ctx;
}
