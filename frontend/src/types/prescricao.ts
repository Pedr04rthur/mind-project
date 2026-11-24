export type PrescricaoStatus =
  | "DRAFT"
  | "ISSUED"
  | "CANCELLED";

export type PrescricaoTipo =
  | "MEDICATION"
  | "EXAM"
  | "COUNSELING"
  | "EXERCISE"
  | "THERAPEUTIC";

export interface PrescricaoItemRequest {
  medicationName: string;
  activeIngredient: string;
  concentration: string;
  pharmaceuticalForm: string;
  dose: string;
  route: string;
  frequency: string;
  duration: string;
  quantity: string;
  instructions: string;
}

export interface PrescricaoRequest {
  type?: PrescricaoTipo;
  items: PrescricaoItemRequest[];
  instructions: string;
  recommendations: string;
  followUpInstructions: string;
}

export interface PrescricaoItem extends PrescricaoItemRequest {
  id: number;
}

export interface Prescricao {
  id: number;
  consultationId: number;
  type: PrescricaoTipo;
  status: PrescricaoStatus;
  createdAt: string;
  updatedAt: string;
  issuedAt: string | null;
  cancelledAt: string | null;
  instructions: string | null;
  recommendations: string | null;
  followUpInstructions: string | null;
  items: PrescricaoItem[];
}

export const PRESCRICAO_STATUS_LABELS: Record<
  PrescricaoStatus,
  string
> = {
  DRAFT: "Rascunho",
  ISSUED: "Emitida",
  CANCELLED: "Cancelada",
};

export const PRESCRICAO_TIPO_LABELS: Record<
  PrescricaoTipo,
  string
> = {
  MEDICATION: "Medicamento",
  EXAM: "Exame",
  COUNSELING: "Aconselhamento",
  EXERCISE: "Exercício",
  THERAPEUTIC: "Orientação terapêutica",
};

export function isOrientacaoTerapeutica(
  tipo: PrescricaoTipo
): boolean {
  return (
    tipo === "THERAPEUTIC" ||
    tipo === "COUNSELING" ||
    tipo === "EXERCISE"
  );
}

export function criarItemVazio(): PrescricaoItemRequest {
  return {
    medicationName: "",
    activeIngredient: "",
    concentration: "",
    pharmaceuticalForm: "",
    dose: "",
    route: "",
    frequency: "",
    duration: "",
    quantity: "",
    instructions: "",
  };
}