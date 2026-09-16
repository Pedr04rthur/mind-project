import { Navigate, Outlet } from "react-router-dom";
import { useAuth, getHomeDoPerfil } from "../../contexts/AuthContext";
import type { PerfilUsuario } from "../../types/auth";

/**
 * Exige que o usuário esteja autenticado e (opcionalmente) que o
 * perfil esteja entre os permitidos.
 */
interface RequirePerfilProps {
  permitidos: PerfilUsuario[];
}

export function RequirePerfil({ permitidos }: RequirePerfilProps) {
  const { usuario } = useAuth();

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (!permitidos.includes(usuario.perfil)) {
    return <Navigate to={getHomeDoPerfil(usuario.perfil)} replace />;
  }

  return <Outlet />;
}
