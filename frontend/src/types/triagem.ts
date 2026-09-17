import type { Prioridade } from "./paciente";

export interface Triagem {
  cpf: string;
  prioridade: Prioridade;
  observacao: string;
  triadoEm: string; // ISO timestamp
}
