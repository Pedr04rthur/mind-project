import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "mindcare:alertas-reconhecidos";

export interface AlertaReconhecido {
  cpf: string;
  reconhecidoEm: string; // ISO
  reconhecidoPor: string;
}

interface AlertasReconhecidosContextValue {
  reconhecidos: AlertaReconhecido[];
  isReconhecido: (cpf: string) => boolean;
  getReconhecido: (cpf: string) => AlertaReconhecido | undefined;
  reconhecer: (cpf: string, reconhecidoPor: string) => void;
  reabrir: (cpf: string) => void;
}

const AlertasReconhecidosContext =
  createContext<AlertasReconhecidosContextValue | null>(null);

function loadInitial(): AlertaReconhecido[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as AlertaReconhecido[];
  } catch {}
  return [];
}

export function AlertasReconhecidosProvider({ children }: { children: ReactNode }) {
  const [reconhecidos, setReconhecidos] =
    useState<AlertaReconhecido[]>(loadInitial);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reconhecidos));
    } catch {}
  }, [reconhecidos]);

  const isReconhecido = useCallback(
    (cpf: string) => reconhecidos.some((r) => r.cpf === cpf),
    [reconhecidos]
  );

  const getReconhecido = useCallback(
    (cpf: string) => reconhecidos.find((r) => r.cpf === cpf),
    [reconhecidos]
  );

  const reconhecer = useCallback((cpf: string, reconhecidoPor: string) => {
    const nova: AlertaReconhecido = {
      cpf,
      reconhecidoEm: new Date().toISOString(),
      reconhecidoPor,
    };
    setReconhecidos((atual) => {
      const existe = atual.some((r) => r.cpf === cpf);
      if (existe) return atual.map((r) => (r.cpf === cpf ? nova : r));
      return [nova, ...atual];
    });
  }, []);

  const reabrir = useCallback((cpf: string) => {
    setReconhecidos((atual) => atual.filter((r) => r.cpf !== cpf));
  }, []);

  return (
    <AlertasReconhecidosContext.Provider
      value={{ reconhecidos, isReconhecido, getReconhecido, reconhecer, reabrir }}
    >
      {children}
    </AlertasReconhecidosContext.Provider>
  );
}

export function useAlertasReconhecidos() {
  const ctx = useContext(AlertasReconhecidosContext);
  if (!ctx) {
    throw new Error(
      "useAlertasReconhecidos precisa estar dentro de <AlertasReconhecidosProvider>"
    );
  }
  return ctx;
}
