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
  getRegistroDoDia: (cpfPaciente: string, dataDia: string) => RegistroHumor | undefined;
  registrar: (
    cpfPaciente: string,
    humor: HumorType,
    comentario: string | null
  ) => Promise<RegistroHumor>;
  editar: (
    cpfPaciente: string,
    dataDia: string,
    humor: HumorType,
    comentario: string | null
  ) => Promise<RegistroHumor>;
  removerDoDia: (cpfPaciente: string, dataDia: string) => void;
}

const RegistrosHumorContext = createContext<RegistrosHumorContextValue | null>(null);

function loadInitial(): RegistroHumor[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as RegistroHumor[];
  } catch {}
  return [];
}

export function RegistrosHumorProvider({ children }: { children: ReactNode }) {
  const [registros, setRegistros] = useState<RegistroHumor[]>(loadInitial);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(registros));
    } catch {}
  }, [registros]);

  const getRegistroDoDia = (cpfPaciente: string, dataDia: string) =>
    registros.find((r) => r.cpfPaciente === cpfPaciente && r.dataDia === dataDia);

  const registrar = async (
    cpfPaciente: string,
    humor: HumorType,
    comentario: string | null
  ): Promise<RegistroHumor> => {
    const cpfApi = cpfToApi(cpfPaciente);
    try {
      await api.mood.register(cpfApi, {
        moodLevel: humorToApi(humor),
        comment: comentario,
      });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 400) throw new Error(err.message || "Você já registrou seu humor hoje.");
        if (err.status === 404) throw new Error("Paciente não encontrado. Faça login novamente.");
        throw new Error(err.message || "Erro ao registrar humor.");
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

    setRegistros((atual) => {
      const existe = atual.find((r) => r.cpfPaciente === cpfPaciente && r.dataDia === dataDia);
      if (existe) return atual;
      return [registro, ...atual];
    });
    return registro;
  };

  const editar = async (
    cpfPaciente: string,
    dataDia: string,
    humor: HumorType,
    comentario: string | null
  ): Promise<RegistroHumor> => {
    const registroAtual = getRegistroDoDia(cpfPaciente, dataDia);
    if (!registroAtual) {
      throw new Error("Registro do dia não encontrado.");
    }

    // O backend precisa expor PUT /patients/{cpf}/moods/{id}
    // Enquanto não existir, mostramos um erro amigável.
    const cpfApi = cpfToApi(cpfPaciente);

    try {
      // Tenta usar o id numérico do backend. O registro local usa um id string.
      const idNumerico = Number(registroAtual.id);
      if (!Number.isFinite(idNumerico)) {
        throw new ApiError("Backend ainda não suporta edição de humor.", 501);
      }

      await api.mood.update(cpfApi, idNumerico, {
        moodLevel: humorToApi(humor),
        comment: comentario,
      });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 404 || err.status === 405 || err.status === 501) {
          throw new Error(
            "A edição de humor ainda não está disponível no servidor. Por enquanto, o registro do dia não pode ser alterado."
          );
        }
        throw new Error(err.message || "Erro ao editar humor.");
      }
      throw err;
    }

    const registroAtualizado: RegistroHumor = {
      ...registroAtual,
      humor,
      comentario,
    };

    setRegistros((atual) =>
      atual.map((r) =>
        r.cpfPaciente === cpfPaciente && r.dataDia === dataDia
          ? registroAtualizado
          : r
      )
    );

    return registroAtualizado;
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
      value={{ registros, getRegistroDoDia, registrar, editar, removerDoDia }}
    >
      {children}
    </RegistrosHumorContext.Provider>
  );
}

export function useRegistrosHumor() {
  const ctx = useContext(RegistrosHumorContext);
  if (!ctx) throw new Error("useRegistrosHumor precisa estar dentro de <RegistrosHumorProvider>");
  return ctx;
}
