import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  AlertCircle,
  RefreshCw,
  ChevronRight,
  User,
  Calendar,
  MessageSquare,
  ShieldCheck,
  Smile,
  Frown,
  CheckCircle2,
  Undo2,
  Check,
} from "lucide-react";
import { usePacientes } from "../../../contexts/PacientesContext";
import { useAuth } from "../../../contexts/AuthContext";
import { useAlertasReconhecidos } from "../../../contexts/AlertasReconhecidosContext";
import { api, ApiError } from "../../../services/api";
import { cpfToApi } from "../../../services/adapters";
import { matchesSearch } from "../../../utils/search";
import type { Paciente } from "../../../types/paciente";
import styles from "./AlertasPage.module.css";

type Nivel = "CRITICO" | "ATENCAO";
type Aba = "ABERTOS" | "RECONHECIDOS";

interface RegistroHumor {
  id: number;
  level: "GOOD" | "BAD";
  date: string;
  comment: string | null;
}

interface Alerta {
  paciente: Paciente;
  nivel: Nivel;
  registrosRuinsRecentes: RegistroHumor[];
  ultimosRegistros: RegistroHumor[];
  dataPrimeiroRuim: string;
  comentarioRecente: string | null;
}

const JANELA_DIAS = 3;

function formatarData(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function formatarDataHora(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatarDataLonga(iso: string): string {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function calcularNivel(ruinsRecentes: number): Nivel | null {
  if (ruinsRecentes >= 3) return "CRITICO";
  if (ruinsRecentes === 2) return "ATENCAO";
  return null;
}

export function AlertasPage() {
  const navigate = useNavigate();
  const { pacientes, loading: loadingPacientes } = usePacientes();
  const { usuario } = useAuth();
  const { reconhecidos, isReconhecido, getReconhecido, reconhecer, reabrir } =
    useAlertasReconhecidos();

  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [aba, setAba] = useState<Aba>("ABERTOS");
  const [filtro, setFiltro] = useState<"TODOS" | "CRITICO" | "ATENCAO">("TODOS");

  const carregar = async () => {
    if (pacientes.length === 0) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setErro(null);

    try {
      const resultados = await Promise.all(
        pacientes.map(async (paciente) => {
          try {
            const registros = await api.mood.list(cpfToApi(paciente.cpf), "DESC");
            const ultimos: RegistroHumor[] = registros
              .slice(0, JANELA_DIAS)
              .map((r) => ({
                id: r.id,
                level: r.level,
                date: r.date,
                comment: r.comment,
              }));
            const ruins = ultimos.filter((r) => r.level === "BAD");
            const nivel = calcularNivel(ruins.length);

            if (!nivel) return null;

            const dataPrimeiroRuim =
              ruins[ruins.length - 1]?.date ?? ultimos[0]?.date ?? "";
            const comentarioRecente =
              ruins.find((r) => r.comment)?.comment ?? null;

            return {
              paciente,
              nivel,
              registrosRuinsRecentes: ruins,
              ultimosRegistros: ultimos,
              dataPrimeiroRuim,
              comentarioRecente,
            } as Alerta;
          } catch (err) {
            if (err instanceof ApiError && err.status === 404) return null;
            throw err;
          }
        })
      );

      const validos = resultados.filter((a): a is Alerta => a !== null);
      validos.sort((a, b) => {
        const ordem: Record<Nivel, number> = { CRITICO: 0, ATENCAO: 1 };
        if (ordem[a.nivel] !== ordem[b.nivel]) return ordem[a.nivel] - ordem[b.nivel];
        return b.dataPrimeiroRuim.localeCompare(a.dataPrimeiroRuim);
      });

      setAlertas(validos);
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : "Erro ao carregar alertas.";
      setErro(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pacientes.length]);

  const abertos = useMemo(
    () => alertas.filter((a) => !isReconhecido(a.paciente.cpf)),
    [alertas, isReconhecido]
  );

  const reconhecidosLista = useMemo(
    () => alertas.filter((a) => isReconhecido(a.paciente.cpf)),
    [alertas, isReconhecido]
  );

  const fonteAtual = aba === "ABERTOS" ? abertos : reconhecidosLista;

  const filtrados = useMemo(() => {
    return fonteAtual.filter((a) => {
      if (filtro !== "TODOS" && a.nivel !== filtro) return false;
      return matchesSearch(busca, a.paciente.nome, a.paciente.cpf, a.paciente.email);
    });
  }, [fonteAtual, busca, filtro]);

  const totalCriticos = abertos.filter((a) => a.nivel === "CRITICO").length;
  const totalAtencao = abertos.filter((a) => a.nivel === "ATENCAO").length;

  const handleReconhecer = (cpf: string) => {
    reconhecer(cpf, usuario?.nome ?? "Profissional");
  };

  const handleReabrir = (cpf: string) => {
    reabrir(cpf);
  };

  const abrirProntuario = (cpf: string) => {
    navigate(`/profissional/pacientes/${encodeURIComponent(cpf)}`);
  };

  return (
    <section className={styles.page}>
      <header className={styles.pageHeader}>
        <div className={styles.pageTitle}>
          <div className={styles.titleIcon}>
            <AlertTriangle size={22} strokeWidth={2} />
          </div>
          <div>
            <h1 className={styles.title}>Alertas de risco</h1>
            <p className={styles.subtitle}>
              Pacientes com sinais de declínio no humor nos últimos {JANELA_DIAS} dias.
            </p>
          </div>
        </div>

        <button
          type="button"
          className={styles.refreshButton}
          onClick={carregar}
          disabled={loading || loadingPacientes}
          title="Recarregar"
        >
          <RefreshCw
            size={16}
            className={loading || loadingPacientes ? styles.spinning : undefined}
          />
        </button>
      </header>

      {/* ----- Stats ----- */}
      <div className={styles.stats}>
        <button
          type="button"
          className={`${styles.statCard} ${styles.statCritico} ${
            filtro === "CRITICO" ? styles.statActive : ""
          }`}
          onClick={() => setFiltro((f) => (f === "CRITICO" ? "TODOS" : "CRITICO"))}
        >
          <span className={styles.statValue}>{totalCriticos}</span>
          <span className={styles.statLabel}>Crítico</span>
          <span className={styles.statHint}>3 ou mais dias ruins</span>
        </button>

        <button
          type="button"
          className={`${styles.statCard} ${styles.statAtencao} ${
            filtro === "ATENCAO" ? styles.statActive : ""
          }`}
          onClick={() => setFiltro((f) => (f === "ATENCAO" ? "TODOS" : "ATENCAO"))}
        >
          <span className={styles.statValue}>{totalAtencao}</span>
          <span className={styles.statLabel}>Atenção</span>
          <span className={styles.statHint}>2 dias ruins recentes</span>
        </button>

        <div className={`${styles.statCard} ${styles.statTotal}`}>
          <span className={styles.statValue}>{reconhecidos.length}</span>
          <span className={styles.statLabel}>Reconhecidos</span>
          <span className={styles.statHint}>total histórico</span>
        </div>
      </div>

      {/* ----- Abas ----- */}
      <nav className={styles.tabs} role="tablist">
        {(
          [
            ["ABERTOS", "Abertos", abertos.length],
            ["RECONHECIDOS", "Reconhecidos", reconhecidosLista.length],
          ] as const
        ).map(([valor, label, count]) => (
          <button
            key={valor}
            type="button"
            role="tab"
            aria-selected={aba === valor}
            className={`${styles.tab} ${aba === valor ? styles.tabActive : ""}`}
            onClick={() => setAba(valor)}
          >
            {label}
            <span className={styles.tabBadge}>{count}</span>
          </button>
        ))}
      </nav>

      {/* ----- Busca ----- */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrapper}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Buscar por nome, CPF ou e-mail"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        {filtro !== "TODOS" && (
          <button
            type="button"
            className={styles.clearButton}
            onClick={() => setFiltro("TODOS")}
          >
            Limpar filtro
          </button>
        )}

        <span className={styles.counter}>
          {filtrados.length} {filtrados.length === 1 ? "alerta" : "alertas"}
        </span>
      </div>

      {/* ----- Lista ----- */}
      {loading || loadingPacientes ? (
        <div className={styles.emptyState}>
          <RefreshCw size={24} className={styles.spinning} />
          <p>Analisando humor dos pacientes...</p>
        </div>
      ) : erro ? (
        <div className={styles.emptyState}>
          <AlertCircle size={28} strokeWidth={1.6} />
          <p>{erro}</p>
          <button type="button" className={styles.retryButton} onClick={carregar}>
            Tentar novamente
          </button>
        </div>
      ) : filtrados.length === 0 ? (
        <div className={styles.emptyState}>
          <ShieldCheck size={40} strokeWidth={1.4} />
          <h2 className={styles.emptyTitle}>
            {aba === "ABERTOS"
              ? alertas.length === 0
                ? "Nenhum alerta no momento"
                : "Nenhum alerta aberto"
              : "Nenhum alerta reconhecido ainda"}
          </h2>
          <p className={styles.emptyText}>
            {aba === "ABERTOS"
              ? alertas.length === 0
                ? "Todos os seus pacientes estão com registros de humor estáveis."
                : "Todos os alertas foram reconhecidos."
              : "Quando você marcar um alerta como reconhecido, ele aparece aqui."}
          </p>
        </div>
      ) : (
        <ul className={styles.list}>
          {filtrados.map((alerta) => {
            const isCritico = alerta.nivel === "CRITICO";
            const reconhecido = getReconhecido(alerta.paciente.cpf);
            return (
              <li key={alerta.paciente.cpf}>
                <div
                  className={`${styles.alertCard} ${
                    reconhecido
                      ? styles.cardReconhecido
                      : isCritico
                      ? styles.cardCritico
                      : styles.cardAtencao
                  }`}
                >
                  <div className={styles.cardHeader}>
                    <div
                      className={`${styles.alertIcon} ${
                        reconhecido
                          ? styles.iconReconhecido
                          : isCritico
                          ? styles.iconCritico
                          : styles.iconAtencao
                      }`}
                      aria-hidden="true"
                    >
                      {reconhecido ? (
                        <CheckCircle2 size={20} />
                      ) : (
                        <AlertTriangle size={20} />
                      )}
                    </div>

                    <div className={styles.cardTitles}>
                      <div className={styles.cardTitleRow}>
                        {!reconhecido && (
                          <span
                            className={`${styles.badge} ${
                              isCritico ? styles.badgeCritico : styles.badgeAtencao
                            }`}
                          >
                            {isCritico ? "Crítico" : "Atenção"}
                          </span>
                        )}
                        {reconhecido && (
                          <span className={styles.badgeReconhecido}>
                            Reconhecido em {formatarDataHora(reconhecido.reconhecidoEm)}
                          </span>
                        )}
                        <span className={styles.cardDate}>
                          <Calendar size={12} />
                          Desde {formatarData(alerta.dataPrimeiroRuim)}
                        </span>
                      </div>
                      <span className={styles.cardPatient}>
                        <User size={14} />
                        {alerta.paciente.nome}
                      </span>
                      <span className={styles.cardCpf}>CPF {alerta.paciente.cpf}</span>
                    </div>

                    <div className={styles.cardActions}>
                      {!reconhecido && (
                        <button
                          type="button"
                          className={styles.reconhecerButton}
                          onClick={() => handleReconhecer(alerta.paciente.cpf)}
                          title="Marcar alerta como reconhecido"
                        >
                          <Check size={16} />
                          Reconhecer
                        </button>
                      )}
                      {reconhecido && (
                        <button
                          type="button"
                          className={styles.reabrirButton}
                          onClick={() => handleReabrir(alerta.paciente.cpf)}
                          title="Reabrir este alerta"
                        >
                          <Undo2 size={16} />
                          Reabrir
                        </button>
                      )}
                      <button
                        type="button"
                        className={styles.openButton}
                        onClick={() => abrirProntuario(alerta.paciente.cpf)}
                      >
                        Abrir prontuário
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>

                  <div className={styles.historyRow}>
                    <span className={styles.historyLabel}>
                      Últimos {alerta.ultimosRegistros.length}
                    </span>
                    <div className={styles.dots}>
                      {alerta.ultimosRegistros.map((r) => (
                        <span
                          key={r.id}
                          className={`${styles.dot} ${
                            r.level === "GOOD" ? styles.dotBom : styles.dotRuim
                          }`}
                          title={`${formatarData(r.date)} — ${
                            r.level === "GOOD" ? "Bom" : "Ruim"
                          }`}
                        >
                          {r.level === "GOOD" ? <Smile size={14} /> : <Frown size={14} />}
                        </span>
                      ))}
                    </div>
                    <span className={styles.historySummary}>
                      <strong>{alerta.registrosRuinsRecentes.length}</strong>{" "}
                      {alerta.registrosRuinsRecentes.length === 1 ? "dia ruim" : "dias ruins"}
                    </span>
                  </div>

                  {alerta.comentarioRecente && (
                    <div className={styles.commentRow}>
                      <MessageSquare size={14} className={styles.commentIcon} />
                      <p className={styles.commentText}>{alerta.comentarioRecente}</p>
                    </div>
                  )}

                  <div className={styles.ruinsRow}>
                    <span className={styles.ruinsLabel}>Dias ruins:</span>
                    <div className={styles.ruinsList}>
                      {alerta.registrosRuinsRecentes.map((r) => (
                        <span key={r.id} className={styles.ruinDate}>
                          {formatarDataLonga(r.date)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
