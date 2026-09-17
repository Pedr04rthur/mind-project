import type { PatientApi, PatientApiRequest, MoodLevelApi } from "./api";
import type { Paciente } from "../types/paciente";
import type { HumorType } from "../types/humor";

export function cpfToApi(cpf: string): string {
  return cpf.replace(/\D/g, "");
}

export function cpfFromApi(cpf: string): string {
  const digits = cpf.replace(/\D/g, "").padStart(11, "0").slice(0, 11);
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

export function patientFromApi(api: PatientApi): Paciente {
  return {
    id: api.id,
    cpf: cpfFromApi(api.cpf),
    nome: api.name,
    telefone: api.phone,
    endereco: api.address,
    email: api.email,
    status: "ATIVO",
    prioridade: "BAIXA",
  };
}

export function patientToApi(
  paciente: Paciente,
  senha: string
): PatientApiRequest {
  return {
    cpf: cpfToApi(paciente.cpf),
    name: paciente.nome,
    phone: paciente.telefone,
    email: paciente.email,
    address: paciente.endereco,
    password: senha,
  };
}

const HUMOR_PARA_API: Record<HumorType, MoodLevelApi> = {
  bom: "GOOD",
  ruim: "BAD",
};

export function humorToApi(humor: HumorType): MoodLevelApi {
  return HUMOR_PARA_API[humor];
}
