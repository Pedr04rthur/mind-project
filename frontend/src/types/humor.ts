export type HumorType = "bom" | "ruim";

export interface RegistroHumor {
  id: string;
  cpfPaciente: string;
  humor: HumorType;
  comentario: string | null;
  /** Timestamp ISO completo (YYYY-MM-DDTHH:mm:ss.sssZ) */
  criadoEm: string;
  /** Data no formato YYYY-MM-DD, usada como chave de unicidade diária */
  dataDia: string;
}
