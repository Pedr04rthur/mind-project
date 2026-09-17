/**
 * Valida CPF usando o mesmo algoritmo do Hibernate Validator (@CPF).
 * Retorna true somente para CPFs com dígito verificador correto.
 */
export function isValidCPF(value: string): boolean {
  const digits = value.replace(/\D/g, "");

  if (digits.length !== 11) return false;

  // Rejeita sequências repetidas (000.000.000-00, 111.111.111-11, etc.)
  if (/^(\d)\1{10}$/.test(digits)) return false;

  const calcDigito = (base: string, pesoInicial: number): number => {
    let soma = 0;
    for (let i = 0; i < base.length; i++) {
      soma += parseInt(base[i], 10) * (pesoInicial - i);
    }
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };

  const d1 = calcDigito(digits.slice(0, 9), 10);
  if (d1 !== parseInt(digits[9], 10)) return false;

  const d2 = calcDigito(digits.slice(0, 10), 11);
  if (d2 !== parseInt(digits[10], 10)) return false;

  return true;
}
