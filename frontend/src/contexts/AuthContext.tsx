import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { PerfilUsuario, UsuarioLogado } from "../types/auth";
import { usuarioFromMe } from "../types/auth";
import { api, setAccessToken, setOnUnauthorized } from "../services/api";

const STORAGE_KEY = "mindcare:usuario";

interface AuthContextValue {
  usuario: UsuarioLogado | null;
  isAutenticado: boolean;
  entrar: (email: string, senha: string) => Promise<PerfilUsuario>;
  sair: () => Promise<void>;
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
      if (usuario) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(usuario));
      else sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignora
    }
  }, [usuario]);

  useEffect(() => {
    setOnUnauthorized(() => {
      setUsuario(null);
      setAccessToken(null);
    });
    return () => setOnUnauthorized(null);
  }, []);

  const entrar = useCallback(async (email: string, senha: string) => {
    const auth = await api.auth.signin(email, senha);
    setAccessToken(auth.token);

    const me = await api.auth.me();
    const novo = usuarioFromMe(me);

    setUsuario(novo);
    return novo.perfil;
  }, []);

  const sair = useCallback(async () => {
    try {
      await api.auth.logout();
    } catch {
      // ignora
    } finally {
      setAccessToken(null);
      setUsuario(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ usuario, isAutenticado: usuario !== null, entrar, sair }}
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

export function getHomeDoPerfil(perfil: PerfilUsuario): string {
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
