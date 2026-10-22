export type ConsultaStatus = "SCHEDULED" | "CANCELLED" | "COMPLETED";

export interface Consulta {
  id: number;
  patientCpf: string;
  patientName: string;
  professionalId: number;
  professionalName: string;
  scheduledAt: string;
  status: ConsultaStatus;
}

export interface ConsultaFormData {
  patientCpf: string;
  professionalCpf: string;
  scheduledAt: string;
}
