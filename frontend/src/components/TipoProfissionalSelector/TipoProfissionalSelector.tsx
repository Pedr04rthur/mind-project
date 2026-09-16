import { Brain, Stethoscope, Check } from "lucide-react";
import type { TipoProfissional } from "../../types/profissional";
import styles from "./TipoProfissionalSelector.module.css";

interface TipoProfissionalSelectorProps {
  value: TipoProfissional | null;
  onChange: (tipo: TipoProfissional) => void;
  disabled?: boolean;
  legend?: string;
  /**
   * "full" (padrão): cards grandes com ícone, título, descrição e bullets.
   * "compact": duas pílulas lado a lado, só com ícone + rótulo.
   * Útil para filtros e cabeçalhos.
   */
  variant?: "full" | "compact";
}

interface TipoOption {
  tipo: TipoProfissional;
  label: string;
  subtitle: string;
  description: string;
  bullets: string[];
  icon: typeof Brain;
}

const OPTIONS: TipoOption[] = [
  {
    tipo: "PSICOLOGO",
    label: "Psicólogo",
    subtitle: "CRP",
    description:
      "Profissional de saúde mental com formação em Psicologia. Conduz sessões terapêuticas.",
    bullets: [
      "Registro no CRP (Conselho Regional de Psicologia)",
      "Pode recomendar terapias e orientações",
      "Não prescreve medicamentos",
    ],
    icon: Brain,
  },
  {
    tipo: "PSIQUIATRA",
    label: "Psiquiatra",
    subtitle: "CRM",
    description:
      "Médico especialista em saúde mental. Diagnostica e trata transtornos com medicação.",
    bullets: [
      "Registro no CRM (Conselho Regional de Medicina)",
      "Pode prescrever medicamentos controlados",
      "Pode recomendar terapias em conjunto",
    ],
    icon: Stethoscope,
  },
];

export function TipoProfissionalSelector({
  value,
  onChange,
  disabled = false,
  legend = "Tipo de profissional",
  variant = "full",
}: TipoProfissionalSelectorProps) {
  if (variant === "compact") {
    return (
      <div
        className={styles.compactGroup}
        role="radiogroup"
        aria-label={legend}
      >
        {OPTIONS.map(({ tipo, label, icon: Icon }) => {
          const selected = value === tipo;
          return (
            <button
              key={tipo}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={disabled}
              className={`${styles.compactOption} ${
                selected ? styles.compactActive : ""
              }`}
              onClick={() => onChange(tipo)}
            >
              <Icon size={15} strokeWidth={2} aria-hidden="true" />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={styles.group} role="radiogroup" aria-label={legend}>
      {OPTIONS.map(({ tipo, label, subtitle, description, bullets, icon: Icon }) => {
        const selected = value === tipo;
        return (
          <button
            key={tipo}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            className={`${styles.option} ${selected ? styles.active : ""}`}
            onClick={() => onChange(tipo)}
          >
            <header className={styles.optionHeader}>
              <span className={styles.iconWrap} aria-hidden="true">
                <Icon size={20} strokeWidth={2} />
              </span>
              <div className={styles.optionTitles}>
                <span className={styles.optionLabel}>
                  {label}
                  <span className={styles.optionSubtitle}>{" · "}{subtitle}</span>
                </span>
              </div>
              <span
                className={`${styles.checkMark} ${
                  selected ? styles.checkVisible : ""
                }`}
                aria-hidden="true"
              >
                <Check size={14} strokeWidth={3} />
              </span>
            </header>

            <p className={styles.optionDescription}>{description}</p>

            <ul className={styles.optionBullets}>
              {bullets.map((b) => (
                <li key={b} className={styles.bulletItem}>
                  <span className={styles.bulletDot} aria-hidden="true" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </button>
        );
      })}
    </div>
  );
}
