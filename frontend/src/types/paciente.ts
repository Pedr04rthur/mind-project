export type Sexo = "MASCULINO" | "FEMININO" | "OUTRO";

export type StatusUsuario = "ATIVO" | "INATIVO";

export type Prioridade = "BAIXA" | "MEDIA" | "ALTA";

export interface Paciente {
  cpf: string;
  nome: string;
  telefone: string;
  endereco: string;
  sexo: Sexo;
  email: string;
  dataNasc: string;
  status: StatusUsuario;
  prioridade: Prioridade;
  observacao: string;
  criadoEm: string;
}

export interface PacienteFormData {
  cpf: string;
  nome: string;
  telefone: string;
  endereco: string;
  sexo: Sexo;
  email: string;
  dataNasc: string;
  login: string;
  senha: string;
  confirmarSenha: string;
  prioridade: Prioridade;
  observacao: string;
}
