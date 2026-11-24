export type PerfilUsuario =
  | "PACIENTE"
  | "PROFISSIONAL"
  | "RECEPCAO";

export type PerfilUsuarioApi =
  | "PATIENT"
  | "RECEPTIONIST"
  | "PROFESSIONAL";

export type TipoProfissionalLogado =
  | "PSICOLOGO"
  | "PSIQUIATRA";

export interface UsuarioLogado {
  id?: number;
  perfil: PerfilUsuario;
  cpf: string;
  nome: string;
  tipoProfissional?: TipoProfissionalLogado;
  registro?: string;
  emailLogin: string;
  telefone?: string;
  endereco?: string;
  especialidade?: string;
}

export interface MeApiResponse {
  cpf: string | null;
  nome: string;
  email: string;
  profile: PerfilUsuarioApi;
  id?: number | null;
  telefone?: string | null;
  endereco?: string | null;
  especialidade?: string | null;
}

export function perfilFromApi(
  api: PerfilUsuarioApi
): PerfilUsuario {
  switch (api) {
    case "PATIENT":
      return "PACIENTE";

    case "PROFESSIONAL":
      return "PROFISSIONAL";

    case "RECEPTIONIST":
      return "RECEPCAO";
  }
}

export function usuarioFromMe(
  me: MeApiResponse
): UsuarioLogado {
  return {
    id: me.id ?? undefined,
    perfil: perfilFromApi(me.profile),
    cpf: me.cpf ?? "",
    nome: me.nome,
    emailLogin: me.email,
    telefone: me.telefone ?? undefined,
    endereco: me.endereco ?? undefined,
    especialidade: me.especialidade ?? undefined,
  };
}
