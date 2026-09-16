import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { UsuarioLogado } from "../types/auth";

const STORAGE_KEY = "mindcare:usuario";

interface AuthContextValue {
  usuario: UsuarioLogado | null;
  isAutenticado: boolean;
  entrar: (usuario: UsuarioLogado) => void;
  sair: () => void;
  /** Atalho: troca de perfil sem perder o estado da sessão */
  trocarPerfil: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function loadInitial(): UsuarioLogado | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as UsuarioLogado;
  } catch {
    // ignora
  }
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioLogado | null>(loadInitial);

  useEffect(() => {
    try {
      if (usuario) {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(usuario));
      } else {
        sessionStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // ignora
    }
  }, [usuario]);

  const entrar = useCallback((u: UsuarioLogado) => setUsuario(u), []);
  const sair = useCallback(() => setUsuario(null), []);
  const trocarPerfil = useCallback(() => setUsuario(null), []);

  return (
    <AuthContext.Provider
      value={{
        usuario,
        isAutenticado: usuario !== null,
        entrar,
        sair,
        trocarPerfil,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth precisa estar dentro de <AuthProvider>");
  }
  return ctx;
}

/** Retorna o "home" de cada perfil, usado para redirecionamento pós-login. */
export function getHomeDoPerfil(perfil: string): string {
  switch (perfil) {
    case "PACIENTE":
      return "/diario";
    case "PROFISSIONAL":
      return "/profissional/pacientes";
    case "RECEPCAO":
      return "/recepcao/pacientes";
    default:
      return "/login";
  }
}
