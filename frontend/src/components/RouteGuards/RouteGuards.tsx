import { Navigate, Outlet } from "react-router-dom";
import { useAuth, getHomeDoPerfil } from "../../contexts/AuthContext";
import type { PerfilUsuario } from "../../types/auth";

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
