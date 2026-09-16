import type { Sexo, StatusUsuario } from "./paciente";

export type TipoProfissional = "PSICOLOGO" | "PSIQUIATRA";

export interface Profissional {
  cpf: string;
  nome: string;
  telefone: string;
  endereco: string;
  sexo: Sexo;
  email: string;
  tipo: TipoProfissional;
  crp: string;
  crm: string;
  especialidade: string;
  status: StatusUsuario;
  criadoEm: string;
}

export interface ProfissionalFormData {
  cpf: string;
  nome: string;
  telefone: string;
  endereco: string;
  sexo: Sexo;
  email: string;
  tipo: TipoProfissional;
  crp: string;
  crm: string;
  especialidade: string;
  login: string;
  senha: string;
  confirmarSenha: string;
}
