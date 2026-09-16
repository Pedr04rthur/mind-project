import { CheckCircle2, Smile, Frown, Clock, MessageSquare } from "lucide-react";
import { formatarHora } from "../../utils/dates";
import type { RegistroHumor } from "../../types/humor";
import styles from "./RegistroHojeCard.module.css";

interface RegistroHojeCardProps {
  registro: RegistroHumor;
  onResetar?: () => void;
}

export function RegistroHojeCard({ registro, onResetar }: RegistroHojeCardProps) {
  const Icon = registro.humor === "bom" ? Smile : Frown;
  const label = registro.humor === "bom" ? "Bom" : "Ruim";

  return (
    <div className={styles.card}>
      <div className={styles.successBadge} aria-hidden="true">
        <CheckCircle2 size={28} strokeWidth={2.2} />
      </div>

      <div className={styles.heading}>
        <h2 className={styles.title}>Tudo certo por hoje</h2>
        <p className={styles.subtitle}>
          Você já registrou seu humor de hoje. Volte amanhã para registrar
          novamente.
        </p>
      </div>

      <div className={styles.registroBox}>
        <div className={styles.registroHeader}>
          <span
            className={`${styles.moodIcon} ${
              registro.humor === "bom" ? styles.moodBom : styles.moodRuim
            }`}
            aria-hidden="true"
          >
            <Icon size={32} strokeWidth={1.8} />
          </span>
          <div className={styles.moodMeta}>
            <span
              className={`${styles.moodBadge} ${
                registro.humor === "bom" ? styles.badgeBom : styles.badgeRuim
              }`}
            >
              {label}
            </span>
            <span className={styles.moodTime}>
              <Clock size={13} aria-hidden="true" />
              Registrado hoje às {formatarHora(registro.criadoEm)}
            </span>
          </div>
        </div>

        {registro.comentario && (
          <div className={styles.commentBox}>
            <div className={styles.commentHeader}>
              <MessageSquare size={13} aria-hidden="true" />
              <span>Comentário do dia</span>
            </div>
            <p className={styles.commentText}>{registro.comentario}</p>
          </div>
        )}
      </div>

      <p className={styles.footerNote}>
        Seu terapeuta poderá visualizar este registro na próxima sessão.
      </p>

      {onResetar && (
        <button
          type="button"
          className={styles.resetLink}
          onClick={onResetar}
          title="Remove o registro de hoje (apenas para testes)"
        >
          Resetar teste (dev)
        </button>
      )}
    </div>
  );
}
