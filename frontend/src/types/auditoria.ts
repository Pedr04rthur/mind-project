export interface LogExclusao {
  id: number;
  tabelaAfetada: string;
  registroId: number;
  cpfAfetado: string | null;
  responsavel: string;
  dataExclusao: string;
}

export interface FiltrosAuditoria {
  cpf?: string;
  tabela?: string;
  inicio?: string;
  fim?: string;
  page?: number;
  size?: number;
}

export interface PaginaAuditoria {
  content: LogExclusao[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
