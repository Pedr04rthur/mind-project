export type Sexo = "MASCULINO" | "FEMININO" | "OUTRO";
export type StatusUsuario = "ATIVO" | "INATIVO";
export type Prioridade = "BAIXA" | "MEDIA" | "ALTA";

export interface Paciente {
  /** Vem do backend */
  id?: number;
  cpf: string;
  nome: string;
  telefone: string;
  endereco: string;
  email: string;

  /** Campos ainda não suportados pelo backend — só existem localmente */
  sexo?: Sexo;
  dataNasc?: string;
  status?: StatusUsuario;
  prioridade?: Prioridade;
  observacao?: string;
  criadoEm?: string;
}

export interface PacienteFormData {
  cpf: string;
  nome: string;
  telefone: string;
  endereco: string;
  email: string;
  login: string;
  senha: string;
  confirmarSenha: string;
}
