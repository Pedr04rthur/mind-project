import { useState, type FormEvent } from "react";
import { X, AlertCircle, CheckCircle2 } from "lucide-react";
import { maskCpf, maskTelefone } from "../../../utils/masks";
import { isValidCPF } from "../../../utils/cpf";
import type { Paciente, PacienteFormData } from "../../../types/paciente";
import styles from "./PacienteFormModal.module.css";

interface PacienteFormModalProps {
  paciente: Paciente | null;
  onClose: () => void;
  onSave: (paciente: Paciente, senha: string) => Promise<void>;
}

const INITIAL: PacienteFormData = {
  cpf: "",
  nome: "",
  telefone: "",
  endereco: "",
  email: "",
  login: "",
  senha: "",
  confirmarSenha: "",
};

export function PacienteFormModal({
  paciente,
  onClose,
  onSave,
}: PacienteFormModalProps) {
  const isEdicao = paciente !== null;

  const [dados, setDados] = useState<PacienteFormData>(() =>
    paciente
      ? {
          cpf: paciente.cpf,
          nome: paciente.nome,
          telefone: paciente.telefone,
          endereco: paciente.endereco,
          email: paciente.email,
          login: paciente.email,
          senha: "",
          confirmarSenha: "",
        }
      : INITIAL
  );

  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [cpfTocado, setCpfTocado] = useState(false);

  const update = <K extends keyof PacienteFormData>(
    key: K,
    value: PacienteFormData[K]
  ) => setDados((d) => ({ ...d, [key]: value }));

  const cpfDigits = dados.cpf.replace(/\D/g, "");
  const cpfValido = isValidCPF(dados.cpf);
  const cpfInvalido =
    (cpfTocado || cpfDigits.length === 11) && !cpfValido && cpfDigits.length > 0;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErro(null);

    if (!dados.cpf || !dados.nome || !dados.email) {
      setErro("Preencha CPF, nome e e-mail.");
      return;
    }

    if (!isValidCPF(dados.cpf)) {
      setErro("CPF inválido. Verifique os dígitos e tente novamente.");
      setCpfTocado(true);
      return;
    }

    if (!isEdicao) {
      if (!dados.senha || !dados.confirmarSenha) {
        setErro("Defina a senha de acesso do paciente.");
        return;
      }
      if (dados.senha !== dados.confirmarSenha) {
        setErro("As senhas não conferem.");
        return;
      }
      if (dados.senha.length < 6) {
        setErro("A senha deve ter pelo menos 6 caracteres.");
        return;
      }
    }

    const pacienteSalvo: Paciente = {
      id: paciente?.id,
      cpf: dados.cpf,
      nome: dados.nome,
      telefone: dados.telefone,
      endereco: dados.endereco,
      email: dados.email,
      status: paciente?.status ?? "ATIVO",
      prioridade: paciente?.prioridade ?? "BAIXA",
    };

    setEnviando(true);
    try {
      await onSave(pacienteSalvo, dados.senha);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Erro ao salvar paciente";
      setErro(msg);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <header className={styles.modalHeader}>
          <div>
            <h2 className={styles.modalTitle}>
              {isEdicao ? "Editar paciente" : "Cadastrar paciente"}
            </h2>
            <p className={styles.modalSubtitle}>
              {isEdicao
                ? "Atualize os dados cadastrais do paciente."
                : "Preencha os dados para cadastrar um novo paciente."}
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

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Dados do paciente</h3>

            <div className={styles.grid}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="cpf">
                  CPF
                </label>
                <div className={styles.inputWrapper}>
                  <input
                    id="cpf"
                    className={`${styles.input} ${
                      cpfInvalido ? styles.inputError : ""
                    } ${cpfValido ? styles.inputSuccess : ""}`}
                    value={dados.cpf}
                    onChange={(e) => update("cpf", maskCpf(e.target.value))}
                    onBlur={() => setCpfTocado(true)}
                    placeholder="000.000.000-00"
                    disabled={isEdicao || enviando}
                    aria-invalid={cpfInvalido}
                    aria-describedby={cpfInvalido ? "cpf-erro" : undefined}
                    autoComplete="off"
                  />
                  {cpfValido && (
                    <CheckCircle2
                      size={16}
                      className={styles.inputStatusIcon}
                      aria-hidden="true"
                    />
                  )}
                </div>
                {cpfInvalido && (
                  <span id="cpf-erro" className={styles.fieldError}>
                    CPF inválido. Confira os dígitos.
                  </span>
                )}
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="telefone">
                  Telefone
                </label>
                <input
                  id="telefone"
                  className={styles.input}
                  value={dados.telefone}
                  onChange={(e) =>
                    update("telefone", maskTelefone(e.target.value))
                  }
                  placeholder="(00) 00000-0000"
                  disabled={enviando}
                />
              </div>

              <div className={`${styles.field} ${styles.fieldFull}`}>
                <label className={styles.label} htmlFor="nome">
                  Nome completo
                </label>
                <input
                  id="nome"
                  className={styles.input}
                  value={dados.nome}
                  onChange={(e) => update("nome", e.target.value)}
                  placeholder="Ex.: Ana Carolina Souza"
                  disabled={enviando}
                />
              </div>

              <div className={`${styles.field} ${styles.fieldFull}`}>
                <label className={styles.label} htmlFor="email">
                  E-mail
                </label>
                <input
                  id="email"
                  type="email"
                  className={styles.input}
                  value={dados.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="paciente@exemplo.com"
                  disabled={enviando}
                />
              </div>

              <div className={`${styles.field} ${styles.fieldFull}`}>
                <label className={styles.label} htmlFor="endereco">
                  Endereço
                </label>
                <input
                  id="endereco"
                  className={styles.input}
                  value={dados.endereco}
                  onChange={(e) => update("endereco", e.target.value)}
                  placeholder="Rua, número, cidade/UF"
                  disabled={enviando}
                />
              </div>
            </div>
          </section>

          {!isEdicao && (
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Credenciais de acesso</h3>

              <div className={styles.grid}>
                <div className={`${styles.field} ${styles.fieldFull}`}>
                  <label className={styles.label} htmlFor="senha">
                    Senha
                  </label>
                  <input
                    id="senha"
                    type="password"
                    className={styles.input}
                    value={dados.senha}
                    onChange={(e) => update("senha", e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    disabled={enviando}
                  />
                </div>

                <div className={`${styles.field} ${styles.fieldFull}`}>
                  <label className={styles.label} htmlFor="confirmarSenha">
                    Confirmar senha
                  </label>
                  <input
                    id="confirmarSenha"
                    type="password"
                    className={styles.input}
                    value={dados.confirmarSenha}
                    onChange={(e) => update("confirmarSenha", e.target.value)}
                    placeholder="Repita a senha"
                    disabled={enviando}
                  />
                </div>
              </div>
            </section>
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
              disabled={enviando}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.primaryButton}
              disabled={enviando || cpfInvalido}
            >
              {enviando
                ? "Salvando..."
                : isEdicao
                ? "Salvar alterações"
                : "Cadastrar paciente"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}