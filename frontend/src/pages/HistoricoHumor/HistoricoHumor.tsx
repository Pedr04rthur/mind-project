import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Smile,
  Frown,
  MessageSquare,
  AlertCircle,
  RefreshCw,
  CalendarRange,
  TrendingUp,
  Plus,
} from "lucide-react";
import { api, ApiError } from "../../services/api";
import { cpfToApi } from "../../services/adapters";
import { useAuth } from "../../contexts/AuthContext";
import styles from "./HistoricoHumor.module.css";

export interface HumorRegistro {
  id: number;
  level: "GOOD" | "BAD";
  date: string; // YYYY-MM-DD
  comment: string | null;
}

function formatarData(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function formatarDataLonga(iso: string): string {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function nomeDoMes(iso: string): string {
  const d = new Date(iso + "T12:00:00");
  const mes = d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  return mes.charAt(0).toUpperCase() + mes.slice(1);
}

function agruparPorMes(
  registros: HumorRegistro[]
): Record<string, HumorRegistro[]> {
  return registros.reduce((acc, r) => {
    const mes = r.date.slice(0, 7);
    if (!acc[mes]) acc[mes] = [];
    acc[mes].push(r);
    return acc;
  }, {} as Record<string, HumorRegistro[]>);
}

export function HistoricoHumor() {
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const [registros, setRegistros] = useState<HumorRegistro[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [de, setDe] = useState("");
  const [ate, setAte] = useState("");

  const carregar = async () => {
    if (!usuario?.cpf) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setErro(null);
    try {
      const data = await api.mood.list(cpfToApi(usuario.cpf), "DESC");
      setRegistros(data);
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.status === 404
            ? "Paciente não encontrado."
            : err.message
          : "Erro ao carregar histórico.";
      setErro(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario?.cpf]);

  const filtrados = useMemo(() => {
    return registros.filter((r) => {
      if (de && r.date < de) return false;
      if (ate && r.date > ate) return false;
      return true;
    });
  }, [registros, de, ate]);

  const agrupados = useMemo(() => agruparPorMes(filtrados), [filtrados]);
  const meses = Object.keys(agrupados).sort().reverse();

  const total = filtrados.length;
  const bons = filtrados.filter((r) => r.level === "GOOD").length;
  const ruins = total - bons;
  const pctBons = total > 0 ? Math.round((bons / total) * 100) : 0;
  const pctRuins = total > 0 ? 100 - pctBons : 0;

  const limparFiltros = () => {
    setDe("");
    setAte("");
  };

  const temFiltro = de !== "" || ate !== "";

  return (
    <section className={styles.page}>
      <button
        type="button"
        className={styles.backButton}
        onClick={() => navigate("/diario")}
      >
        <ArrowLeft size={16} />
        <span>Voltar ao diário</span>
      </button>

      <header className={styles.pageHeader}>
        <div className={styles.pageTitle}>
          <div className={styles.titleIcon}>
            <TrendingUp size={22} strokeWidth={2} />
          </div>
          <div>
            <h1 className={styles.title}>Meu histórico de humor</h1>
            <p className={styles.subtitle}>
              Acompanhe a evolução do seu bem-estar ao longo do tempo.
            </p>
          </div>
        </div>

        <button
          type="button"
          className={styles.primaryButton}
          onClick={() => navigate("/diario")}
        >
          <Plus size={18} strokeWidth={2.2} />
          <span>Registrar hoje</span>
        </button>
      </header>

      {/* ----- Resumo ----- */}
      {total > 0 && (
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
              {total} {total === 1 ? "registro" : "registros"} no total
            </span>
          </div>
        </div>
      )}

      {/* ----- Filtros ----- */}
      <div className={styles.filterCard}>
        <div className={styles.filterGroup}>
          <div className={styles.dateField}>
            <label className={styles.dateLabel} htmlFor="de">
              De
            </label>
            <div className={styles.inputWrapper}>
              <CalendarRange size={16} className={styles.inputIcon} />
              <input
                id="de"
                type="date"
                className={styles.dateInput}
                value={de}
                max={ate || undefined}
                onChange={(e) => setDe(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.dateField}>
            <label className={styles.dateLabel} htmlFor="ate">
              Até
            </label>
            <div className={styles.inputWrapper}>
              <CalendarRange size={16} className={styles.inputIcon} />
              <input
                id="ate"
                type="date"
                className={styles.dateInput}
                value={ate}
                min={de || undefined}
                onChange={(e) => setAte(e.target.value)}
              />
            </div>
          </div>

          <button
            type="button"
            className={styles.refreshButton}
            onClick={carregar}
            disabled={loading}
            title="Recarregar"
          >
            <RefreshCw
              size={16}
              className={loading ? styles.spinning : undefined}
            />
          </button>

          {temFiltro && (
            <button
              type="button"
              className={styles.clearButton}
              onClick={limparFiltros}
            >
              Limpar
            </button>
          )}
        </div>
      </div>

      {/* ----- Timeline ----- */}
      {loading && registros.length === 0 ? (
        <div className={styles.state}>
          <RefreshCw size={24} className={styles.spinning} />
          <p>Carregando histórico...</p>
        </div>
      ) : erro ? (
        <div className={styles.state}>
          <AlertCircle size={28} strokeWidth={1.6} />
          <p>{erro}</p>
          <button type="button" className={styles.retryButton} onClick={carregar}>
            Tentar novamente
          </button>
        </div>
      ) : filtrados.length === 0 ? (
        <div className={styles.state}>
          <MessageSquare size={32} strokeWidth={1.6} />
          <h2 className={styles.stateTitle}>
            {temFiltro
              ? "Nenhum registro no período"
              : "Nenhum registro de humor ainda"}
          </h2>
          <p className={styles.stateText}>
            {temFiltro
              ? "Ajuste o filtro de período ou limpe os filtros."
              : "Comece registrando seu humor hoje no diário."}
          </p>
          {!temFiltro && (
            <button
              type="button"
              className={styles.primaryButton}
              onClick={() => navigate("/diario")}
            >
              <Plus size={16} />
              Ir para o diário
            </button>
          )}
        </div>
      ) : (
        <div className={styles.timeline}>
          {meses.map((mes) => {
            const registrosDoMes = agrupados[mes];
            return (
              <section key={mes} className={styles.mesGroup}>
                <header className={styles.mesHeader}>
                  <span className={styles.mesLabel}>
                    {nomeDoMes(registrosDoMes[0].date)}
                  </span>
                  <span className={styles.mesCount}>
                    {registrosDoMes.length}{" "}
                    {registrosDoMes.length === 1 ? "registro" : "registros"}
                  </span>
                </header>

                <ul className={styles.mesList}>
                  {registrosDoMes.map((r) => {
                    const isBom = r.level === "GOOD";
                    const Icon = isBom ? Smile : Frown;
                    const dataLonga = formatarDataLonga(r.date);
                    const diaDaSemana = dataLonga.split(",")[0];

                    return (
                      <li key={r.id} className={styles.item}>
                        <div className={styles.itemLine} aria-hidden="true">
                          <span
                            className={`${styles.dot} ${
                              isBom ? styles.dotBom : styles.dotRuim
                            }`}
                          />
                          <span className={styles.line} />
                        </div>

                        <div className={styles.itemCard}>
                          <div className={styles.itemHeader}>
                            <div
                              className={`${styles.iconWrap} ${
                                isBom ? styles.iconBom : styles.iconRuim
                              }`}
                              aria-hidden="true"
                            >
                              <Icon size={20} strokeWidth={2} />
                            </div>
                            <div className={styles.itemTitles}>
                              <span
                                className={`${styles.itemBadge} ${
                                  isBom ? styles.badgeBom : styles.badgeRuim
                                }`}
                              >
                                {isBom ? "Bom" : "Ruim"}
                              </span>
                              <span className={styles.itemDate}>
                                {formatarData(r.date)}{" "}
                                <span className={styles.itemWeekday}>
                                  · {diaDaSemana}
                                </span>
                              </span>
                            </div>
                          </div>

                          {r.comment ? (
                            <p className={styles.itemComment}>{r.comment}</p>
                          ) : (
                            <p className={styles.itemNoComment}>
                              Sem comentário
                            </p>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </section>
  );
}
