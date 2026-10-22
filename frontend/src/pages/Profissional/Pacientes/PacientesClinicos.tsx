import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Search,
  AlertTriangle,
  Smile,
  Frown,
  MinusCircle,
  ChevronRight,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { usePacientes } from "../../../contexts/PacientesContext";
import { api, ApiError } from "../../../services/api";
import { cpfToApi } from "../../../services/adapters";
import { matchesSearch } from "../../../utils/search";
import type { Paciente } from "../../../types/paciente";
import styles from "./PacientesClinicos.module.css";

type NivelAlerta = "ALTO" | "MEDIO" | "BAIXO";

interface UltimoRegistro {
  level: "GOOD" | "BAD";
  date: string;
  comment: string | null;
}

interface LinhaPaciente {
  paciente: Paciente;
  ultimosRegistros: UltimoRegistro[];
  ruinsRecentes: number;
  bonsRecentes: number;
  nivelAlerta: NivelAlerta;
}

const DIAS_RECENTES = 3;

function dataValidaIso(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export function PacientesClinicos() {
  const navigate = useNavigate();
  const { pacientes, loading: loadingPacientes } = usePacientes();

  const [humoresPorCpf, setHumoresPorCpf] = useState<Record<string, UltimoRegistro[]>>({});
  const [loadingHumores, setLoadingHumores] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [filtroAlerta, setFiltroAlerta] = useState<"TODOS" | "ATENCAO">("TODOS");

  const carregarHumores = async () => {
    if (pacientes.length === 0) {
      setLoadingHumores(false);
      return;
    }
    setLoadingHumores(true);
    setErro(null);

    try {
      const resultados = await Promise.all(
        pacientes.map(async (p) => {
          try {
            const data = await api.mood.list(cpfToApi(p.cpf), "DESC");
            const ultimos: UltimoRegistro[] = data.slice(0, DIAS_RECENTES).map((r) => ({
              level: r.level,
              date: r.date,
              comment: r.comment,
            }));
            return { cpf: p.cpf, registros: ultimos };
          } catch (err) {
            if (err instanceof ApiError && err.status === 404) {
              return { cpf: p.cpf, registros: [] as UltimoRegistro[] };
            }
            throw err;
          }
        })
      );

      const mapa: Record<string, UltimoRegistro[]> = {};
      for (const { cpf, registros } of resultados) {
        mapa[cpf] = registros;
      }
      setHumoresPorCpf(mapa);
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : "Erro ao carregar histórico de humor.";
      setErro(msg);
    } finally {
      setLoadingHumores(false);
    }
  };

  useEffect(() => {
    carregarHumores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pacientes.length]);

  const linhas = useMemo<LinhaPaciente[]>(() => {
    return pacientes.map((paciente) => {
      const registros = humoresPorCpf[paciente.cpf] ?? [];
      const ruinsRecentes = registros.filter((r) => r.level === "BAD").length;
      const bonsRecentes = registros.length - ruinsRecentes;

      let nivelAlerta: NivelAlerta = "BAIXO";
      if (ruinsRecentes >= 2) nivelAlerta = "ALTO";
      else if (ruinsRecentes === 1) nivelAlerta = "MEDIO";

      return {
        paciente,
        ultimosRegistros: registros,
        ruinsRecentes,
        bonsRecentes,
        nivelAlerta,
      };
    });
  }, [pacientes, humoresPorCpf]);

  const filtrados = useMemo(() => {
    return linhas
      .filter((l) => {
        if (filtroAlerta === "ATENCAO" && l.nivelAlerta === "BAIXO") return false;
        return matchesSearch(busca, l.paciente.nome, l.paciente.cpf, l.paciente.email);
      })
      .sort((a, b) => {
        const ordem: Record<NivelAlerta, number> = { ALTO: 0, MEDIO: 1, BAIXO: 2 };
        if (ordem[a.nivelAlerta] !== ordem[b.nivelAlerta]) {
          return ordem[a.nivelAlerta] - ordem[b.nivelAlerta];
        }
        return a.paciente.nome.localeCompare(b.paciente.nome, "pt-BR");
      });
  }, [linhas, busca, filtroAlerta]);

  const comAlerta = linhas.filter((l) => l.nivelAlerta === "ALTO").length;
  const comAtencao = linhas.filter((l) => l.nivelAlerta === "MEDIO").length;

  const abrir = (cpf: string) => {
    navigate(`/profissional/pacientes/${encodeURIComponent(cpf)}`);
  };

  return (
    <section className={styles.page}>
      <header className={styles.pageHeader}>
        <div className={styles.pageTitle}>
          <div className={styles.titleIcon}>
            <Users size={22} strokeWidth={2} />
          </div>
          <div>
            <h1 className={styles.title}>Meus pacientes</h1>
            <p className={styles.subtitle}>
              Acompanhe a evolução de humor e identifique riscos recentes.
            </p>
          </div>
        </div>

        <button
          type="button"
          className={styles.refreshButton}
          onClick={carregarHumores}
          disabled={loadingHumores || loadingPacientes}
          title="Recarregar"
        >
          <RefreshCw
            size={16}
            className={
              loadingHumores || loadingPacientes ? styles.spinning : undefined
            }
          />
        </button>
      </header>

      {comAlerta > 0 && (
        <div className={`${styles.alertBanner} ${styles.alertAlto}`} role="alert">
          <AlertTriangle size={18} strokeWidth={2.2} />
          <div>
            <strong>
              {comAlerta}{" "}
              {comAlerta === 1 ? "paciente precisa" : "pacientes precisam"} de
              atenção imediata
            </strong>
            <p>
              Registros de humor ruim consecutivos nos últimos {DIAS_RECENTES} dias.
              Recomenda-se contato ativo.
            </p>
          </div>
        </div>
      )}

      {comAtencao > 0 && comAlerta === 0 && (
        <div className={`${styles.alertBanner} ${styles.alertMedio}`} role="alert">
          <AlertTriangle size={18} strokeWidth={2.2} />
          <div>
            <strong>
              {comAtencao}{" "}
              {comAtencao === 1 ? "paciente com" : "pacientes com"} sinal de atenção
            </strong>
            <p>Registro de humor ruim recente. Vale acompanhar na próxima sessão.</p>
          </div>
        </div>
      )}

      <div className={styles.toolbar}>
        <div className={styles.searchWrapper}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Buscar por nome, CPF ou e-mail"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <div className={styles.filterGroup} role="tablist">
          {(
            [
              ["TODOS", "Todos", linhas.length],
              ["ATENCAO", "Com atenção", comAlerta + comAtencao],
            ] as const
          ).map(([valor, label, count]) => (
            <button
              key={valor}
              type="button"
              role="tab"
              aria-selected={filtroAlerta === valor}
              className={`${styles.filterButton} ${
                filtroAlerta === valor ? styles.filterActive : ""
              }`}
              onClick={() => setFiltroAlerta(valor)}
            >
              {label}
              <span className={styles.filterBadge}>{count}</span>
            </button>
          ))}
        </div>

        <span className={styles.counter}>
          {filtrados.length} {filtrados.length === 1 ? "paciente" : "pacientes"}
        </span>
      </div>

      {erro && (
        <div className={styles.errorBanner} role="alert">
          <AlertCircle size={16} />
          <span>{erro}</span>
          <button type="button" onClick={carregarHumores} className={styles.retryLink}>
            Tentar novamente
          </button>
        </div>
      )}

      <div className={styles.tableWrapper}>
        {loadingPacientes || (loadingHumores && pacientes.length > 0) ? (
          <div className={styles.emptyState}>
            <RefreshCw size={24} className={styles.spinning} />
            <p>Carregando pacientes e histórico de humor...</p>
          </div>
        ) : filtrados.length === 0 ? (
          <div className={styles.emptyState}>
            <MinusCircle size={28} strokeWidth={1.6} />
            <p>
              {busca
                ? `Nenhum paciente encontrado para "${busca}".`
                : filtroAlerta === "ATENCAO"
                ? "Nenhum paciente com sinal de atenção no momento."
                : "Nenhum paciente atribuído a você ainda."}
            </p>
          </div>
        ) : (
          <ul className={styles.list}>
            {filtrados.map(({ paciente, ultimosRegistros, ruinsRecentes, nivelAlerta }) => (
              <li key={paciente.cpf}>
                <button
                  type="button"
                  className={`${styles.row} ${
                    nivelAlerta === "ALTO"
                      ? styles.rowAlto
                      : nivelAlerta === "MEDIO"
                      ? styles.rowMedio
                      : ""
                  }`}
                  onClick={() => abrir(paciente.cpf)}
                >
                  <div className={styles.rowLeft}>
                    <span
                      className={`${styles.avatar} ${
                        nivelAlerta === "ALTO"
                          ? styles.avatarAlto
                          : nivelAlerta === "MEDIO"
                          ? styles.avatarMedio
                          : ""
                      }`}
                    >
                      {paciente.nome
                        .split(" ")
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((n) => n[0]?.toUpperCase())
                        .join("")}
                    </span>
                    <div className={styles.rowInfo}>
                      <span className={styles.rowName}>{paciente.nome}</span>
                      <span className={styles.rowMeta}>CPF {paciente.cpf}</span>
                    </div>
                  </div>

                  <div className={styles.rowMood}>
                    {ultimosRegistros.length > 0 ? (
                      <>
                        <div className={styles.moodDots}>
                          {ultimosRegistros.map((r, i) => (
                            <span
                              key={i}
                              className={`${styles.moodDot} ${
                                r.level === "GOOD"
                                  ? styles.dotBom
                                  : styles.dotRuim
                              }`}
                              title={`${dataValidaIso(r.date)} · ${
                                r.level === "GOOD" ? "Bom" : "Ruim"
                              }`}
                            >
                              {r.level === "GOOD" ? (
                                <Smile size={12} />
                              ) : (
                                <Frown size={12} />
                              )}
                            </span>
                          ))}
                        </div>
                        <span className={styles.moodCaption}>
                          últimos {ultimosRegistros.length}
                        </span>
                      </>
                    ) : (
                      <span className={styles.semRegistro}>Sem registros</span>
                    )}
                  </div>

                  {nivelAlerta === "ALTO" && (
                    <span className={styles.alertaAlto}>
                      <AlertTriangle size={12} aria-hidden="true" />
                      {ruinsRecentes} de {ultimosRegistros.length} ruins
                    </span>
                  )}

                  {nivelAlerta === "MEDIO" && (
                    <span className={styles.alertaMedio}>
                      <AlertTriangle size={12} aria-hidden="true" />
                      {ruinsRecentes} recente
                    </span>
                  )}

                  <ChevronRight
                    size={18}
                    className={styles.rowChevron}
                    aria-hidden="true"
                  />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
