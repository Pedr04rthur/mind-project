/**
 * Lista oficial das 27 Unidades Federativas do Brasil.
 * Usada para validar a UF de um CRM.
 */
export const UFS_BR = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO",
] as const;

export type UF = (typeof UFS_BR)[number];

/**
 * Aplica máscara de CRP.
 * Formato final: CRP-XX XXXXX (2 dígitos de região + até 5 de registro).
 * Aceita colar "13 12345", "13.12345", "CRP 13 12345", etc.
 */
export function maskCRP(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 7);
  if (!digits) return "";
  if (digits.length <= 2) return `CRP-${digits}`;
  return `CRP-${digits.slice(0, 2)} ${digits.slice(2)}`;
}

/**
 * Aplica máscara de CRM.
 * Formato final: CRM-UF XXXXX (2 letras de UF + até 6 dígitos).
 * Aceita colar "PB12345", "CRM-PB 12345", "crm/pb 12345", etc.
 */
export function maskCRM(value: string): string {
  let v = value.toUpperCase();
  if (v.startsWith("CRM-")) v = v.slice(4);
  else if (v.startsWith("CRM/")) v = v.slice(4);
  else if (v.startsWith("CRM ")) v = v.slice(4);
  else if (v.startsWith("CRM")) v = v.slice(3);

  v = v.replace(/^[-\s/]+/, "");

  const letters = v.replace(/[^A-Z]/g, "").slice(0, 2);
  const digits = v.replace(/[^0-9]/g, "").slice(0, 6);

  if (!letters && !digits) return "";
  if (!letters) return `CRM-${digits}`;
  if (!digits) return `CRM-${letters}`;
  return `CRM-${letters} ${digits}`;
}

/**
 * Valida CRP no formato CRP-XX XXXXX.
 * Regra: região entre 01 e 24, número com 4 a 6 dígitos.
 */
export function isValidCRP(value: string): boolean {
  const match = value.match(/^CRP-(\d{2})\s(\d{4,6})$/);
  if (!match) return false;
  const regiao = parseInt(match[1], 10);
  return regiao >= 1 && regiao <= 24;
}

/**
 * Valida CRM no formato CRM-UF XXXXX.
 * Regra: UF entre as 27 oficiais, número com 4 a 6 dígitos.
 */
export function isValidCRM(value: string): boolean {
  const match = value.match(/^CRM-([A-Z]{2})\s(\d{4,6})$/);
  if (!match) return false;
  return (UFS_BR as readonly string[]).includes(match[1]);
}

/**
 * Extrai a UF de um CRM já mascarado, se existir.
 */
export function getUFCRM(value: string): UF | null {
  const match = value.match(/^CRM-([A-Z]{2})/);
  if (!match) return null;
  return (UFS_BR as readonly string[]).includes(match[1])
    ? (match[1] as UF)
    : null;
}
