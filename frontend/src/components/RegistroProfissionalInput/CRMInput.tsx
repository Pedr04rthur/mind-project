import { Stethoscope, CheckCircle2, Info } from "lucide-react";
import { maskCRM, isValidCRM, getUFCRM } from "../../utils/registros";
import styles from "./RegistroProfissionalInput.module.css";

interface CRMInputProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  disabled?: boolean;
  required?: boolean;
}

export function CRMInput({
  value,
  onChange,
  id = "crm",
  disabled = false,
  required = false,
}: CRMInputProps) {
  const temConteudo = value.length > 0;
  const valido = isValidCRM(value);
  const uf = getUFCRM(value);

  return (
    <div className={styles.wrapper}>
      <div
        className={`${styles.inputWrapper} ${valido ? styles.valid : ""} ${
          disabled ? styles.disabled : ""
        }`}
      >
        <Stethoscope
          size={16}
          className={styles.leadingIcon}
          aria-hidden="true"
        />

        <input
          id={id}
          type="text"
          className={styles.input}
          value={value}
          onChange={(e) => onChange(maskCRM(e.target.value))}
          placeholder="CRM-PB 12345"
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
            aria-label="CRM válido"
          />
        )}
      </div>

      <span id={`${id}-hint`} className={styles.hint}>
        <Info size={12} aria-hidden="true" />
        {valido ? (
          <span className={styles.hintStrong}>
            CRM válido ({uf}). Habilita prescrição de medicamentos.
          </span>
        ) : (
          <span>
            Formato: <strong>CRM-UF 00000</strong>. UF com 2 letras (ex.:{" "}
            <strong>PB</strong>). Necessário para prescrição de medicamentos.
          </span>
        )}
      </span>
    </div>
  );
}
