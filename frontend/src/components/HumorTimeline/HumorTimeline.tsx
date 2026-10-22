import { useEffect, useState } from "react";
import {
  Smile,
  Frown,
  AlertCircle,
  MessageSquare,
  RefreshCw,
} from "lucide-react";
import { api, ApiError } from "../../services/api";
import { cpfToApi } from "../../services/adapters";
import styles from "./HumorTimeline.module.css";

export interface HumorRegistro {
  id: number;
  level: "GOOD" | "BAD";
  date: string; // YYYY-MM-DD
  comment: string | null;
}

interface HumorTimelineProps {
  cpfPaciente: string;
  limite?: number;
}

function formatarData(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function formatarDataLonga(iso: string): string {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

export function HumorTimeline({ cpfPaciente, limite = 10 }: HumorTimelineProps) {
  const [registros, setRegistros] = useState<HumorRegistro[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = async () => {
    if (!cpfPaciente) return;
    setLoading(true);
    setErro(null);
    try {
      const data = await api.mood.list(cpfToApi(cpfPaciente), "DESC");
      setRegistros(data.slice(0, limite));
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.status === 404
            ? "Paciente não encontrado."
            : err.message
          : "Erro ao carregar histórico de humor.";
      setErro(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cpfPaciente]);

  if (loading) {
    return (
      <div className={styles.state}>
        <RefreshCw size={20} className={styles.spinning} />
        <span>Carregando histórico...</span>
      </div>
    );
  }

  if (erro) {
    return (
      <div className={styles.state}>
        <AlertCircle size={20} />
        <span>{erro}</span>
        <button type="button" className={styles.retryButton} onClick={carregar}>
          Tentar novamente
        </button>
      </div>
    );
  }

  if (registros.length === 0) {
    return (
      <div className={styles.state}>
        <MessageSquare size={20} />
        <span>Nenhum registro de humor no diário ainda.</span>
      </div>
    );
  }

  const total = registros.length;
  const bons = registros.filter((r) => r.level === "GOOD").length;
  const ruins = total - bons;
  const pctBons = Math.round((bons / total) * 100);
  const pctRuins = 100 - pctBons;

  return (
    <div className={styles.container}>
      {/* Resumo */}
      <div className={styles.resumo}>
        <div className={styles.resumoStat}>
          <span className={`${styles.resumoValue} ${styles.valueBom}`}>
            {bons}
          </span>
          <span className={styles.resumoLabel}>Bom</span>
        </div>
        <div className={styles.resumoStat}>
          <span className={`${styles.resumoValue} ${styles.valueRuim}`}>
            {ruins}
          </span>
          <span className={styles.resumoLabel}>Ruim</span>
        </div>
        <div className={styles.resumoBar}>
          <div className={styles.barTrack}>
            <div
              className={styles.barBom}
              style={{ width: `${pctBons}%` }}
              title={`${pctBons}% bom`}
            />
            <div
              className={styles.barRuim}
              style={{ width: `${pctRuins}%` }}
              title={`${pctRuins}% ruim`}
            />
          </div>
          <span className={styles.resumoCaption}>
            últimos {total} {total === 1 ? "registro" : "registros"}
          </span>
        </div>
      </div>

      {/* Lista */}
      <ul className={styles.list}>
        {registros.map((r) => {
          const Icon = r.level === "GOOD" ? Smile : Frown;
          const isBom = r.level === "GOOD";
          return (
            <li key={r.id} className={styles.item}>
              <div
                className={`${styles.iconWrap} ${
                  isBom ? styles.iconBom : styles.iconRuim
                }`}
                aria-hidden="true"
              >
                <Icon size={18} strokeWidth={2} />
              </div>

              <div className={styles.itemBody}>
                <div className={styles.itemHeader}>
                  <span
                    className={`${styles.itemBadge} ${
                      isBom ? styles.badgeBom : styles.badgeRuim
                    }`}
                  >
                    {isBom ? "Bom" : "Ruim"}
                  </span>
                  <span className={styles.itemDate} title={formatarData(r.date)}>
                    {formatarDataLonga(r.date)}
                  </span>
                </div>

                {r.comment ? (
                  <p className={styles.itemComment}>{r.comment}</p>
                ) : (
                  <p className={styles.itemNoComment}>Sem comentário</p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
