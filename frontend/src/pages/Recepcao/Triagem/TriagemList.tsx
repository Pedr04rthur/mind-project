import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ClipboardCheck,
  Search,
  AlertTriangle,
  Flag,
  ArrowDown,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { TriagemModal } from "./TriagemModal";
import { usePacientes } from "../../../contexts/PacientesContext";
import { useTriagens } from "../../../contexts/TriagensContext";
import { normalizeText } from "../../../utils/search";
import type { Paciente, Prioridade } from "../../../types/paciente";
import type { Triagem } from "../../../types/triagem";
import styles from "./TriagemList.module.css";

type Aba = "AGUARDANDO" | "TRIADOS" | "TODOS";

interface Linha {
  paciente: Paciente;
  triagem: Triagem | null;
}

export function TriagemList() {
  const navigate = useNavigate();
  const { pacientes, loading: loadingPacientes, refresh: refreshPacientes } =
    usePacientes();
  const { getByCpf, salvar, triagens } = useTriagens();

  const [busca, setBusca] = useState("");
  const [aba, setAba] = useState<Aba>("AGUARDANDO");
  const [pacienteSelecionado, setPacienteSelecionado] = useState<Paciente | null>(
    null
  );

  const linhas = useMemo<Linha[]>(() => {
    return pacientes
      .map((p) => ({ paciente: p, triagem: getByCpf(p.cpf) ?? null }))
      .filter((l) => {
        const termo = normalizeText(busca);
        if (!termo) return true;
        return (
          normalizeText(l.paciente.nome).includes(termo) ||
          l.paciente.cpf.includes(busca) ||
          normalizeText(l.paciente.email).includes(termo)
        );
      });
  }, [pacientes, busca, getByCpf, triagens]);

  const aguardando = linhas
    .filter((l) => l.triagem === null)
    .sort((a, b) => a.paciente.nome.localeCompare(b.paciente.nome, "pt-BR"));

  const triados = linhas
    .filter((l) => l.triagem !== null)
    .sort((a, b) => {
      const ordem: Record<Prioridade, number> = { ALTA: 0, MEDIA: 1, BAIXA: 2 };
      const pa = a.triagem?.prioridade ?? "BAIXA";
      const pb = b.triagem?.prioridade ?? "BAIXA";
      if (ordem[pa] !== ordem[pb]) return ordem[pa] - ordem[pb];
      return a.paciente.nome.localeCompare(b.paciente.nome, "pt-BR");
    });

  const altaPrioridade = triados.filter(
    (l) => l.triagem?.prioridade === "ALTA"
  ).length;

  const listaAtual =
    aba === "AGUARDANDO" ? aguardando : aba === "TRIADOS" ? triados : linhas;

  const handleSalvarTriagem = (prioridade: Prioridade, observacao: string) => {
    if (!pacienteSelecionado) return;
    salvar(pacienteSelecionado.cpf, prioridade, observacao);
    setPacienteSelecionado(null);
  };

  return (
    <section className={styles.page}>
      <header className={styles.pageHeader}>
        <div className={styles.pageTitle}>
          <div className={styles.titleIcon}>
            <ClipboardCheck size={22} strokeWidth={2} />
          </div>
          <div>
            <h1 className={styles.title}>Triagem</h1>
            <p className={styles.subtitle}>
              Acolhimento inicial e priorização dos pacientes da clínica.
            </p>
          </div>
        </div>

        <button
          type="button"
          className={styles.refreshButton}
          onClick={refreshPacientes}
          disabled={loadingPacientes}
          title="Recarregar pacientes"
        >
          <RefreshCw
            size={16}
            className={loadingPacientes ? styles.spinning : undefined}
          />
        </button>
      </header>

      {altaPrioridade > 0 && (
        <div className={styles.alertBanner} role="alert">
          <AlertTriangle size={18} strokeWidth={2.2} />
          <div>
            <strong>
              {altaPrioridade}{" "}
              {altaPrioridade === 1
                ? "paciente com prioridade alta"
                : "pacientes com prioridade alta"}
            </strong>
            <p>Recomenda-se encaminhamento imediato para atendimento.</p>
          </div>
        </div>
      )}

      <div className={styles.stats}>
        <div className={`${styles.statCard} ${styles.statAguardando}`}>
          <span className={styles.statValue}>{aguardando.length}</span>
          <span className={styles.statLabel}>Aguardando triagem</span>
        </div>
        <div className={`${styles.statCard} ${styles.statTriados}`}>
          <span className={styles.statValue}>{triados.length}</span>
          <span className={styles.statLabel}>Já triados</span>
        </div>
        <div className={`${styles.statCard} ${styles.statAlta}`}>
          <span className={styles.statValue}>{altaPrioridade}</span>
          <span className={styles.statLabel}>Prioridade alta</span>
        </div>
      </div>

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

        <nav className={styles.tabs} role="tablist">
          {(
            [
              ["AGUARDANDO", "Aguardando", aguardando.length],
              ["TRIADOS", "Triados", triados.length],
              ["TODOS", "Todos", linhas.length],
            ] as const
          ).map(([valor, label, count]) => (
            <button
              key={valor}
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
      </div>

      {loadingPacientes && pacientes.length === 0 ? (
        <div className={styles.emptyState}>
          <RefreshCw size={24} className={styles.spinning} />
          <p>Carregando pacientes...</p>
        </div>
      ) : listaAtual.length === 0 ? (
        <div className={styles.emptyState}>
          {aba === "AGUARDANDO" ? (
            <>
              <CheckCircle2 size={28} strokeWidth={1.6} />
              <p>Nenhum paciente aguardando triagem.</p>
              <span className={styles.emptyHint}>
                Todos os pacientes cadastrados já foram triados.
              </span>
            </>
          ) : aba === "TRIADOS" ? (
            <>
              <AlertCircle size={28} strokeWidth={1.6} />
              <p>Nenhum paciente foi triado ainda.</p>
            </>
          ) : (
            <>
              <AlertCircle size={28} strokeWidth={1.6} />
              <p>Nenhum paciente cadastrado.</p>
              <button
                type="button"
                className={styles.emptyCta}
                onClick={() => navigate("/recepcao/pacientes")}
              >
                Ir para cadastro de pacientes
              </button>
            </>
          )}
        </div>
      ) : (
        <ul className={styles.list}>
          {listaAtual.map(({ paciente, triagem }) => (
            <li key={paciente.cpf}>
              <button
                type="button"
                className={`${styles.row} ${
                  triagem?.prioridade === "ALTA" ? styles.rowAlta : ""
                }`}
                onClick={() => setPacienteSelecionado(paciente)}
              >
                <span
                  className={`${styles.avatar} ${
                    triagem?.prioridade === "ALTA"
                      ? styles.avatarAlta
                      : triagem?.prioridade === "MEDIA"
                      ? styles.avatarMedia
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

                <div className={styles.info}>
                  <span className={styles.nome}>{paciente.nome}</span>
                  <span className={styles.meta}>
                    CPF {paciente.cpf}
                    {paciente.telefone ? ` · ${paciente.telefone}` : ""}
                  </span>
                  {triagem?.observacao && (
                    <span className={styles.observacao}>
                      {triagem.observacao}
                    </span>
                  )}
                </div>

                <div className={styles.status}>
                  {triagem ? (
                    <span
                      className={`${styles.badge} ${
                        triagem.prioridade === "ALTA"
                          ? styles.badgeAlta
                          : triagem.prioridade === "MEDIA"
                          ? styles.badgeMedia
                          : styles.badgeBaixa
                      }`}
                    >
                      {triagem.prioridade === "ALTA" ? (
                        <AlertTriangle size={12} aria-hidden="true" />
                      ) : triagem.prioridade === "MEDIA" ? (
                        <Flag size={12} aria-hidden="true" />
                      ) : (
                        <ArrowDown size={12} aria-hidden="true" />
                      )}
                      {triagem.prioridade === "ALTA"
                        ? "Alta"
                        : triagem.prioridade === "MEDIA"
                        ? "Média"
                        : "Baixa"}
                    </span>
                  ) : (
                    <span className={styles.badgeAguardando}>
                      Aguardando triagem
                    </span>
                  )}
                </div>

                <ChevronRight
                  size={18}
                  className={styles.chevron}
                  aria-hidden="true"
                />
              </button>
            </li>
          ))}
        </ul>
      )}

      {pacienteSelecionado && (
        <TriagemModal
          paciente={pacienteSelecionado}
          triagemAtual={getByCpf(pacienteSelecionado.cpf) ?? null}
          onClose={() => setPacienteSelecionado(null)}
          onSave={handleSalvarTriagem}
        />
      )}
    </section>
  );
}
