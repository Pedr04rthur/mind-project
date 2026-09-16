import { useState, type FormEvent } from "react";
import {
  X,
  UserPlus,
  KeyRound,
  Stethoscope,
  AlertCircle,
  BadgeCheck,
} from "lucide-react";
import { maskCpf, maskTelefone } from "../../../utils/masks";
import type {
  Profissional,
  ProfissionalFormData,
  TipoProfissional,
} from "../../../types/profissional";
import type { Sexo } from "../../../types/paciente";
import styles from "./ProfissionalFormModal.module.css";

interface ProfissionalFormModalProps {
  profissional: Profissional | null;
  onClose: () => void;
  onSave: (profissional: Profissional) => void;
}

const INITIAL: ProfissionalFormData = {
  cpf: "",
  nome: "",
  telefone: "",
  endereco: "",
  sexo: "FEMININO",
  email: "",
  tipo: "PSICOLOGO",
  crp: "",
  crm: "",
  especialidade: "",
  login: "",
  senha: "",
  confirmarSenha: "",
};

export function ProfissionalFormModal({
  profissional,
  onClose,
  onSave,
}: ProfissionalFormModalProps) {
  const isEdicao = profissional !== null;

  const [dados, setDados] = useState<ProfissionalFormData>(() =>
    profissional
      ? {
          cpf: profissional.cpf,
          nome: profissional.nome,
          telefone: profissional.telefone,
          endereco: profissional.endereco,
          sexo: profissional.sexo,
          email: profissional.email,
          tipo: profissional.tipo,
          crp: profissional.crp,
          crm: profissional.crm,
          especialidade: profissional.especialidade,
          login: profissional.email,
          senha: "",
          confirmarSenha: "",
        }
      : INITIAL
  );

  const [erro, setErro] = useState<string | null>(null);

  const update = <K extends keyof ProfissionalFormData>(
    key: K,
    value: ProfissionalFormData[K]
  ) => setDados((d) => ({ ...d, [key]: value }));

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErro(null);

    if (!dados.cpf || !dados.nome || !dados.email) {
      setErro("Preencha CPF, nome e e-mail.");
      return;
    }

    if (dados.tipo === "PSIQUIATRA" && !dados.crm.trim()) {
      setErro("Psiquiatras precisam informar o CRM.");
      return;
    }

    if (dados.tipo === "PSICOLOGO" && !dados.crp.trim()) {
      setErro("Psicólogos precisam informar o CRP.");
      return;
    }

    if (!isEdicao) {
      if (!dados.login || !dados.senha) {
        setErro("Defina login e senha de acesso do profissional.");
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

    const salvo: Profissional = {
      cpf: dados.cpf,
      nome: dados.nome,
      telefone: dados.telefone,
      endereco: dados.endereco,
      sexo: dados.sexo,
      email: dados.email,
      tipo: dados.tipo,
      crp: dados.tipo === "PSICOLOGO" ? dados.crp.trim() : "",
      crm: dados.tipo === "PSIQUIATRA" ? dados.crm.trim() : "",
      especialidade: dados.especialidade.trim(),
      status: profissional?.status ?? "ATIVO",
      criadoEm: profissional?.criadoEm ?? new Date().toISOString().slice(0, 10),
    };

    // TODO: enviar para o backend
    // POST /profissionais + POST /usuarios-autenticacao (perfil=PSICOLOGO|PSIQUIATRA)
    console.log("[ProfissionalFormModal] salvar:", {
      profissional: salvo,
      credenciais: isEdicao
        ? undefined
        : {
            login: dados.login,
            senha: dados.senha,
            perfil: dados.tipo,
          },
    });

    onSave(salvo);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <header className={styles.modalHeader}>
          <div>
            <h2 className={styles.modalTitle}>
              {isEdicao ? "Editar profissional" : "Cadastrar profissional"}
            </h2>
            <p className={styles.modalSubtitle}>
              {isEdicao
                ? "Atualize os dados cadastrais do profissional."
                : "Preencha os dados para cadastrar um novo profissional."}
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
              <Stethoscope size={16} strokeWidth={2} />
              Tipo de profissional
            </legend>

            <div className={styles.typeGroup}>
              {(["PSICOLOGO", "PSIQUIATRA"] as TipoProfissional[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`${styles.typeOption} ${
                    dados.tipo === t ? styles.typeActive : ""
                  }`}
                  onClick={() => update("tipo", t)}
                  aria-pressed={dados.tipo === t}
                >
                  <span className={styles.typeTitle}>
                    {t === "PSICOLOGO" ? "Psicólogo" : "Psiquiatra"}
                  </span>
                  <span className={styles.typeHint}>
                    {t === "PSICOLOGO"
                      ? "Registro CRP. Pode recomendar terapias."
                      : "Registro CRM. Pode prescrever medicamentos."}
                  </span>
                </button>
              ))}
            </div>
          </fieldset>

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

              <div className={`${styles.field} ${styles.fieldFull}`}>
                <label className={styles.label} htmlFor="nome">
                  Nome completo *
                </label>
                <input
                  id="nome"
                  className={styles.input}
                  value={dados.nome}
                  onChange={(e) => update("nome", e.target.value)}
                  placeholder="Ex.: Dra. Marina Alencar"
                />
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

              <div className={styles.field}>
                <label className={styles.label} htmlFor="email">
                  E-mail *
                </label>
                <input
                  id="email"
                  type="email"
                  className={styles.input}
                  value={dados.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="profissional@exemplo.com"
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

          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>
              <BadgeCheck size={16} strokeWidth={2} />
              Registro profissional
            </legend>

            <div className={styles.grid}>
              {dados.tipo === "PSICOLOGO" ? (
                <div className={`${styles.field} ${styles.fieldFull}`}>
                  <label className={styles.label} htmlFor="crp">
                    CRP *
                  </label>
                  <input
                    id="crp"
                    className={styles.input}
                    value={dados.crp}
                    onChange={(e) => update("crp", e.target.value)}
                    placeholder="CRP-13 00000"
                  />
                  <span className={styles.hint}>
                    Validação simulada (sem consulta real ao Conselho).
                  </span>
                </div>
              ) : (
                <div className={`${styles.field} ${styles.fieldFull}`}>
                  <label className={styles.label} htmlFor="crm">
                    CRM *
                  </label>
                  <input
                    id="crm"
                    className={styles.input}
                    value={dados.crm}
                    onChange={(e) => update("crm", e.target.value)}
                    placeholder="CRM-PB 00000"
                  />
                  <span className={styles.hint}>
                    Necessário para emissão de prescrições de medicamentos.
                  </span>
                </div>
              )}

              <div className={`${styles.field} ${styles.fieldFull}`}>
                <label className={styles.label} htmlFor="especialidade">
                  Especialidade
                </label>
                <input
                  id="especialidade"
                  className={styles.input}
                  value={dados.especialidade}
                  onChange={(e) => update("especialidade", e.target.value)}
                  placeholder={
                    dados.tipo === "PSIQUIATRA"
                      ? "Ex.: Psiquiatria Clínica"
                      : "Ex.: Terapia Cognitivo-Comportamental"
                  }
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
              {isEdicao ? "Salvar alterações" : "Cadastrar profissional"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
