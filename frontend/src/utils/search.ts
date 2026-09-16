/**
 * Normaliza texto para comparação:
 * - minúsculas
 * - remove acentos
 * - remove espaços nas pontas
 */
export function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/**
 * Retorna apenas os dígitos de uma string.
 * Útil para comparar CPF/telefone com ou sem máscara.
 */
export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Retorna true se o termo de busca casa com algum dos campos.
 * Regras:
 * - Compara texto normalizado (sem acento, minúsculo).
 * - Se o termo contiver dígitos, também compara só dígitos
 *   (ex.: "12345678900" acha "123.456.789-00").
 * - Termo vazio retorna true (não filtra).
 */
export function matchesSearch(termo: string, ...campos: (string | undefined)[]): boolean {
  const texto = normalizeText(termo);
  if (!texto) return true;

  const apenasDigitos = onlyDigits(termo);
  const temDigitos = apenasDigitos.length > 0;

  return campos.some((campo) => {
    if (!campo) return false;

    if (normalizeText(campo).includes(texto)) return true;

    if (temDigitos && onlyDigits(campo).includes(apenasDigitos)) return true;

    return false;
  });
}
