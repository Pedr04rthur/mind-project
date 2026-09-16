export type PerfilUsuario = "PACIENTE" | "PROFISSIONAL" | "RECEPCAO";

export type TipoProfissionalLogado = "PSICOLOGO" | "PSIQUIATRA";

export interface UsuarioLogado {
  perfil: PerfilUsuario;
  cpf: string;
  nome: string;
  /** Preenchido apenas quando perfil === "PROFISSIONAL" */
  tipoProfissional?: TipoProfissionalLogado;
  /** CRP quando psicólogo, CRM quando psiquiatra */
  registro?: string;
  /** Só para uso didático na demo — simula a "conta de acesso" */
  emailLogin: string;
}
