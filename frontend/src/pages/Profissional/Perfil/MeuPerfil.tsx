import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  UserCog,
  Lock,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  IdCard,
  Mail,
  Info,
} from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import { useProfissionais } from "../../../contexts/ProfissionaisContext";
import { EspecialidadeCombobox } from "../../../components/EspecialidadeCombobox/EspecialidadeCombobox";
import { maskTelefone } from "../../../utils/masks";
import type { Profissional } from "../../../types/profissional";
import type { Sexo } from "../../../types/paciente";
import styles from "./MeuPerfil.module.css";

interface FormState {
  nome: string;
  telefone: string;
  endereco: string;
  sexo: Sexo;
  especialidade: string;
}

const EMPTY: FormState = {
  nome: "",
  telefone: "",
  endereco: "",
  sexo: "FEMININO",
  especialidade: "",
};

export function MeuPerfil() {
  const { usuario } = useAuth();
  const { getByCpf, upsert } = useProfissionais();

  const profissional = useMemo<Profissional | undefined>(
    () => (usuario ? getByCpf(usuario.cpf) : undefined),
    [usuario, getByCpf]
  );

  const [form, setForm] = useState<FormState>(EMPTY);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);
  const [temAlteracoes, setTemAlteracoes] = useState(false);

  useEffect(() => {
    if (!profissional) return;
    setForm({
      nome: profissional.nome,
      telefone: profissional.telefone,
      endereco: profissional.endereco,
      sexo: profissional.sexo,
      especialidade: profissional.especialidade,
    });
    setTemAlteracoes(false);
  }, [profissional]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setTemAlteracoes(true);
    setSucesso(false);
  };

  const handleDescartar = () => {
    if (!profissional) return;
    setForm({
      nome: profissional.nome,
      telefone: profissional.telefone,
      endereco: profissional.endereco,
      sexo: profissional.sexo,
      especialidade: profissional.especialidade,
    });
    setErro(null);
    setTemAlteracoes(false);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErro(null);
    setSucesso(false);

    if (!profissional) {
      setErro("Profissional não encontrado no sistema.");
      return;
    }

    if (!form.nome.trim()) {
      setErro("Informe seu nome completo.");
      return;
    }

    const atualizado: Profissional = {
      ...profissional,
      nome: form.nome.trim(),
      telefone: form.telefone.trim(),
      endereco: form.endereco.trim(),
      sexo: form.sexo,
      especialidade: form.especialidade.trim(),
      // Campos regulados permanecem intactos:
      // cpf, tipo, crp, crm, status, criadoEm
    };

    // TODO: substituir por PATCH /profissionais/{cpf}
    console.log("[MeuPerfil] atualizar:", atualizado);

    upsert(atualizado);
    setSucesso(true);
    setTemAlteracoes(false);
  };

  if (!usuario || !profissional) {
    return (
      <section className={styles.notFound}>
        <AlertCircle size={32} strokeWidth={1.6} />
        <h2 className={styles.notFoundTitle}>Perfil não encontrado</h2>
        <p className={styles.notFoundText}>
          Não conseguimos localizar os dados deste profissional no sistema.
        </p>
      </section>
    );
  }

  const isPsiquiatra = profissional.tipo === "PSIQUIATRA";
  const registro = isPsiquiatra ? profissional.crm : profissional.crp;
  const conselho = isPsiquiatra ? "CRM" : "CRP";

  const iniciais = profissional.nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");

  return (
    <section className={styles.page}>
      <header className={styles.pageHeader}>
        <div className={styles.pageTitle}>
          <div className={styles.titleIcon}>
            <UserCog size={22} strokeWidth={2} />
          </div>
          <div>
            <h1 className={styles.title}>Meu perfil</h1>
            <p className={styles.subtitle}>
              Gerencie seus dados de contato e sua atuação profissional.
            </p>
          </div>
        </div>
      </header>

      <div className={styles.identityCard}>
        <div className={styles.identityLeft}>
          <div className={styles.avatar}>{iniciais}</div>
          <div className={styles.identityInfo}>
            <h2 className={styles.identityName}>{profissional.nome}</h2>
            <div className={styles.identityMeta}>
              <span
                className={`${styles.badge} ${
                  isPsiquiatra ? styles.badgePsiquiatra : styles.badgePsicologo
                }`}
              >
                {isPsiquiatra ? "Psiquiatra" : "Psicólogo"}
              </span>
              <span className={styles.identityRegistro}>
                <ShieldCheck size={13} aria-hidden="true" />
                {conselho} {registro}
              </span>
            </div>
          </div>
        </div>

        <div className={styles.identityRight}>
          <span className={styles.councilNote}>
            <Info size={13} aria-hidden="true" />
            Registro validado pelo conselho profissional
          </span>
        </div>
      </div>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {/* ---------- Identificação (somente leitura) ---------- */}
        <section className={styles.card}>
          <header className={styles.cardHeader}>
            <IdCard size={18} strokeWidth={2} />
            <h3 className={styles.cardTitle}>Identificação</h3>
            <span className={styles.readOnlyTag}>
              <Lock size={11} aria-hidden="true" />
              Somente leitura
            </span>
          </header>

          <div className={styles.grid}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="cpf">
                CPF
              </label>
              <input
                id="cpf"
                className={`${styles.input} ${styles.inputReadOnly}`}
                value={profissional.cpf}
                readOnly
                tabIndex={-1}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="tipo">
                Tipo de profissional
              </label>
              <input
                id="tipo"
                className={`${styles.input} ${styles.inputReadOnly}`}
                value={isPsiquiatra ? "Psiquiatra" : "Psicólogo"}
                readOnly
                tabIndex={-1}
              />
            </div>

            <div className={`${styles.field} ${styles.fieldFull}`}>
              <label className={styles.label} htmlFor="registro">
                {conselho} — Registro no conselho
              </label>
              <input
                id="registro"
                className={`${styles.input} ${styles.inputReadOnly} ${styles.inputMono}`}
                value={registro}
                readOnly
                tabIndex={-1}
              />
              <span className={styles.hint}>
                O registro não pode ser alterado por aqui. Mudanças exigem
                revalidação junto ao conselho.
              </span>
            </div>
          </div>
        </section>

        {/* ---------- Dados de contato (editáveis) ---------- */}
        <section className={styles.card}>
          <header className={styles.cardHeader}>
            <Mail size={18} strokeWidth={2} />
            <h3 className={styles.cardTitle}>Dados de contato</h3>
            <span className={styles.editTag}>Editável</span>
          </header>

          <div className={styles.grid}>
            <div className={`${styles.field} ${styles.fieldFull}`}>
              <label className={styles.label} htmlFor="nome">
                Nome completo
              </label>
              <input
                id="nome"
                className={styles.input}
                value={form.nome}
                onChange={(e) => update("nome", e.target.value)}
                placeholder="Seu nome completo"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="telefone">
                Telefone
              </label>
              <input
                id="telefone"
                className={styles.input}
                value={form.telefone}
                onChange={(e) => update("telefone", maskTelefone(e.target.value))}
                placeholder="(00) 00000-0000"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="sexo">
                Sexo
              </label>
              <select
                id="sexo"
                className={styles.input}
                value={form.sexo}
                onChange={(e) => update("sexo", e.target.value as Sexo)}
              >
                <option value="FEMININO">Feminino</option>
                <option value="MASCULINO">Masculino</option>
                <option value="OUTRO">Outro</option>
              </select>
            </div>

            <div className={`${styles.field} ${styles.fieldFull}`}>
              <label className={styles.label} htmlFor="email">
                E-mail (login de acesso)
              </label>
              <input
                id="email"
                className={`${styles.input} ${styles.inputReadOnly}`}
                value={profissional.email}
                readOnly
                tabIndex={-1}
              />
              <span className={styles.hint}>
                O e-mail é usado como login e só pode ser alterado pela recepção.
              </span>
            </div>

            <div className={`${styles.field} ${styles.fieldFull}`}>
              <label className={styles.label} htmlFor="endereco">
                Endereço
              </label>
              <input
                id="endereco"
                className={styles.input}
                value={form.endereco}
                onChange={(e) => update("endereco", e.target.value)}
                placeholder="Rua, número, cidade/UF"
              />
            </div>
          </div>
        </section>

        {/* ---------- Atuação (especialidade) ---------- */}
        <section className={styles.card}>
          <header className={styles.cardHeader}>
            <ShieldCheck size={18} strokeWidth={2} />
            <h3 className={styles.cardTitle}>Atuação profissional</h3>
            <span className={styles.editTag}>Editável</span>
          </header>

          <div className={styles.grid}>
            <div className={`${styles.field} ${styles.fieldFull}`}>
              <label className={styles.label} htmlFor="especialidade">
                Especialidade
              </label>
              <EspecialidadeCombobox
                id="especialidade"
                value={form.especialidade}
                onChange={(v) => update("especialidade", v)}
                tipo={profissional.tipo}
                placeholder={
                  isPsiquiatra
                    ? "Ex.: Psiquiatria Clínica"
                    : "Ex.: Terapia Cognitivo-Comportamental"
                }
              />
              <span className={styles.hint}>
                Selecione uma sugestão ou digite livremente.
              </span>
            </div>
          </div>
        </section>

        {erro && (
          <div className={styles.errorBox} role="alert">
            <AlertCircle size={16} />
            <span>{erro}</span>
          </div>
        )}

        {sucesso && (
          <div className={styles.successBox} role="status">
            <CheckCircle2 size={16} />
            <span>Dados atualizados com sucesso.</span>
          </div>
        )}

        <footer className={styles.actions}>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={handleDescartar}
            disabled={!temAlteracoes}
          >
            <RotateCcw size={15} />
            <span>Descartar</span>
          </button>
          <button
            type="submit"
            className={styles.primaryButton}
            disabled={!temAlteracoes}
          >
            <Save size={15} />
            <span>Salvar alterações</span>
          </button>
        </footer>
      </form>

      <div className={styles.lgpdNote}>
        <ShieldCheck size={16} strokeWidth={2} />
        <span>
          Dados sensíveis protegidos pela LGPD. Alterações cadastrais são
          registradas para fins de auditoria.
        </span>
      </div>
    </section>
  );
}
