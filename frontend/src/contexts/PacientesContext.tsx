import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { api, ApiError } from "../services/api";
import { useAuth } from "./AuthContext";

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

const PacientesContext =
  createContext<PacientesContextValue | null>(null);

export function PacientesProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { usuario } = useAuth();

  const perfil = usuario?.perfil;
  const email = usuario?.emailLogin;

  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!email || !perfil) {
      setPacientes([]);
      setLoading(false);
      setErro(null);
      return;
    }

    setLoading(true);
    setErro(null);

    try {
      if (perfil === "RECEPCAO") {
        const page = await api.patients.list(0, 200);

        setPacientes(
          page.content.map(patientFromApi)
        );

        return;
      }

      if (perfil === "PROFISSIONAL") {
        const consultas = await api.appointments.listMine();

        const pacientesUnicos = new Map<number, Paciente>();

        for (const consulta of consultas) {
          if (consulta.status === "CANCELLED") {
            continue;
          }

          const paciente = consulta.patient;

          if (pacientesUnicos.has(paciente.id)) {
            continue;
          }

          pacientesUnicos.set(paciente.id, {
            id: paciente.id,
            cpf: cpfFromApi(paciente.cpf),
            nome: paciente.name,
            telefone: "",
            endereco: "",
            email: "",
          });
        }

        setPacientes(
          Array.from(pacientesUnicos.values()).sort(
            (a, b) => a.nome.localeCompare(b.nome, "pt-BR")
          )
        );

        return;
      }

      setPacientes([]);
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
          ? err.message
          : "Erro ao carregar pacientes.";

      setPacientes([]);
      setErro(msg);

      console.error(
        "[MindCare] Erro ao carregar pacientes:",
        err
      );
    } finally {
      setLoading(false);
    }
  }, [email, perfil]);

  useEffect(() => {
    setPacientes([]);
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (perfil !== "PROFISSIONAL") return;

    const atualizar = () => {
      void refresh();
    };

    window.addEventListener("focus", atualizar);

    const intervalo = window.setInterval(
      atualizar,
      30000
    );

    return () => {
      window.removeEventListener("focus", atualizar);
      window.clearInterval(intervalo);
    };
  }, [perfil, refresh]);

  const getByCpf = (cpf: string) => {
    const alvo = cpfFromApi(cpf);

    return pacientes.find(
      (p) => p.cpf === alvo
    );
  };

  const create = async (
    paciente: Paciente,
    senha: string
  ) => {
    await api.patients.create(
      patientToApi(paciente, senha)
    );

    await refresh();
  };

  const update = async (
    paciente: Paciente,
    senhaPlaceholder = "senha123"
  ) => {
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
      value={{
        pacientes,
        loading,
        erro,
        getByCpf,
        create,
        update,
        remove,
        refresh,
      }}
    >
      {children}
    </PacientesContext.Provider>
  );
}

export function usePacientes() {
  const ctx = useContext(PacientesContext);

  if (!ctx) {
    throw new Error(
      "usePacientes precisa estar dentro de <PacientesProvider>"
    );
  }

  return ctx;
}
