import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { api, ApiError } from "../services/api";
import {
  patientFromApi,
  patientToApi,
  cpfFromApi,
  cpfToApi,
} from "../services/adapters";
import type { Paciente } from "../types/paciente";

interface PacientesContextValue {
  pacientes: Paciente[];
  loading: boolean;
  erro: string | null;
  getByCpf: (cpf: string) => Paciente | undefined;
  create: (paciente: Paciente, senha: string) => Promise<void>;
  update: (paciente: Paciente, senhaPlaceholder?: string) => Promise<void>;
  remove: (cpf: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const PacientesContext = createContext<PacientesContextValue | null>(null);

export function PacientesProvider({ children }: { children: ReactNode }) {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setErro(null);
    try {
      const page = await api.patients.list(0, 200);
      setPacientes(page.content.map(patientFromApi));
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
          ? err.message
          : "Erro ao carregar pacientes";
      setErro(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const getByCpf = (cpf: string) => {
    const alvo = cpfFromApi(cpf);
    return pacientes.find((p) => p.cpf === alvo);
  };

  const create = async (paciente: Paciente, senha: string) => {
    await api.patients.create(patientToApi(paciente, senha));
    await refresh();
  };

  const update = async (paciente: Paciente, senhaPlaceholder = "senha123") => {
    // TODO: o backend ainda exige "password" no PUT. Quando o backend
    // permitir atualização sem senha, remover o placeholder abaixo.
    await api.patients.update(
      cpfToApi(paciente.cpf),
      patientToApi(paciente, senhaPlaceholder)
    );
    await refresh();
  };

  const remove = async (cpf: string) => {
    await api.patients.remove(cpfToApi(cpf));
    await refresh();
  };

  return (
    <PacientesContext.Provider
      value={{ pacientes, loading, erro, getByCpf, create, update, remove, refresh }}
    >
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
