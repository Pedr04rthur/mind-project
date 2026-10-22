import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarRange,
  CalendarDays,
  ArrowRight,
  User,
  Stethoscope,
  AlertCircle,
  RefreshCw,
  Calendar,
  X,
} from "lucide-react";
import { useConsultas } from "../../../contexts/ConsultasContext";
import { SearchInput } from "../../../components/SearchInput/SearchInput";
import { matchesSearch } from "../../../utils/search";
import type { Consulta } from "../../../types/consulta";
import styles from "./ConsultasPeriodo.module.css";

function hojeIso(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function somaDias(iso: string, dias: number): string {
  const d = new Date(iso + "T12:00:00");
  d.setDate(d.getDate() + dias);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatarDataBr(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function agruparPorDia(consultas: Consulta[]): Record<string, Consulta[]> {
  return consultas.reduce((acc, c) => {
    const dia = c.scheduledAt.slice(0, 10);
    if (!acc[dia]) acc[dia] = [];
    acc[dia].push(c);
    return acc;
  }, {} as Record<string, Consulta[]>);
}

export function ConsultasPeriodo() {
  const navigate = useNavigate();
  const { consultas, loading, erro, carregarPorPeriodo } = useConsultas();

  const hoje = hojeIso();
  const [de, setDe] = useState(somaDias(hoje, -7));
  const [ate, setAte] = useState(somaDias(hoje, 30));
  const [busca, setBusca] = useState("");

  useEffect(() => {
    carregarPorPeriodo(de, ate);
  }, [de, ate, carregarPorPeriodo]);

  const filtradas = useMemo(() => {
    return consultas.filter((c) =>
      matchesSearch(busca, c.patientName, c.professionalName)
    );
  }, [consultas, busca]);

  const agrupadas = useMemo(() => agruparPorDia(filtradas), [filtradas]);
  const dias = Object.keys(agrupadas).sort();

  const limparFiltros = () => {
    setDe(somaDias(hoje, -7));
    setAte(somaDias(hoje, 30));
    setBusca("");
  };

  const filtrosAtivos =
    de !== somaDias(hoje, -7) ||
    ate !== somaDias(hoje, 30) ||
    busca.trim().length > 0;

  return (
    <section className={styles.page}>
      <header className={styles.pageHeader}>
        <div className={styles.pageTitle}>
          <div className={styles.titleIcon}>
            <CalendarRange size={22} strokeWidth={2} />
          </div>
          <div>
            <h1 className={styles.title}>Consultas por período</h1>
            <p className={styles.subtitle}>
              Visualize as consultas agendadas em um intervalo de datas.
            </p>
          </div>
        </div>

        <button
          type="button"
          className={styles.primaryButton}
          onClick={() => navigate("/recepcao/consultas/nova")}
        >
          <Calendar size={18} strokeWidth={2.2} />
          <span>Nova consulta</span>
        </button>
      </header>

      <div className={styles.filterCard}>
        <div className={styles.filterGroup}>
          <div className={styles.dateField}>
            <label className={styles.dateLabel} htmlFor="de">
              De
            </label>
            <div className={styles.inputWrapper}>
              <CalendarDays size={16} className={styles.inputIcon} />
              <input
                id="de"
                type="date"
                className={styles.dateInput}
                value={de}
                max={ate}
                onChange={(e) => setDe(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.dateField}>
            <label className={styles.dateLabel} htmlFor="ate">
              Até
            </label>
            <div className={styles.inputWrapper}>
              <CalendarDays size={16} className={styles.inputIcon} />
              <input
                id="ate"
                type="date"
                className={styles.dateInput}
                value={ate}
                min={de}
                onChange={(e) => setAte(e.target.value)}
              />
            </div>
          </div>

          <button
            type="button"
            className={styles.refreshButton}
            onClick={() => carregarPorPeriodo(de, ate)}
            disabled={loading}
            title="Recarregar"
          >
            <RefreshCw size={16} className={loading ? styles.spinning : undefined} />
          </button>
        </div>

        <div className={styles.toolbarRow}>
          <SearchInput
            value={busca}
            onChange={setBusca}
            placeholder="Buscar por paciente ou profissional"
            ariaLabel="Buscar consultas"
          />

          <span className={styles.counter}>
            {filtradas.length}{" "}
            {filtradas.length === 1 ? "consulta" : "consultas"}
          </span>

          {filtrosAtivos && (
            <button
              type="button"
              className={styles.clearFiltersButton}
              onClick={limparFiltros}
            >
              <X size={14} />
              <span>Limpar filtros</span>
            </button>
          )}
        </div>
      </div>

      {loading && consultas.length === 0 ? (
        <div className={styles.emptyState}>
          <RefreshCw size={24} className={styles.spinning} />
          <p>Carregando consultas...</p>
        </div>
      ) : erro ? (
        <div className={styles.emptyState}>
          <AlertCircle size={28} strokeWidth={1.6} />
          <p>{erro}</p>
          <button
            type="button"
            className={styles.retryButton}
            onClick={() => carregarPorPeriodo(de, ate)}
          >
            Tentar novamente
          </button>
        </div>
      ) : dias.length === 0 ? (
        <div className={styles.emptyState}>
          <CalendarRange size={32} strokeWidth={1.6} />
          <h2 className={styles.emptyTitle}>
            Nenhuma consulta no período
          </h2>
          <p className={styles.emptyText}>
            {busca
              ? `Nenhuma consulta encontrada para "${busca}".`
              : `Não há consultas agendadas entre ${formatarDataBr(de)} e ${formatarDataBr(ate)}.`}
          </p>
        </div>
      ) : (
        <div className={styles.timeline}>
          {dias.map((dia) => {
            const consultasDoDia = agrupadas[dia];
            const diaFormatado = new Date(dia + "T12:00:00").toLocaleDateString(
              "pt-BR",
              {
                weekday: "long",
                day: "2-digit",
                month: "long",
              }
            );

            return (
              <section key={dia} className={styles.diaGroup}>
                <header className={styles.diaHeader}>
                  <span className={styles.diaBadge}>
                    {formatarDataBr(dia)}
                  </span>
                  <span className={styles.diaLabel}>{diaFormatado}</span>
                  <span className={styles.diaCount}>
                    {consultasDoDia.length}{" "}
                    {consultasDoDia.length === 1 ? "consulta" : "consultas"}
                  </span>
                </header>

                <ul className={styles.diaList}>
                  {consultasDoDia.map((c) => {
                    const hora = c.scheduledAt.split("T")[1].slice(0, 5);
                    return (
                      <li key={c.id}>
                        <button
                          type="button"
                          className={styles.consultaItem}
                          onClick={() =>
                            navigate(`/recepcao/consultas/${c.id}`)
                          }
                        >
                          <div className={styles.itemHora}>
                            {hora}
                          </div>
                          <div className={styles.itemInfo}>
                            <div className={styles.itemRow}>
                              <User size={14} className={styles.itemIcon} />
                              <span className={styles.itemPaciente}>
                                {c.patientName}
                              </span>
                            </div>
                            <div className={styles.itemRow}>
                              <Stethoscope
                                size={14}
                                className={styles.itemIcon}
                              />
                              <span className={styles.itemProfissional}>
                                {c.professionalName}
                              </span>
                            </div>
                          </div>
                          <ArrowRight
                            size={16}
                            className={styles.itemChevron}
                          />
                        </button>
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
