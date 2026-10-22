import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarPlus, ArrowLeft, AlertCircle, CheckCircle2, Calendar, Clock } from "lucide-react";
import { PacienteSelect } from "../../../components/PacienteSelect/PacienteSelect";
import { ProfissionalSelect } from "../../../components/ProfissionalSelect/ProfissionalSelect";
import { useConsultas } from "../../../contexts/ConsultasContext";
import styles from "./ConsultaForm.module.css";

const MAX_OBSERVACAO = 500;

export function ConsultaForm() {
  const navigate = useNavigate();
  const { criar } = useConsultas();

  const [cpfPaciente, setCpfPaciente] = useState("");
  const [professionalId, setProfessionalId] = useState<number | null>(null);
  const [data, setData] = useState(() => new Date().toISOString().slice(0, 10));
  const [hora, setHora] = useState("09:00");
  const [observacao, setObservacao] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErro(null);
    setSucesso(false);

    if (!cpfPaciente) { setErro("Selecione um paciente."); return; }
    if (!professionalId) { setErro("Selecione um profissional."); return; }
    if (!data || !hora) { setErro("Informe a data e a hora."); return; }

    const scheduledAt = `${data}T${hora}:00`;

    setEnviando(true);
    try {
      await criar({ patientCpf: cpfPaciente, professionalId, scheduledAt });
      setSucesso(true);
      setObservacao("");
      setTimeout(() => setSucesso(false), 4000);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao agendar consulta");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <section className={styles.page}>
      <button type="button" className={styles.backButton} onClick={() => navigate("/recepcao/agenda")}>
        <ArrowLeft size={16} /> <span>Voltar para a agenda</span>
      </button>
      <header className={styles.pageHeader}>
        <div className={styles.titleIcon}><CalendarPlus size={22} strokeWidth={2} /></div>
        <div>
          <h1 className={styles.title}>Nova consulta</h1>
          <p className={styles.subtitle}>Agende uma sessão vinculando um paciente a um profissional.</p>
        </div>
      </header>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Participantes</h2>
          <div className={styles.grid}>
            <div className={styles.fieldFull}>
              <PacienteSelect value={cpfPaciente} onChange={setCpfPaciente} required disabled={enviando} />
            </div>
            <div className={styles.fieldFull}>
              <ProfissionalSelect value={professionalId} onChange={setProfessionalId} required disabled={enviando} />
            </div>
          </div>
        </section>
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Data e hora</h2>
          <div className={styles.grid}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="data">Data *</label>
              <div className={styles.inputWrapper}>
                <Calendar size={16} className={styles.inputIcon} />
                <input id="data" type="date" className={styles.input} value={data} onChange={(e) => setData(e.target.value)} disabled={enviando} />
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="hora">Hora *</label>
              <div className={styles.inputWrapper}>
                <Clock size={16} className={styles.inputIcon} />
                <input id="hora" type="time" className={styles.input} value={hora} onChange={(e) => setHora(e.target.value)} disabled={enviando} />
              </div>
            </div>
          </div>
        </section>
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Observações (opcional)</h2>
          <textarea className={styles.textarea} rows={4} maxLength={MAX_OBSERVACAO} placeholder="Ex.: primeira sessão..." value={observacao} onChange={(e) => setObservacao(e.target.value.slice(0, MAX_OBSERVACAO))} disabled={enviando} />
          <span className={styles.counter}>{observacao.length}/{MAX_OBSERVACAO}</span>
        </section>
        {erro && <div className={styles.errorBox} role="alert"><AlertCircle size={16} /><span>{erro}</span></div>}
        {sucesso && <div className={styles.successBox} role="status"><CheckCircle2 size={16} /><span>Consulta agendada com sucesso!</span></div>}
        <footer className={styles.actions}>
          <button type="button" className={styles.secondaryButton} onClick={() => navigate("/recepcao/agenda")} disabled={enviando}>Cancelar</button>
          <button type="submit" className={styles.primaryButton} disabled={enviando}>{enviando ? "Agendando..." : "Agendar consulta"}</button>
        </footer>
      </form>
    </section>
  );
}
