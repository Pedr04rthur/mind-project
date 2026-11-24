import { useEffect, useState } from "react";

import {
  ShieldCheck,
  Search,
  RefreshCw,
  Database,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  FileSearch,
  Filter,
  X,
  Lock,
} from "lucide-react";

import { auditoriaApi } from "../../../services/api";

import type {
  FiltrosAuditoria,
  PaginaAuditoria,
} from "../../../types/auditoria";

import styles from "./AuditoriaPage.module.css";

const FILTROS_INICIAIS: FiltrosAuditoria = {
  cpf: "",
  tabela: "",
  inicio: "",
  fim: "",
  page: 0,
  size: 10,
};

const TABELAS: Record<string, string> = {
  patients: "Pacientes",
  professionals: "Profissionais",
  moods: "Registros de humor",
  consultations: "Consultas",
  prescriptions: "Prescrições",
};

function formatarCPF(cpf: string | null) {
  if (!cpf) return "—";

  return cpf.replace(
    /(\d{3})(\d{3})(\d{3})(\d{2})/,
    "$1.$2.$3-$4"
  );
}

function formatarData(data: string) {
  return new Date(data).toLocaleString("pt-BR");
}

export function AuditoriaPage() {
  const [form, setForm] =
    useState<FiltrosAuditoria>(FILTROS_INICIAIS);

  const [filtros, setFiltros] =
    useState<FiltrosAuditoria>(FILTROS_INICIAIS);

  const [dados, setDados] =
    useState<PaginaAuditoria | null>(null);

  const [loading, setLoading] = useState(true);

  const [erro, setErro] =
    useState<string | null>(null);

  const [versao, setVersao] = useState(0);

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      setLoading(true);
      setErro(null);
      setDados(null);

      try {
        const resultado =
          await auditoriaApi.listar(filtros);

        if (ativo) setDados(resultado);

      } catch (err) {
        if (!ativo) return;

        setErro(
          err instanceof Error
            ? err.message
            : "Não foi possível consultar a auditoria."
        );

      } finally {
        if (ativo) setLoading(false);
      }
    }

    void carregar();

    return () => {
      ativo = false;
    };
  }, [filtros, versao]);

  function pesquisar() {
    if (
      form.inicio &&
      form.fim &&
      form.inicio > form.fim
    ) {
      setErro("A data inicial deve ser anterior à final.");
      return;
    }

    setFiltros({
      ...form,
      cpf: form.cpf?.replace(/\D/g, ""),
      page: 0,
    });
  }

  function limpar() {
    setForm({ ...FILTROS_INICIAIS });
    setFiltros({ ...FILTROS_INICIAIS });
  }

  function mudarPagina(page: number) {
    setFiltros((anterior) => ({
      ...anterior,
      page,
    }));
  }

  const registros = dados?.content ?? [];
  const pagina = dados?.number ?? 0;
  const totalPaginas = dados?.totalPages ?? 0;

  return (
    <main className={styles.page}>

      <header className={styles.header}>
        <div className={styles.heading}>
          <div className={styles.titleIcon}>
            <ShieldCheck size={27} />
          </div>

          <div>
            <h1>Auditoria LGPD</h1>
            <p>
              Rastreabilidade das exclusões de dados do MindCare.
            </p>
          </div>
        </div>

        <button
          className={styles.secondaryButton}
          onClick={() => setVersao((v) => v + 1)}
          disabled={loading}
        >
          <RefreshCw size={16} />
          Atualizar
        </button>
      </header>

      <div className={styles.stats}>

        <article className={styles.stat}>
          <div className={styles.statIcon}>
            <Database size={22} />
          </div>

          <div>
            <span>Exclusões encontradas</span>
            <strong>{dados?.totalElements ?? "—"}</strong>
          </div>
        </article>

        <article className={styles.stat}>
          <div className={styles.statIcon}>
            <FileSearch size={22} />
          </div>

          <div>
            <span>Registros nesta página</span>
            <strong>{dados ? registros.length : "—"}</strong>
          </div>
        </article>

        <article className={styles.stat}>
          <div className={styles.statIcon}>
            <Lock size={22} />
          </div>

          <div>
            <span>Permissão de acesso</span>
            <strong className={styles.smallValue}>
              Recepção
            </strong>
          </div>
        </article>

      </div>

      <section className={styles.notice}>
        <ShieldCheck size={22} />

        <div>
          <strong>Registro de exclusões</strong>
          <p>
            Os dados excluídos são registrados no backend
            em formato JSON. Esta tela apresenta os
            metadados necessários para rastreabilidade,
            sem expor o conteúdo sensível dos snapshots.
          </p>
        </div>
      </section>

      <section className={styles.panel}>

        <h2>
          <Filter size={18} />
          Filtros de auditoria
        </h2>

        <div className={styles.filters}>

          <label>
            CPF afetado

            <input
              placeholder="000.000.000-00"
              value={form.cpf ?? ""}
              maxLength={14}
              onChange={(e) =>
                setForm({
                  ...form,
                  cpf: e.target.value,
                })
              }
            />
          </label>

          <label>
            Entidade

            <select
              value={form.tabela ?? ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  tabela: e.target.value,
                })
              }
            >
              <option value="">Todas</option>
              <option value="patients">Pacientes</option>
              <option value="professionals">
                Profissionais
              </option>
            </select>
          </label>

          <label>
            Data inicial

            <input
              type="date"
              value={form.inicio ?? ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  inicio: e.target.value,
                })
              }
            />
          </label>

          <label>
            Data final

            <input
              type="date"
              value={form.fim ?? ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  fim: e.target.value,
                })
              }
            />
          </label>

        </div>

        <div className={styles.actions}>
          <button
            className={styles.secondaryButton}
            onClick={limpar}
          >
            <X size={16} />
            Limpar
          </button>

          <button
            className={styles.primaryButton}
            onClick={pesquisar}
            disabled={loading}
          >
            <Search size={16} />
            Pesquisar
          </button>
        </div>

      </section>

      {erro && (
        <div className={styles.error}>
          <AlertCircle size={19} />
          {erro}
        </div>
      )}

      <section className={styles.panel}>

        <div className={styles.tableHeading}>
          <h2>Histórico de exclusões</h2>

          <span>
            {dados?.totalElements ?? 0} registros
          </span>
        </div>

        {loading ? (
          <div className={styles.empty}>
            <RefreshCw size={30} />
            <p>Carregando registros...</p>
          </div>
        ) : registros.length === 0 ? (
          <div className={styles.empty}>
            <FileSearch size={42} />

            <h3>Nenhum registro encontrado</h3>

            <p>
              {erro
                ? "Não foi possível confirmar os registros."
                : "Não existem exclusões para os filtros selecionados."}
            </p>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>

              <thead>
                <tr>
                  <th>ID</th>
                  <th>Entidade</th>
                  <th>Registro</th>
                  <th>CPF afetado</th>
                  <th>Responsável</th>
                  <th>Data e horário</th>
                  <th>Operação</th>
                </tr>
              </thead>

              <tbody>
                {registros.map((log) => (
                  <tr key={log.id}>

                    <td>#{log.id}</td>

                    <td>
                      <strong>
                        {TABELAS[log.tabelaAfetada]
                          ?? log.tabelaAfetada}
                      </strong>
                    </td>

                    <td>#{log.registroId}</td>

                    <td>{formatarCPF(log.cpfAfetado)}</td>

                    <td>{log.responsavel}</td>

                    <td>{formatarData(log.dataExclusao)}</td>

                    <td>
                      <span className={styles.badge}>
                        Exclusão
                      </span>
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}

        <footer className={styles.pagination}>

          <span>
            Página {totalPaginas ? pagina + 1 : 0}
            {" de "}
            {totalPaginas}
          </span>

          <div>
            <button
              className={styles.secondaryButton}
              disabled={loading || pagina === 0}
              onClick={() => mudarPagina(pagina - 1)}
            >
              <ChevronLeft size={16} />
              Anterior
            </button>

            <button
              className={styles.secondaryButton}
              disabled={
                loading || pagina + 1 >= totalPaginas
              }
              onClick={() => mudarPagina(pagina + 1)}
            >
              Próxima
              <ChevronRight size={16} />
            </button>
          </div>

        </footer>

      </section>

    </main>
  );
}
