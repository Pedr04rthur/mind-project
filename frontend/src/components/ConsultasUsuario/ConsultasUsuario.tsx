import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Search,
  Stethoscope,
  User,
  AlertCircle,
} from "lucide-react";
import {
  api,
  ApiError,
  type AppointmentDetailsApi,
} from "../../services/api";
import styles from "./ConsultasUsuario.module.css";

interface Props {
  perfil: "PACIENTE" | "PROFISSIONAL";
}

type Status = AppointmentDetailsApi["status"];
type Filtro = "TODAS" | Status;

const STATUS_LABELS: Record<Status, string> = {
  SCHEDULED: "Agendada",
  COMPLETED: "Concluída",
  CANCELLED: "Cancelada",
};

function formatarData(data: string) {
  return new Date(data).toLocaleDateString("pt-BR");
}

function formatarHora(data: string) {
  return new Date(data).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function normalizar(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function ConsultasUsuario({ perfil }: Props) {
  const [consultas, setConsultas] = useState<AppointmentDetailsApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("TODAS");

  const isPaciente = perfil === "PACIENTE";

  const carregar = useCallback(async (silencioso = false) => {
    if (!silencioso) setLoading(true);

    try {
      const dados = await api.appointments.listMine();
      setConsultas(dados);
      setErro(null);
    } catch (err) {
      setErro(
        err instanceof ApiError
          ? err.message
          : "Não foi possível carregar as consultas."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void carregar();

    const intervalo = window.setInterval(() => {
      void carregar(true);
    }, 30000);

    const aoFocar = () => {
      void carregar(true);
    };

    window.addEventListener("focus", aoFocar);

    return () => {
      window.clearInterval(intervalo);
      window.removeEventListener("focus", aoFocar);
    };
  }, [carregar]);

  const agendadas = consultas.filter(
    (c) => c.status === "SCHEDULED"
  );

  const concluidas = consultas.filter(
    (c) => c.status === "COMPLETED"
  );

  const canceladas = consultas.filter(
    (c) => c.status === "CANCELLED"
  );

  const proxima = agendadas
    .filter(
      (c) => new Date(c.scheduledAt).getTime() >= Date.now()
    )
    .sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() -
        new Date(b.scheduledAt).getTime()
    )[0];

  const filtradas = useMemo(() => {
    const termo = normalizar(busca.trim());

    return consultas
      .filter((c) => {
        if (filtro !== "TODAS" && c.status !== filtro) {
          return false;
        }

        const texto = normalizar(
          [
            c.id,
            c.patient.name,
            c.professional.name,
            c.professional.specialty,
            formatarData(c.scheduledAt),
          ].join(" ")
        );

        return texto.includes(termo);
      })
      .sort(
        (a, b) =>
          new Date(b.scheduledAt).getTime() -
          new Date(a.scheduledAt).getTime()
      );
  }, [consultas, busca, filtro]);

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <div className={styles.heading}>
          <div className={styles.titleIcon}>
            <CalendarDays size={24} />
          </div>

          <div>
            <h1>
              {isPaciente ? "Minhas consultas" : "Consultas"}
            </h1>
            <p>
              {isPaciente
                ? "Acompanhe suas consultas e seu histórico de atendimentos."
                : "Acompanhe sua agenda clínica e seus atendimentos."}
            </p>
          </div>
        </div>

        <button
          type="button"
          className={styles.refreshButton}
          disabled={loading}
          onClick={() => void carregar()}
        >
          <RefreshCw
            size={16}
            className={loading ? styles.spinning : undefined}
          />
          Atualizar
        </button>
      </header>

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.blue}`}>
            <CalendarDays size={21} />
          </div>
          <div>
            <span>Agendadas</span>
            <strong>{agendadas.length}</strong>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.green}`}>
            <CheckCircle2 size={21} />
          </div>
          <div>
            <span>Concluídas</span>
            <strong>{concluidas.length}</strong>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.red}`}>
            <XCircle size={21} />
          </div>
          <div>
            <span>Canceladas</span>
            <strong>{canceladas.length}</strong>
          </div>
        </div>
      </div>

      {proxima && (
        <div className={styles.nextCard}>
          <div className={styles.nextIcon}>
            <CalendarDays size={28} />
          </div>

          <div className={styles.nextContent}>
            <span className={styles.nextLabel}>
              PRÓXIMA CONSULTA
            </span>

            <h2>
              {isPaciente
                ? proxima.professional.name
                : proxima.patient.name}
            </h2>

            <p>{proxima.professional.specialty}</p>

            <div className={styles.nextMeta}>
              <span>
                <CalendarDays size={16} />
                {formatarData(proxima.scheduledAt)}
              </span>

              <span>
                <Clock size={16} />
                {formatarHora(proxima.scheduledAt)}
              </span>
            </div>
          </div>

          <span className={styles.nextBadge}>Agendada</span>
        </div>
      )}

      <div className={styles.sectionHeader}>
        <h2>Histórico de consultas</h2>
        <span>{filtradas.length} registros</span>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.search}>
          <Search size={18} />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder={
              isPaciente
                ? "Buscar por profissional ou especialidade"
                : "Buscar por paciente"
            }
          />
        </div>

        <select
          className={styles.select}
          value={filtro}
          onChange={(e) => setFiltro(e.target.value as Filtro)}
        >
          <option value="TODAS">Todos os status</option>
          <option value="SCHEDULED">Agendadas</option>
          <option value="COMPLETED">Concluídas</option>
          <option value="CANCELLED">Canceladas</option>
        </select>
      </div>

      {erro && (
        <div className={styles.error}>
          <AlertCircle size={18} />
          <span>{erro}</span>
        </div>
      )}

      {loading ? (
        <div className={styles.empty}>
          <RefreshCw size={28} className={styles.spinning} />
          <p>Carregando consultas...</p>
        </div>
      ) : filtradas.length === 0 ? (
        <div className={styles.empty}>
          <CalendarDays size={36} />
          <h3>Nenhuma consulta encontrada</h3>
          <p>
            {erro
              ? "Tente atualizar os dados."
              : "Não há consultas para os filtros selecionados."}
          </p>
        </div>
      ) : (
        <div className={styles.list}>
          {filtradas.map((consulta) => (
            <article className={styles.card} key={consulta.id}>
              <div className={styles.cardIcon}>
                {isPaciente ? (
                  <Stethoscope size={23} />
                ) : (
                  <User size={23} />
                )}
              </div>

              <div className={styles.cardInfo}>
                <span className={styles.reference}>
                  Consulta #{consulta.id}
                </span>

                <h3>
                  {isPaciente
                    ? consulta.professional.name
                    : consulta.patient.name}
                </h3>

                <p>{consulta.professional.specialty}</p>

                <div className={styles.cardMeta}>
                  <span>
                    <CalendarDays size={15} />
                    {formatarData(consulta.scheduledAt)}
                  </span>

                  <span>
                    <Clock size={15} />
                    {formatarHora(consulta.scheduledAt)}
                  </span>
                </div>
              </div>

              <span
                className={`${styles.badge} ${styles[consulta.status]}`}
              >
                {STATUS_LABELS[consulta.status]}
              </span>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
