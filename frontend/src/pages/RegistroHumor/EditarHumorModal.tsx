import { useState, type FormEvent } from "react";
import { X, AlertCircle, Smile, Frown, Clock } from "lucide-react";
import { formatarHora } from "../../utils/dates";
import type { RegistroHumor, HumorType } from "../../types/humor";
import styles from "./EditarHumorModal.module.css";

interface EditarHumorModalProps {
  registro: RegistroHumor;
  onClose: () => void;
  onSave: (humor: HumorType, comentario: string | null) => Promise<void>;
}

const MAX_COMENTARIO = 500;

export function EditarHumorModal({ registro, onClose, onSave }: EditarHumorModalProps) {
  const [humor, setHumor] = useState<HumorType>(registro.humor);
  const [comentario, setComentario] = useState(registro.comentario ?? "");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      await onSave(humor, comentario.trim() ? comentario.trim() : null);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={enviando ? undefined : onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <header className={styles.header}>
          <div>
            <h2 className={styles.title}>Editar humor de hoje</h2>
            <p className={styles.subtitle}>
              <Clock size={13} /> Registrado às {formatarHora(registro.criadoEm)}
            </p>
          </div>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            disabled={enviando}
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </header>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.moodGroup}>
            <button
              type="button"
              className={`${styles.moodBtn} ${humor === "bom" ? styles.moodActiveBom : ""}`}
              onClick={() => setHumor("bom")}
              aria-pressed={humor === "bom"}
            >
              <Smile size={32} strokeWidth={1.8} />
              <span>Bom</span>
            </button>
            <button
              type="button"
              className={`${styles.moodBtn} ${humor === "ruim" ? styles.moodActiveRuim : ""}`}
              onClick={() => setHumor("ruim")}
              aria-pressed={humor === "ruim"}
            >
              <Frown size={32} strokeWidth={1.8} />
              <span>Ruim</span>
            </button>
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="comentario" className={styles.label}>
              Comentário <span className={styles.optional}>(opcional)</span>
            </label>
            <textarea
              id="comentario"
              className={styles.textarea}
              rows={4}
              maxLength={MAX_COMENTARIO}
              placeholder="Ex.: dormi melhor, ansiedade aumentou..."
              value={comentario}
              onChange={(e) => setComentario(e.target.value.slice(0, MAX_COMENTARIO))}
              disabled={enviando}
            />
            <span className={styles.counter}>
              {comentario.length}/{MAX_COMENTARIO}
            </span>
          </div>

          {erro && (
            <div className={styles.erroBox} role="alert">
              <AlertCircle size={16} />
              <span>{erro}</span>
            </div>
          )}

          <footer className={styles.actions}>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={onClose}
              disabled={enviando}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.primaryButton}
              disabled={enviando}
            >
              {enviando ? "Salvando..." : "Salvar alterações"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
