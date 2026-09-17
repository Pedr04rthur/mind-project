import { useState, type FormEvent } from "react";
import {
  X,
  ClipboardCheck,
  AlertCircle,
  ArrowDown,
  Flag,
  AlertTriangle,
} from "lucide-react";
import type { Paciente, Prioridade } from "../../../types/paciente";
import type { Triagem } from "../../../types/triagem";
import styles from "./TriagemModal.module.css";

interface TriagemModalProps {
  paciente: Paciente;
  triagemAtual: Triagem | null;
  onClose: () => void;
  onSave: (prioridade: Prioridade, observacao: string) => void;
}

const PRIORIDADES: {
  valor: Prioridade;
  label: string;
  descricao: string;
  icon: typeof ArrowDown;
  cor: "azul" | "ambar" | "vermelho";
}[] = [
  {
    valor: "BAIXA",
    label: "Baixa",
    descricao: "Atendimento de rotina, sem urgência.",
    icon: ArrowDown,
    cor: "azul",
  },
  {
    valor: "MEDIA",
    label: "Média",
    descricao: "Atenção necessária, mas sem risco imediato.",
    icon: Flag,
    cor: "ambar",
  },
  {
    valor: "ALTA",
    label: "Alta",
    descricao: "Prioridade máxima, requer atenção imediata.",
    icon: AlertTriangle,
    cor: "vermelho",
  },
];

const MAX_OBSERVACAO = 500;

export function TriagemModal({
  paciente,
  triagemAtual,
  onClose,
  onSave,
}: TriagemModalProps) {
  const [prioridade, setPrioridade] = useState<Prioridade>(
    triagemAtual?.prioridade ?? "BAIXA"
  );
  const [observacao, setObservacao] = useState(triagemAtual?.observacao ?? "");
  const [erro, setErro] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErro(null);

    if (!prioridade) {
      setErro("Selecione uma prioridade.");
      return;
    }

    onSave(prioridade, observacao.trim());
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <header className={styles.modalHeader}>
          <div>
            <h2 className={styles.modalTitle}>
              {triagemAtual ? "Editar triagem" : "Fazer triagem"}
            </h2>
            <p className={styles.modalSubtitle}>
              Defina a prioridade de atendimento e registre observações do
              acolhimento.
            </p>
          </div>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </header>

        <div className={styles.patientBox}>
          <span className={styles.patientAvatar}>
            {paciente.nome
              .split(" ")
              .filter(Boolean)
              .slice(0, 2)
              .map((n) => n[0]?.toUpperCase())
              .join("")}
          </span>
          <div className={styles.patientInfo}>
            <span className={styles.patientName}>{paciente.nome}</span>
            <span className={styles.patientMeta}>
              CPF {paciente.cpf}
              {paciente.telefone ? ` · ${paciente.telefone}` : ""}
            </span>
          </div>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>
              <ClipboardCheck size={16} strokeWidth={2} />
              Prioridade
            </legend>

            <div className={styles.priorityGroup} role="radiogroup">
              {PRIORIDADES.map((p) => {
                const Icon = p.icon;
                const selected = prioridade === p.valor;
                return (
                  <button
                    key={p.valor}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className={`${styles.priorityOption} ${
                      styles[`priority_${p.cor}`]
                    } ${selected ? styles.priorityActive : ""}`}
                    onClick={() => setPrioridade(p.valor)}
                  >
                    <span className={styles.priorityIconWrap}>
                      <Icon size={18} strokeWidth={2.2} />
                    </span>
                    <span className={styles.priorityTitle}>{p.label}</span>
                    <span className={styles.priorityDesc}>{p.descricao}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>
              Observação da recepção
            </legend>

            <textarea
              className={styles.textarea}
              rows={5}
              maxLength={MAX_OBSERVACAO}
              placeholder="Ex.: paciente relatou crise recente, encaminhado pela Dra. Marina; encaixe sugerido para esta semana..."
              value={observacao}
              onChange={(e) =>
                setObservacao(e.target.value.slice(0, MAX_OBSERVACAO))
              }
            />
            <span className={styles.counter}>
              {observacao.length}/{MAX_OBSERVACAO}
            </span>
          </fieldset>

          {prioridade === "ALTA" && (
            <div className={styles.warningBox}>
              <AlertTriangle size={16} />
              <span>
                Pacientes com prioridade alta devem ser atendidos o quanto antes.
                Considere agendar consulta prioritária na sequência.
              </span>
            </div>
          )}

          {erro && (
            <div className={styles.errorBox} role="alert">
              <AlertCircle size={16} />
              <span>{erro}</span>
            </div>
          )}

          <footer className={styles.modalFooter}>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={onClose}
            >
              Cancelar
            </button>
            <button type="submit" className={styles.primaryButton}>
              {triagemAtual ? "Salvar alterações" : "Concluir triagem"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
