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
import { isValidCRP, isValidCRM } from "../../../utils/registros";
import { CRPInput } from "../../../components/RegistroProfissionalInput/CRPInput";
import { CRMInput } from "../../../components/RegistroProfissionalInput/CRMInput";
import { EspecialidadeCombobox } from "../../../components/EspecialidadeCombobox/EspecialidadeCombobox";
import { TipoProfissionalSelector } from "../../../components/TipoProfissionalSelector/TipoProfissionalSelector";
import type {
  Profissional,
  ProfissionalFormData,
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

    if (dados.tipo === "PSIQUIATRA" && !isValidCRM(dados.crm)) {
      setErro(
        "CRM inválido. Use o formato CRM-UF 00000 (ex.: CRM-PB 12345)."
      );
      return;
    }

    if (dados.tipo === "PSICOLOGO" && !isValidCRP(dados.crp)) {
      setErro(
        "CRP inválido. Use o formato CRP-XX 00000 (ex.: CRP-13 12345)."
      );
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

            <TipoProfissionalSelector
              value={dados.tipo}
              onChange={(tipo) => update("tipo", tipo)}
            />
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
              <div className={`${styles.field} ${styles.fieldFull}`}>
                {dados.tipo === "PSICOLOGO" ? (
                  <>
                    <label className={styles.label} htmlFor="crp">
                      CRP *
                    </label>
                    <CRPInput
                      id="crp"
                      value={dados.crp}
                      onChange={(v) => update("crp", v)}
                      required
                    />
                  </>
                ) : (
                  <>
                    <label className={styles.label} htmlFor="crm">
                      CRM *
                    </label>
                    <CRMInput
                      id="crm"
                      value={dados.crm}
                      onChange={(v) => update("crm", v)}
                      required
                    />
                  </>
                )}
              </div>

              <div className={`${styles.field} ${styles.fieldFull}`}>
                <label className={styles.label} htmlFor="especialidade">
                  Especialidade
                </label>
                <EspecialidadeCombobox
                  id="especialidade"
                  value={dados.especialidade}
                  onChange={(v) => update("especialidade", v)}
                  tipo={dados.tipo}
                  placeholder={
                    dados.tipo === "PSIQUIATRA"
                      ? "Ex.: Psiquiatria Clínica"
                      : "Ex.: Terapia Cognitivo-Comportamental"
                  }
                />
                <span className={styles.hint}>
                  Selecione uma sugestão ou digite livremente.
                </span>
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
