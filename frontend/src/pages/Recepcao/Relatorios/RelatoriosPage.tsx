import { useEffect, useState } from "react";
import {
  BarChart3,
  Users,
  CalendarDays,
  TrendingUp,
  RefreshCw,
  AlertCircle,
  Search,
} from "lucide-react";

import { api } from "../../../services/api";
import type { ConsultationByProfessionalApi } from "../../../services/api";
import styles from "./RelatoriosPage.module.css";

export function RelatoriosPage() {
  const [dados, setDados] = useState<ConsultationByProfessionalApi[]>([]);
  const [dataInicial, setDataInicial] = useState("");
  const [dataFinal, setDataFinal] = useState("");
  const [periodo, setPeriodo] = useState({ inicio: "", fim: "" });
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [versao, setVersao] = useState(0);

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      setCarregando(true);
      setErro("");
      setDados([]);

      try {
        const resultado = await api.reports.consultationsByProfessional(
          periodo.inicio,
          periodo.fim
        );

        if (ativo) setDados(resultado);
      } catch (err) {
        if (ativo) {
          setErro(
            err instanceof Error
              ? err.message
              : "Não foi possível carregar o relatório."
          );
        }
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    void carregar();

    return () => {
      ativo = false;
    };
  }, [periodo, versao]);

  function filtrar() {
    if (dataInicial && dataFinal && dataInicial > dataFinal) {
      setErro("A data inicial não pode ser posterior à data final.");
      return;
    }

    setPeriodo({ inicio: dataInicial, fim: dataFinal });
  }

  function limpar() {
    setDataInicial("");
    setDataFinal("");
    setPeriodo({ inicio: "", fim: "" });
  }

  const totalProfissionais = dados.length;

  const totalConsultas = dados.reduce(
    (total, profissional) => total + profissional.totalConsultations,
    0
  );

  const media = totalProfissionais
    ? totalConsultas / totalProfissionais
    : 0;

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <div className={styles.titleIcon}>
            <BarChart3 size={25} />
          </div>

          <div>
            <h1>Relatórios</h1>
            <p>Consultas por profissional de saúde.</p>
          </div>
        </div>

        <button
          type="button"
          className={styles.secondaryButton}
          disabled={carregando}
          onClick={() => setVersao((v) => v + 1)}
        >
          <RefreshCw
            size={17}
            className={carregando ? styles.spinning : ""}
          />
          Atualizar
        </button>
      </header>

      <section className={styles.indicators}>
        <article className={styles.indicator}>
          <div className={styles.indicatorIcon}>
            <Users size={23} />
          </div>

          <div>
            <span>Total de profissionais</span>
            <strong>{carregando || erro ? "—" : totalProfissionais}</strong>
          </div>
        </article>

        <article className={styles.indicator}>
          <div className={styles.indicatorIcon}>
            <CalendarDays size={23} />
          </div>

          <div>
            <span>Total de consultas</span>
            <strong>{carregando || erro ? "—" : totalConsultas}</strong>
          </div>
        </article>

        <article className={styles.indicator}>
          <div className={styles.indicatorIcon}>
            <TrendingUp size={23} />
          </div>

          <div>
            <span>Média por profissional</span>
            <strong>
              {carregando || erro
                ? "—"
                : media.toLocaleString("pt-BR", {
                    maximumFractionDigits: 1,
                  })}
            </strong>
          </div>
        </article>
      </section>

      <section className={styles.filterCard}>
        <h2>Filtrar por período</h2>

        <div className={styles.filters}>
          <label className={styles.field}>
            Data inicial
            <input
              type="date"
              value={dataInicial}
              onChange={(e) => setDataInicial(e.target.value)}
            />
          </label>

          <label className={styles.field}>
            Data final
            <input
              type="date"
              value={dataFinal}
              onChange={(e) => setDataFinal(e.target.value)}
            />
          </label>

          <button
            type="button"
            className={styles.primaryButton}
            onClick={filtrar}
            disabled={carregando}
          >
            <Search size={17} />
            Filtrar
          </button>

          <button
            type="button"
            className={styles.secondaryButton}
            onClick={limpar}
            disabled={carregando}
          >
            Limpar
          </button>
        </div>
      </section>

      {erro && (
        <div className={styles.error} role="alert">
          <AlertCircle size={20} />
          {erro}
        </div>
      )}

      <section className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <h2>Consultas por profissional</h2>
          <p>Consultas agendadas e concluídas.</p>
        </div>

        {carregando ? (
          <div className={styles.empty}>
            Carregando relatório...
          </div>
        ) : erro ? (
          <div className={styles.empty}>
            Verifique os filtros ou tente atualizar.
          </div>
        ) : dados.length === 0 ? (
          <div className={styles.empty}>
            Nenhum profissional encontrado.
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Profissional</th>
                  <th>Especialidade</th>
                  <th>Total de consultas</th>
                </tr>
              </thead>

              <tbody>
                {dados.map((profissional) => (
                  <tr key={profissional.professionalId}>
                    <td>
                      <div className={styles.professional}>
                        <div className={styles.avatar}>
                          {profissional.professionalName.charAt(0)}
                        </div>

                        <strong>
                          {profissional.professionalName}
                        </strong>
                      </div>
                    </td>

                    <td>{profissional.specialty}</td>

                    <td>
                      <span className={styles.badge}>
                        {profissional.totalConsultations}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>

              <tfoot>
                <tr>
                  <td colSpan={2}>Total geral</td>
                  <td>{totalConsultas}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </section>

      <p className={styles.note}>
        Consultas canceladas não são contabilizadas neste relatório.
      </p>
    </main>
  );
}
