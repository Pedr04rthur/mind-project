import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Plus,
  Clock,
  User,
  Stethoscope,
  AlertCircle,
  XCircle,
  RefreshCw,
  CalendarDays,
  CheckCircle2,
} from "lucide-react";
import { useConsultas } from "../../../contexts/ConsultasContext";
import { AgendaActionsModal } from "./AgendaActionsModal";
import styles from "./AgendaPage.module.css";

type Toast = { tipo: "sucesso" | "erro"; mensagem: string } | null;

export function AgendaPage() {
  const navigate = useNavigate();
  const { consultas, loading, erro, carregarPorData, cancelar, reagendar } = useConsultas();

  const [data, setData] = useState(() => new Date().toISOString().slice(0, 10));
  const [consultaSelecionada, setConsultaSelecionada] = useState<any>(null);
  const [acao, setAcao] = useState<"CANCELAR" | "REAGENDAR" | null>(null);
  const [processandoId, setProcessandoId] = useState<number | null>(null);
  const [toast, setToast] = useState<Toast>(null);

  useEffect(() => {
    carregarPorData(data);
  }, [data, carregarPorData]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleRecarregar = () => {
    carregarPorData(data);
  };

  const abrirAcao = (consulta: any, tipo: "CANCELAR" | "REAGENDAR") => {
    setConsultaSelecionada(consulta);
    setAcao(tipo);
  };

  const executarAcao = async (novaDataHora?: string) => {
    if (!consultaSelecionada || !acao) return;
    const id = consultaSelecionada.id;
    const tipoAcao = acao;
    setProcessandoId(id);

    try {
      if (tipoAcao === "CANCELAR") {
        await cancelar(id);
        setToast({ tipo: "sucesso", mensagem: "Consulta cancelada com sucesso." });
      } else if (tipoAcao === "REAGENDAR" && novaDataHora) {
        await reagendar(id, novaDataHora);
        setToast({ tipo: "sucesso", mensagem: "Consulta reagendada com sucesso." });
      }
      setAcao(null);
      setConsultaSelecionada(null);
      await carregarPorData(data);
    } catch (err) {
      throw err;
    } finally {
      setProcessandoId(null);
    }
  };

  const consultasOrdenadas = [...consultas].sort(
    (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
  );

  return (
    <section className={styles.page}>
      <header className={styles.pageHeader}>
        <div className={styles.pageTitle}>
          <div className={styles.titleIcon}>
            <Calendar size={22} strokeWidth={2} />
          </div>
          <div>
            <h1 className={styles.title}>Agenda</h1>
            <p className={styles.subtitle}>Visualize e gerencie as consultas do dia.</p>
          </div>
        </div>

        <button
          type="button"
          className={styles.primaryButton}
          onClick={() => navigate("/recepcao/consultas/nova")}
        >
          <Plus size={18} strokeWidth={2.2} />
          <span>Nova consulta</span>
        </button>
      </header>

      <div className={styles.toolbar}>
        <div className={styles.datePickerWrapper}>
          <CalendarDays size={18} className={styles.dateIcon} />
          <input
            type="date"
            className={styles.dateInput}
            value={data}
            onChange={(e) => setData(e.target.value)}
          />
        </div>
        <button
          type="button"
          className={styles.refreshButton}
          onClick={handleRecarregar}
          disabled={loading}
          title="Recarregar"
        >
          <RefreshCw size={16} className={loading ? styles.spinning : undefined} />
        </button>
      </div>

      {loading && consultas.length === 0 ? (
        <div className={styles.emptyState}>
          <RefreshCw size={24} className={styles.spinning} />
          <p>Carregando agenda...</p>
        </div>
      ) : erro ? (
        <div className={styles.emptyState}>
          <AlertCircle size={28} strokeWidth={1.6} />
          <p>{erro}</p>
          <button type="button" className={styles.secondaryButton} onClick={handleRecarregar}>
            Tentar novamente
          </button>
        </div>
      ) : consultasOrdenadas.length === 0 ? (
        <div className={styles.emptyState}>
          <Calendar size={32} strokeWidth={1.6} />
          <h2 className={styles.emptyTitle}>Nenhuma consulta para este dia</h2>
          <p className={styles.emptyText}>
            Não há consultas agendadas para esta data. Use o botão acima para agendar.
          </p>
        </div>
      ) : (
        <div className={styles.list}>
          {consultasOrdenadas.map((consulta) => {
            const hora = consulta.scheduledAt.split("T")[1].slice(0, 5);
            const processando = processandoId === consulta.id;
            return (
              <div
                key={consulta.id}
                className={`${styles.card} ${processando ? styles.cardProcessando : ""}`}
              >
                <div className={styles.timeBlock}>
                  <span className={styles.time}>{hora}</span>
                </div>
                <div className={styles.info}>
                  <div className={styles.infoRow}>
                    <User size={16} className={styles.infoIcon} />
                    <span className={styles.patientName}>{consulta.patientName}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <Stethoscope size={16} className={styles.infoIcon} />
                    <span className={styles.professionalName}>{consulta.professionalName}</span>
                  </div>
                </div>
                <div className={styles.actions}>
                  {processando ? (
                    <span className={styles.processandoChip}>
                      <RefreshCw size={14} className={styles.spinning} />
                      Processando...
                    </span>
                  ) : (
                    <>
                      <button
                        type="button"
                        className={styles.actionButton}
                        onClick={() => abrirAcao(consulta, "REAGENDAR")}
                        title="Reagendar"
                      >
                        <Clock size={16} />
                      </button>
                      <button
                        type="button"
                        className={`${styles.actionButton} ${styles.actionDanger}`}
                        onClick={() => abrirAcao(consulta, "CANCELAR")}
                        title="Cancelar"
                      >
                        <XCircle size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {acao && consultaSelecionada && (
        <AgendaActionsModal
          acao={acao}
          consulta={consultaSelecionada}
          onClose={() => {
            setAcao(null);
            setConsultaSelecionada(null);
          }}
          onConfirm={executarAcao}
        />
      )}

      {toast && (
        <div
          className={`${styles.toast} ${
            toast.tipo === "sucesso" ? styles.toastSucesso : styles.toastErro
          }`}
          role="status"
        >
          {toast.tipo === "sucesso" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{toast.mensagem}</span>
        </div>
      )}
    </section>
  );
}
