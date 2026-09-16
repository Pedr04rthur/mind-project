import type { TipoProfissional } from "../types/profissional";

export const ESPECIALIDADES: Record<TipoProfissional, string[]> = {
  PSICOLOGO: [
    "Terapia Cognitivo-Comportamental",
    "Terapia do Esquema",
    "Psicanálise",
    "Terapia Sistêmica Familiar",
    "Terapia Humanista",
    "Psicologia Clínica",
    "Psicologia Infantil",
    "Psicologia do Adolescente",
    "Neuropsicologia",
    "Psicologia do Esporte",
    "Psicologia Organizacional",
    "Avaliação Psicológica",
  ],
  PSIQUIATRA: [
    "Psiquiatria Clínica",
    "Psiquiatria Infantil",
    "Psiquiatria do Adolescente",
    "Psicogeriatria",
    "Neuropsiquiatria",
    "Psicofarmacologia",
    "Transtornos de Ansiedade",
    "Transtornos do Humor",
    "Transtornos Alimentares",
    "Dependência Química",
    "Psiquiatria Forense",
    "Psiquiatria de Emergência",
  ],
};
