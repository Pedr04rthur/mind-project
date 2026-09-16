import { Smile, Frown } from "lucide-react";
import type { HumorType } from "../../types/humor";
import styles from "./HumorCard.module.css";

interface HumorCardProps {
  tipo: HumorType;
  label: string;
  selected: boolean;
  onSelect: (tipo: HumorType) => void;
}

export function HumorCard({ tipo, label, selected, onSelect }: HumorCardProps) {
  const Icon = tipo === "bom" ? Smile : Frown;

  return (
    <button
      type="button"
      className={`${styles.card} ${selected ? styles.selected : ""}`}
      onClick={() => onSelect(tipo)}
      aria-pressed={selected}
      aria-label={`Selecionar humor ${label}`}
    >
      <Icon className={styles.icon} size={48} strokeWidth={1.8} />
      <span className={styles.label}>{label}</span>
    </button>
  );
}
