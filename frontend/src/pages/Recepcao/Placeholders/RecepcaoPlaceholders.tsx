import { Calendar, ShieldCheck, Plus, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import styles from "./RecepcaoPlaceholders.module.css";

export function AgendaPage() {
  const navigate = useNavigate();
  return (
    <section className={styles.page}>
      <header className={styles.pageHeader}>
        <div className={styles.pageTitle}>
          <div className={styles.titleIcon}><Calendar size={22} strokeWidth={2} /></div>
          <div>
            <h1 className={styles.title}>Agenda</h1>
            <p className={styles.subtitle}>Controle de fluxo da agenda clínica.</p>
          </div>
        </div>
        <button type="button" className={styles.primaryButton} onClick={() => navigate("/recepcao/consultas/nova")}>
          <Plus size={18} strokeWidth={2.2} /> <span>Nova consulta</span>
        </button>
      </header>
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}><Calendar size={32} strokeWidth={1.6} /></div>
        <h2 className={styles.emptyTitle}>Agenda em preparação</h2>
        <p className={styles.emptyText}>
          A visualização diária das consultas agendadas estará disponível em breve.
          Use o botão <strong>Nova consulta</strong> para agendar uma sessão.
        </p>
      </div>
    </section>
  );
}

export function AuditoriaPage() {
  return (
    <section className={styles.page}>
      <header className={styles.pageHeader}>
        <div className={styles.pageTitle}>
          <div className={styles.titleIcon}><ShieldCheck size={22} strokeWidth={2} /></div>
          <div>
            <h1 className={styles.title}>Auditoria LGPD</h1>
            <p className={styles.subtitle}>Consulta ao log de exclusões de dados sensíveis.</p>
          </div>
        </div>
      </header>
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}><AlertCircle size={32} strokeWidth={1.6} /></div>
        <h2 className={styles.emptyTitle}>Aguardando backend</h2>
        <p className={styles.emptyText}>A tabela <code>LogExclusoes</code> será consultada quando o endpoint estiver disponível.</p>
      </div>
    </section>
  );
}
