import { useState } from "react";
import { X, Calendar, Clock, AlertCircle, AlertTriangle } from "lucide-react";
import { ApiError } from "../../../services/api";
import styles from "./AgendaActionsModal.module.css";

interface Props {
  acao: "CANCELAR" | "REAGENDAR";
  consulta: any;
  onClose: () => void;
  onConfirm: (novaDataHora?: string) => Promise<void>;
}

export function AgendaActionsModal({ acao, consulta, onClose, onConfirm }: Props) {
  const [data, setData] = useState(() => consulta.scheduledAt.split("T")[0]);
  const [hora, setHora] = useState(() => consulta.scheduledAt.split("T")[1].slice(0, 5));
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [erroConflito, setErroConflito] = useState(false);

  const handleConfirm = async () => {
    setErro(null);
    setErroConflito(false);
    setEnviando(true);
    try {
      if (acao === "REAGENDAR") {
        await onConfirm(`${data}T${hora}:00`);
      } else {
        await onConfirm();
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setErroConflito(true);
        setErro(err.message || "Este profissional já tem uma consulta agendada nesse horário.");
      } else if (err instanceof ApiError) {
        setErro(err.message || "Não foi possível concluir a ação.");
      } else {
        setErro(err instanceof Error ? err.message : "Erro inesperado.");
      }
    } finally {
      setEnviando(false);
    }
  };

  const limparErro = () => {
    setErro(null);
    setErroConflito(false);
  };

  return (
    <div className={styles.overlay} onClick={enviando ? undefined : onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <header className={styles.header}>
          <h2 className={styles.title}>
            {acao === "CANCELAR" ? "Cancelar consulta" : "Reagendar consulta"}
          </h2>
          <button type="button" className={styles.closeButton} onClick={onClose} disabled={enviando} aria-label="Fechar">
            <X size={18} />
          </button>
        </header>

        <div className={styles.content}>
          <p className={styles.text}>
            {acao === "CANCELAR" ? <>Tem certeza que deseja cancelar a consulta de </> : <>Escolha a nova data e hora para a consulta de </>}
            <strong>{consulta.patientName}</strong> com <strong>{consulta.professionalName}</strong>?
          </p>

          {acao === "REAGENDAR" && (
            <div className={styles.inputGroup}>
              <div className={styles.inputWrapper}>
                <Calendar size={16} className={styles.icon} />
                <input type="date" className={styles.input} value={data} onChange={(e) => { setData(e.target.value); limparErro(); }} disabled={enviando} />
              </div>
              <div className={styles.inputWrapper}>
                <Clock size={16} className={styles.icon} />
                <input type="time" className={styles.input} value={hora} onChange={(e) => { setHora(e.target.value); limparErro(); }} disabled={enviando} />
              </div>
            </div>
          )}

          {erroConflito && erro && (
            <div className={styles.conflitoBox} role="alert">
              <AlertTriangle size={18} className={styles.conflitoIcon} />
              <div>
                <strong className={styles.conflitoTitle}>Horário indisponível</strong>
                <p className={styles.conflitoText}>{erro} Escolha outro horário.</p>
              </div>
            </div>
          )}

          {!erroConflito && erro && (
            <div className={styles.erroBox} role="alert">
              <AlertCircle size={16} />
              <span>{erro}</span>
            </div>
          )}
        </div>

        <footer className={styles.footer}>
          <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={enviando}>
            Voltar
          </button>
          <button
            type="button"
            className={`${styles.confirmBtn} ${acao === "CANCELAR" ? styles.dangerBtn : ""}`}
            onClick={handleConfirm}
            disabled={enviando}
          >
            {enviando ? "Processando..." : acao === "CANCELAR" ? "Sim, cancelar" : "Confirmar novo horário"}
          </button>
        </footer>
      </div>
    </div>
  );
}
