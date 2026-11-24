import { useId } from "react";

import {
  ClipboardList,
  ChevronDown,
  ShieldAlert,
} from "lucide-react";

import {
  PRESCRICAO_TIPO_LABELS,
  type PrescricaoTipo,
} from "../../types/prescricao";

import styles from "./TipoPrescricaoCombobox.module.css";

interface Props {
  value: PrescricaoTipo | "";
  onChange: (value: PrescricaoTipo | "") => void;
  possuiCRM: boolean;
  permiteExames?: boolean;
  disabled?: boolean;
  required?: boolean;
  tiposPermitidos?: PrescricaoTipo[];
}

const OPCOES: PrescricaoTipo[] = [
  "MEDICATION",
  "EXAM",
  "COUNSELING",
  "EXERCISE",
];

export function TipoPrescricaoCombobox({
  value,
  onChange,
  possuiCRM,
  permiteExames = false,
  disabled = false,
  required = true,
  tiposPermitidos = OPCOES,
}: Props) {
  const id = useId();

  function motivoBloqueio(tipo: PrescricaoTipo): string {
    if (tipo === "MEDICATION" && !possuiCRM) {
      return "Requer CRM";
    }

    if (tipo === "EXAM" && !permiteExames) {
      return "Indisponível";
    }

    if (!tiposPermitidos.includes(tipo)) {
      return "Indisponível nesta tela";
    }

    return "";
  }

  const bloqueado =
    value !== "" &&
    value !== "THERAPEUTIC" &&
    motivoBloqueio(value) !== "";

  return (
    <div className={styles.container}>
      <label htmlFor={id} className={styles.label}>
        Tipo de prescrição

        {required && (
          <span className={styles.required}> *</span>
        )}
      </label>

      <div className={styles.selectWrapper}>
        <ClipboardList
          size={19}
          className={styles.icon}
          aria-hidden="true"
        />

        <select
          id={id}
          value={value}
          disabled={disabled}
          required={required}
          aria-invalid={bloqueado}
          aria-describedby={
            bloqueado || !possuiCRM
              ? `${id}-aviso`
              : undefined
          }
          className={`${styles.select} ${
            bloqueado ? styles.invalid : ""
          }`}
          onChange={(e) =>
            onChange(e.target.value as PrescricaoTipo | "")
          }
        >
          <option value="">
            Selecione o tipo de prescrição
          </option>

          {OPCOES.map((tipo) => {
            const motivo = motivoBloqueio(tipo);

            return (
              <option
                key={tipo}
                value={tipo}
                disabled={Boolean(motivo)}
              >
                {PRESCRICAO_TIPO_LABELS[tipo]}
                {motivo ? ` — ${motivo}` : ""}
              </option>
            );
          })}

          {value === "THERAPEUTIC" && (
            <option value="THERAPEUTIC">
              Orientação terapêutica
            </option>
          )}
        </select>

        <ChevronDown
          size={18}
          className={styles.chevron}
          aria-hidden="true"
        />
      </div>

      {(bloqueado || !possuiCRM) && (
        <div
          id={`${id}-aviso`}
          className={styles.aviso}
          role={bloqueado ? "alert" : undefined}
        >
          <ShieldAlert size={17} />

          <span>
            {bloqueado
              ? "Permissão negada para este tipo de prescrição."
              : "A prescrição de medicamentos exige CRM."}
          </span>
        </div>
      )}
    </div>
  );
}