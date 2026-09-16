import { useState, type FormEvent } from "react";
import { X, UserPlus, KeyRound, ClipboardList, AlertCircle } from "lucide-react";
import { maskCpf, maskTelefone } from "../../../utils/masks";
import type {
  Paciente,
  PacienteFormData,
  Prioridade,
  Sexo,
} from "../../../types/paciente";
import styles from "./PacienteFormModal.module.css";

interface PacienteFormModalProps {
  paciente: Paciente | null;
  onClose: () => void;
  onSave: (paciente: Paciente) => void;
}

const INITIAL: PacienteFormData = {
  cpf: "",
  nome: "",
  telefone: "",
  endereco: "",
  sexo: "FEMININO",
  email: "",
  dataNasc: "",
  login: "",
  senha: "",
  confirmarSenha: "",
  prioridade: "BAIXA",
  observacao: "",
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
          sexo: paciente.sexo,
          email: paciente.email,
          dataNasc: paciente.dataNasc,
          login: paciente.email,
          senha: "",
          confirmarSenha: "",
          prioridade: paciente.prioridade,
          observacao: paciente.observacao,
        }
      : INITIAL
  );

  const [erro, setErro] = useState<string | null>(null);

  const update = <K extends keyof PacienteFormData>(
    key: K,
    value: PacienteFormData[K]
  ) => setDados((d) => ({ ...d, [key]: value }));

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErro(null);

    if (!dados.cpf || !dados.nome || !dados.dataNasc || !dados.email) {
      setErro("Preencha CPF, nome, data de nascimento e e-mail.");
      return;
    }

    if (!isEdicao) {
      if (!dados.login || !dados.senha) {
        setErro("Defina login e senha de acesso ao paciente.");
        return;
      }
      if (dados.senha !== dados.confirmarSenha) {
        setErro("As senhas não conferem.");
        return;
      }
    }

    const pacienteSalvo: Paciente = {
      cpf: dados.cpf,
      nome: dados.nome,
      telefone: dados.telefone,
      endereco: dados.endereco,
      sexo: dados.sexo,
      email: dados.email,
      dataNasc: dados.dataNasc,
      status: paciente?.status ?? "ATIVO",
      prioridade: dados.prioridade,
      observacao: dados.observacao,
      criadoEm: paciente?.criadoEm ?? new Date().toISOString().slice(0, 10),
    };

    // TODO: enviar para o backend
    // POST /pacientes + POST /usuarios-autenticacao
    console.log("[PacienteFormModal] salvar:", {
      paciente: pacienteSalvo,
      credenciais: isEdicao
        ? undefined
        : { login: dados.login, senha: dados.senha, perfil: "PACIENTE" },
    });

    onSave(pacienteSalvo);
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
          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>
              <UserPlus size={16} strokeWidth={2} />
              Dados pessoais
            </legend>

            <div className={styles.grid}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="cpf">
                  CPF *
                </label>
                <input
                  id="cpf"
                  className={styles.input}
                  value={dados.cpf}
                  onChange={(e) => update("cpf", maskCpf(e.target.value))}
                  placeholder="000.000.000-00"
                  disabled={isEdicao}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="dataNasc">
                  Data de nascimento *
                </label>
                <input
                  id="dataNasc"
                  type="date"
                  className={styles.input}
                  value={dados.dataNasc}
                  onChange={(e) => update("dataNasc", e.target.value)}
                />
              </div>

              <div className={`${styles.field} ${styles.fieldFull}`}>
                <label className={styles.label} htmlFor="nome">
                  Nome completo *
                </label>
                <input
                  id="nome"
                  className={styles.input}
                  value={dados.nome}
                  onChange={(e) => update("nome", e.target.value)}
                  placeholder="Ex.: Ana Carolina Souza"
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="sexo">
                  Sexo
                </label>
                <select
                  id="sexo"
                  className={styles.input}
                  value={dados.sexo}
                  onChange={(e) => update("sexo", e.target.value as Sexo)}
                >
                  <option value="FEMININO">Feminino</option>
                  <option value="MASCULINO">Masculino</option>
                  <option value="OUTRO">Outro</option>
                </select>
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="telefone">
                  Telefone
                </label>
                <input
                  id="telefone"
                  className={styles.input}
                  value={dados.telefone}
                  onChange={(e) => update("telefone", maskTelefone(e.target.value))}
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div className={`${styles.field} ${styles.fieldFull}`}>
                <label className={styles.label} htmlFor="email">
                  E-mail *
                </label>
                <input
                  id="email"
                  type="email"
                  className={styles.input}
                  value={dados.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="paciente@exemplo.com"
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
                />
              </div>
            </div>
          </fieldset>

          {!isEdicao && (
            <fieldset className={styles.fieldset}>
              <legend className={styles.legend}>
                <KeyRound size={16} strokeWidth={2} />
                Credenciais de acesso
              </legend>

              <div className={styles.grid}>
                <div className={`${styles.field} ${styles.fieldFull}`}>
                  <label className={styles.label} htmlFor="login">
                    Login *
                  </label>
                  <input
                    id="login"
                    className={styles.input}
                    value={dados.login}
                    onChange={(e) => update("login", e.target.value)}
                    placeholder="E-mail ou CPF"
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="senha">
                    Senha *
                  </label>
                  <input
                    id="senha"
                    type="password"
                    className={styles.input}
                    value={dados.senha}
                    onChange={(e) => update("senha", e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="confirmarSenha">
                    Confirmar senha *
                  </label>
                  <input
                    id="confirmarSenha"
                    type="password"
                    className={styles.input}
                    value={dados.confirmarSenha}
                    onChange={(e) => update("confirmarSenha", e.target.value)}
                    placeholder="Repita a senha"
                  />
                </div>
              </div>
            </fieldset>
          )}

          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>
              <ClipboardList size={16} strokeWidth={2} />
              Triagem
            </legend>

            <div className={styles.grid}>
              <div className={`${styles.field} ${styles.fieldFull}`}>
                <label className={styles.label}>Prioridade</label>
                <div className={styles.priorityGroup}>
                  {(["BAIXA", "MEDIA", "ALTA"] as Prioridade[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      className={`${styles.priorityOption} ${
                        dados.prioridade === p ? styles.priorityActive : ""
                      }`}
                      onClick={() => update("prioridade", p)}
                    >
                      {p === "BAIXA" ? "Baixa" : p === "MEDIA" ? "Média" : "Alta"}
                    </button>
                  ))}
                </div>
              </div>

              <div className={`${styles.field} ${styles.fieldFull}`}>
                <label className={styles.label} htmlFor="observacao">
                  Observação
                </label>
                <textarea
                  id="observacao"
                  className={styles.textarea}
                  rows={3}
                  value={dados.observacao}
                  onChange={(e) => update("observacao", e.target.value)}
                  placeholder="Anotações da recepção sobre a triagem inicial."
                />
              </div>
            </div>
          </fieldset>

          {erro && (
            <div className={styles.errorBox}>
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
              {isEdicao ? "Salvar alterações" : "Cadastrar paciente"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
