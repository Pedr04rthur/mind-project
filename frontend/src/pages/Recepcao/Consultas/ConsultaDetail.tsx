import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  User,
  Stethoscope,
  FileText,
  AlertCircle,
  RefreshCw,
  XCircle,
  ShieldCheck,
  BadgeCheck,
  Smile,
} from "lucide-react";
import { api, ApiError, type AppointmentDetailsApi } from "../../../services/api";
import { AgendaActionsModal } from "../Agenda/AgendaActionsModal";
import { useConsultas } from "../../../contexts/ConsultasContext";
import { HumorTimeline } from "../../../components/HumorTimeline/HumorTimeline";
import styles from "./ConsultaDetail.module.css";

export function ConsultaDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { cancelar, reagendar } = useConsultas();

  const [consulta, setConsulta] = useState<AppointmentDetailsApi | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [acao, setAcao] = useState<"CANCELAR" | "REAGENDAR" | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const carregar = async () => {
    if (!id) return;
    setLoading(true);
    setErro(null);
    try {
      const data = await api.appointments.getById(Number(id));
      setConsulta(data);
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.status === 404
            ? "Consulta não encontrada."
            : err.message
          : "Erro ao carregar detalhes da consulta.";
      setErro(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  const executarAcao = async (novaDataHora?: string) => {
    if (!consulta || !acao) return;
    try {
      if (acao === "CANCELAR") {
        await cancelar(consulta.id);
        setToast("Consulta cancelada com sucesso.");
      } else if (acao === "REAGENDAR" && novaDataHora) {
        await reagendar(consulta.id, novaDataHora);
        setToast("Consulta reagendada com sucesso.");
      }
      setAcao(null);
      await carregar();
    } catch (err) {
      throw err;
    }
  };

  if (loading && !consulta) {
    return (
      <section className={styles.statePage}>
        <RefreshCw size={24} className={styles.spinning} />
        <p>Carregando consulta...</p>
      </section>
    );
  }

  if (erro || !consulta) {
    return (
      <section className={styles.statePage}>
        <AlertCircle size={32} strokeWidth={1.6} />
        <h2 className={styles.stateTitle}>{erro ?? "Consulta não encontrada"}</h2>
        <button
          type="button"
          className={styles.primaryButton}
          onClick={() => navigate("/recepcao/agenda")}
        >
          <ArrowLeft size={16} />
          Voltar para a agenda
        </button>
      </section>
    );
  }

  const dataHora = new Date(consulta.scheduledAt);
  const dataFormatada = dataHora.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const horaFormatada = dataHora.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const isAgendada = consulta.status === "SCHEDULED";
  const isCancelada = consulta.status === "CANCELLED";

  return (
    <section className={styles.page}>
      <button
        type="button"
        className={styles.backButton}
        onClick={() => navigate("/recepcao/agenda")}
      >
        <ArrowLeft size={16} />
        <span>Voltar para a agenda</span>
      </button>

      <header className={styles.pageHeader}>
        <div className={styles.titleIcon}>
          <CalendarDays size={22} strokeWidth={2} />
        </div>
        <div className={styles.headerText}>
          <h1 className={styles.title}>Detalhes da consulta</h1>
          <div className={styles.meta}>
            <span className={styles.idChip}>#{consulta.id}</span>
            <span
              className={`${styles.statusBadge} ${
                isAgendada
                  ? styles.badgeAgendada
                  : isCancelada
                  ? styles.badgeCancelada
                  : styles.badgeConcluida
              }`}
            >
              {isAgendada ? "Agendada" : isCancelada ? "Cancelada" : "Concluída"}
            </span>
          </div>
        </div>
      </header>

      {/* ----- Data e horário em destaque ----- */}
      <div className={styles.dateCard}>
        <div className={styles.dateIcon}>
          <CalendarDays size={26} strokeWidth={2} />
        </div>
        <div>
          <span className={styles.dateLabel}>{dataFormatada}</span>
          <div className={styles.dateHora}>
            <Clock size={16} />
            <span>{horaFormatada}</span>
          </div>
        </div>
      </div>

      {/* ----- Participantes ----- */}
      <div className={styles.grid}>
        <article className={styles.card}>
          <header className={styles.cardHeader}>
            <User size={18} strokeWidth={2} />
            <h2 className={styles.cardTitle}>Paciente</h2>
          </header>
          <dl className={styles.infoList}>
            <div className={styles.infoRow}>
              <dt className={styles.infoLabel}>Nome</dt>
              <dd className={styles.infoValue}>{consulta.patient.name}</dd>
            </div>
            <div className={styles.infoRow}>
              <dt className={styles.infoLabel}>CPF</dt>
              <dd className={`${styles.infoValue} ${styles.mono}`}>
                {consulta.patient.cpf}
              </dd>
            </div>
            <div className={styles.infoRow}>
              <dt className={styles.infoLabel}>ID interno</dt>
              <dd className={`${styles.infoValue} ${styles.mono}`}>
                {consulta.patient.id}
              </dd>
            </div>
          </dl>
        </article>

        <article className={styles.card}>
          <header className={styles.cardHeader}>
            <Stethoscope size={18} strokeWidth={2} />
            <h2 className={styles.cardTitle}>Profissional</h2>
          </header>
          <dl className={styles.infoList}>
            <div className={styles.infoRow}>
              <dt className={styles.infoLabel}>Nome</dt>
              <dd className={styles.infoValue}>{consulta.professional.name}</dd>
            </div>
            <div className={styles.infoRow}>
              <dt className={styles.infoLabel}>Especialidade</dt>
              <dd className={styles.infoValue}>
                <span className={styles.specialtyBadge}>
                  <BadgeCheck size={13} />
                  {consulta.professional.specialty || "—"}
                </span>
              </dd>
            </div>
            <div className={styles.infoRow}>
              <dt className={styles.infoLabel}>ID interno</dt>
              <dd className={`${styles.infoValue} ${styles.mono}`}>
                {consulta.professional.id}
              </dd>
            </div>
          </dl>
        </article>
      </div>

      {/* ----- Histórico clínico / observações ----- */}
      <article className={styles.card}>
        <header className={styles.cardHeader}>
          <FileText size={18} strokeWidth={2} />
          <h2 className={styles.cardTitle}>Histórico da consulta</h2>
        </header>
        <div className={styles.historicoBox}>
          <p className={styles.historicoText}>
            Nenhum histórico registrado ainda. O profissional poderá preencher
            as anotações da sessão ao conduzir a consulta.
          </p>
        </div>
      </article>

      {/* ----- Histórico de humor (somente leitura) ----- */}
      <article className={styles.card}>
        <header className={styles.cardHeader}>
          <Smile size={18} strokeWidth={2} />
          <h2 className={styles.cardTitle}>Histórico de humor</h2>
        </header>
        <HumorTimeline cpfPaciente={consulta.patient.cpf} limite={10} />
      </article>

      {/* ----- Ações ----- */}
      {isAgendada && (
        <footer className={styles.actions}>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => setAcao("REAGENDAR")}
          >
            <Clock size={16} />
            Reagendar
          </button>
          <button
            type="button"
            className={styles.dangerButton}
            onClick={() => setAcao("CANCELAR")}
          >
            <XCircle size={16} />
            Cancelar consulta
          </button>
        </footer>
      )}

      <div className={styles.lgpdNote}>
        <ShieldCheck size={16} strokeWidth={2} />
        <span>
          Dados sensíveis de saúde protegidos pela LGPD. Acesso e alterações são
          registrados para fins de auditoria.
        </span>
      </div>

      {acao && (
        <AgendaActionsModal
          acao={acao}
          consulta={{
            id: consulta.id,
            scheduledAt: consulta.scheduledAt,
            patientName: consulta.patient.name,
            professionalName: consulta.professional.name,
          }}
          onClose={() => setAcao(null)}
          onConfirm={executarAcao}
        />
      )}

      {toast && (
        <div className={styles.toast} role="status">
          {toast}
        </div>
      )}
    </section>
  );
}
