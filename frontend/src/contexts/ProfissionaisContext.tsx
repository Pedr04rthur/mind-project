import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { api, ApiError } from "../services/api";
import { MOCK_PROFISSIONAIS } from "../data/mockProfissionais";
import type { Profissional } from "../types/profissional";

const STORAGE_KEY = "mindcare:profissionais";

export interface ProfissionalBackend {
  id: number;
  name: string;
  specialty: string;
}

interface ProfissionaisContextValue {
  // --- Mock (usado pelas telas antigas de cadastro) ---
  profissionais: Profissional[];
  getByCpf: (cpf: string) => Profissional | undefined;
  upsert: (profissional: Profissional) => void;
  remove: (cpf: string) => void;

  // --- Backend (usado pelo agendamento) ---
  backendProfissionais: ProfissionalBackend[];
  loadingBackend: boolean;
  erroBackend: string | null;
  refreshBackend: () => Promise<void>;
}

const ProfissionaisContext = createContext<ProfissionaisContextValue | null>(null);

function loadInitial(): Profissional[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Profissional[];
  } catch {}
  return MOCK_PROFISSIONAIS;
}

export function ProfissionaisProvider({ children }: { children: ReactNode }) {
  // Mock
  const [profissionais, setProfissionais] = useState<Profissional[]>(loadInitial);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profissionais));
    } catch {}
  }, [profissionais]);

  const getByCpf = (cpf: string) =>
    profissionais.find((p) => p.cpf === decodeURIComponent(cpf));

  const upsert = (profissional: Profissional) => {
    setProfissionais((atual) => {
      const existe = atual.some((p) => p.cpf === profissional.cpf);
      if (existe) return atual.map((p) => (p.cpf === profissional.cpf ? profissional : p));
      return [profissional, ...atual];
    });
  };

  const remove = (cpf: string) => {
    setProfissionais((atual) => atual.filter((p) => p.cpf !== cpf));
  };

  // Backend
  const [backendProfissionais, setBackendProfissionais] = useState<ProfissionalBackend[]>([]);
  const [loadingBackend, setLoadingBackend] = useState(true);
  const [erroBackend, setErroBackend] = useState<string | null>(null);

  const refreshBackend = useCallback(async () => {
    setLoadingBackend(true);
    setErroBackend(null);
    try {
      const data = await api.professionals.list();
      setBackendProfissionais(data);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Erro ao carregar profissionais";
      setErroBackend(msg);
    } finally {
      setLoadingBackend(false);
    }
  }, []);

  useEffect(() => {
    refreshBackend();
  }, [refreshBackend]);

  return (
    <ProfissionaisContext.Provider
      value={{
        profissionais,
        getByCpf,
        upsert,
        remove,
        backendProfissionais,
        loadingBackend,
        erroBackend,
        refreshBackend,
      }}
    >
      {children}
    </ProfissionaisContext.Provider>
  );
}

export function useProfissionais() {
  const ctx = useContext(ProfissionaisContext);
  if (!ctx) throw new Error("useProfissionais precisa estar dentro de <ProfissionaisProvider>");
  return ctx;
}
