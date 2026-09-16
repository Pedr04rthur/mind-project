import { BadgeCheck, CheckCircle2, Info } from "lucide-react";
import { maskCRP, isValidCRP } from "../../utils/registros";
import styles from "./RegistroProfissionalInput.module.css";

interface CRPInputProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  disabled?: boolean;
  required?: boolean;
}

export function CRPInput({
  value,
  onChange,
  id = "crp",
  disabled = false,
  required = false,
}: CRPInputProps) {
  const temConteudo = value.length > 0;
  const valido = isValidCRP(value);

  return (
    <div className={styles.wrapper}>
      <div
        className={`${styles.inputWrapper} ${valido ? styles.valid : ""} ${
          disabled ? styles.disabled : ""
        }`}
      >
        <BadgeCheck size={16} className={styles.leadingIcon} aria-hidden="true" />

        <input
          id={id}
          type="text"
          inputMode="numeric"
          className={styles.input}
          value={value}
          onChange={(e) => onChange(maskCRP(e.target.value))}
          placeholder="CRP-13 12345"
          disabled={disabled}
          required={required}
          autoComplete="off"
          spellCheck={false}
          aria-invalid={temConteudo && !valido}
          aria-describedby={`${id}-hint`}
        />

        {valido && (
          <CheckCircle2
            size={16}
            className={`${styles.statusIcon} ${styles.validIcon}`}
            aria-label="CRP válido"
          />
        )}
      </div>

      <span id={`${id}-hint`} className={styles.hint}>
        <Info size={12} aria-hidden="true" />
        {valido ? (
          <span className={styles.hintStrong}>
            CRP no formato correto. Validação simulada (sem consulta real ao
            Conselho).
          </span>
        ) : (
          <span>
            Formato: <strong>CRP-XX 00000</strong>. Região de 01 a 24 (ex.:{" "}
            <strong>13</strong> = Paraíba). Validação simulada.
          </span>
        )}
      </span>
    </div>
  );
}
