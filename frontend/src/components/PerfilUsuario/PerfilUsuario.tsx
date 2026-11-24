import { useEffect, useState } from "react";
import {
  User,
  UserCog,
  IdCard,
  Mail,
  ShieldCheck,
  Stethoscope,
  Lock,
  RefreshCw,
  AlertCircle,
  Info,
} from "lucide-react";

import { api, ApiError } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import type { MeApiResponse } from "../../types/auth";

import styles from "../../pages/Profissional/Perfil/MeuPerfil.module.css";

interface Props {
  perfil: "PACIENTE" | "PROFISSIONAL";
}

interface CampoProps {
  label: string;
  value?: string | number | null;
  full?: boolean;
}

function Campo({ label, value, full }: CampoProps) {
  return (
    <div
      className={`${styles.field} ${
        full ? styles.fieldFull : ""
      }`}
    >
      <label className={styles.label}>
        {label}

        <input
          className={`${styles.input} ${styles.inputReadOnly}`}
          value={
            value === null ||
            value === undefined ||
            value === ""
              ? "Não informado"
              : String(value)
          }
          readOnly
          aria-label={label}
        />
      </label>
    </div>
  );
}

function formatarCpf(cpf?: string | null) {
  if (!cpf) return "";

  const numeros = cpf.replace(/\D/g, "");

  if (numeros.length !== 11) return cpf;

  return numeros.replace(
    /^(\d{3})(\d{3})(\d{3})(\d{2})$/,
    "$1.$2.$3-$4"
  );
}

function formatarTelefone(telefone?: string | null) {
  if (!telefone) return "";

  const numeros = telefone.replace(/\D/g, "");

  if (numeros.length === 11) {
    return numeros.replace(
      /^(\d{2})(\d{5})(\d{4})$/,
      "($1) $2-$3"
    );
  }

  if (numeros.length === 10) {
    return numeros.replace(
      /^(\d{2})(\d{4})(\d{4})$/,
      "($1) $2-$3"
    );
  }

  return telefone;
}

function getIniciais(nome: string) {
  return nome
    .trim()
    .replace(/^(Dr\.|Dra\.)\s*/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase())
    .join("");
}

export function PerfilUsuario({ perfil }: Props) {
  const { usuario } = useAuth();

  const email = usuario?.emailLogin;

  const [dados, setDados] =
    useState<MeApiResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [versao, setVersao] = useState(0);

  const isPaciente = perfil === "PACIENTE";

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      setLoading(true);
      setErro(null);
      setDados(null);

      try {
        const resposta = await api.auth.me();

        const perfilEsperado = isPaciente
          ? "PATIENT"
          : "PROFESSIONAL";

        if (resposta.profile !== perfilEsperado) {
          throw new Error(
            "O perfil retornado não corresponde à conta autenticada."
          );
        }

        if (ativo) {
          setDados(resposta);
        }
      } catch (err) {
        if (!ativo) return;

        setErro(
          err instanceof ApiError || err instanceof Error
            ? err.message
            : "Não foi possível carregar seu perfil."
        );
      } finally {
        if (ativo) setLoading(false);
      }
    }

    if (email) {
      void carregar();
    } else {
      setDados(null);
      setLoading(false);
      setErro("Usuário não autenticado.");
    }

    return () => {
      ativo = false;
    };
  }, [email, isPaciente, versao]);

  if (loading) {
    return (
      <section className={styles.notFound}>
        <RefreshCw size={32} />
        <h2 className={styles.notFoundTitle}>
          Carregando perfil...
        </h2>
        <p className={styles.notFoundText}>
          Consultando seus dados cadastrais.
        </p>
      </section>
    );
  }

  if (erro || !dados) {
    return (
      <section className={styles.notFound}>
        <AlertCircle size={32} />

        <h2 className={styles.notFoundTitle}>
          Não foi possível carregar o perfil
        </h2>

        <p className={styles.notFoundText}>
          {erro ?? "Dados não encontrados."}
        </p>

        <button
          type="button"
          className={styles.secondaryButton}
          onClick={() => setVersao((v) => v + 1)}
        >
          <RefreshCw size={15} />
          Tentar novamente
        </button>
      </section>
    );
  }

  return (
    <section className={styles.page}>
      <header className={styles.pageHeader}>
        <div className={styles.pageTitle}>
          <div className={styles.titleIcon}>
            {isPaciente ? (
              <User size={22} />
            ) : (
              <UserCog size={22} />
            )}
          </div>

          <div>
            <h1 className={styles.title}>
              Meu perfil
            </h1>

            <p className={styles.subtitle}>
              {isPaciente
                ? "Consulte seus dados pessoais e informações da conta."
                : "Consulte seus dados cadastrais e sua atuação profissional."}
            </p>
          </div>
        </div>

        <button
          type="button"
          className={styles.secondaryButton}
          onClick={() => setVersao((v) => v + 1)}
        >
          <RefreshCw size={15} />
          Atualizar
        </button>
      </header>

      <div className={styles.identityCard}>
        <div className={styles.identityLeft}>
          <div className={styles.avatar}>
            {getIniciais(dados.nome)}
          </div>

          <div className={styles.identityInfo}>
            <h2 className={styles.identityName}>
              {dados.nome}
            </h2>

            <div className={styles.identityMeta}>
              <span
                className={`${styles.badge} ${styles.badgePsicologo}`}
              >
                {isPaciente
                  ? "Paciente"
                  : "Profissional de saúde"}
              </span>
            </div>

            <span className={styles.subtitle}>
              {dados.email}
            </span>
          </div>
        </div>

        <div className={styles.identityRight}>
          <span className={styles.councilNote}>
            <ShieldCheck size={14} />
            Conta autenticada
          </span>
        </div>
      </div>

      <div className={styles.form}>
        <section className={styles.card}>
          <header className={styles.cardHeader}>
            <IdCard size={18} />

            <h3 className={styles.cardTitle}>
              Identificação
            </h3>

            <span className={styles.readOnlyTag}>
              <Lock size={11} />
              Somente leitura
            </span>
          </header>

          <div className={styles.grid}>
            <Campo
              label="Nome completo"
              value={dados.nome}
              full
            />

            <Campo
              label="Código de cadastro"
              value={dados.id}
            />

            <Campo
              label="Tipo de usuário"
              value={
                isPaciente
                  ? "Paciente"
                  : "Profissional"
              }
            />

            {isPaciente && (
              <Campo
                label="CPF"
                value={formatarCpf(dados.cpf)}
                full
              />
            )}
          </div>
        </section>

        <section className={styles.card}>
          <header className={styles.cardHeader}>
            <Mail size={18} />

            <h3 className={styles.cardTitle}>
              Dados de contato
            </h3>

            <span className={styles.readOnlyTag}>
              <Lock size={11} />
              Somente leitura
            </span>
          </header>

          <div className={styles.grid}>
            <Campo
              label="E-mail de acesso"
              value={dados.email}
              full
            />

            {isPaciente && (
              <>
                <Campo
                  label="Telefone"
                  value={formatarTelefone(dados.telefone)}
                  full
                />

                <Campo
                  label="Endereço"
                  value={dados.endereco}
                  full
                />
              </>
            )}
          </div>
        </section>

        {!isPaciente && (
          <section className={styles.card}>
            <header className={styles.cardHeader}>
              <Stethoscope size={18} />

              <h3 className={styles.cardTitle}>
                Atuação profissional
              </h3>

              <span className={styles.readOnlyTag}>
                <Lock size={11} />
                Somente leitura
              </span>
            </header>

            <div className={styles.grid}>
              <Campo
                label="Especialidade"
                value={dados.especialidade}
                full
              />

              <Campo
                label="Registro CRM/CRP"
                value="Não disponível no cadastro atual"
                full
              />
            </div>

            <span className={styles.hint}>
              O registro no conselho profissional ainda
              não está integrado ao cadastro do servidor.
            </span>
          </section>
        )}

        <section className={styles.card}>
          <header className={styles.cardHeader}>
            <ShieldCheck size={18} />

            <h3 className={styles.cardTitle}>
              Informações da conta
            </h3>
          </header>

          <div className={styles.grid}>
            <Campo
              label="Login"
              value={dados.email}
              full
            />

            <Campo
              label="Senha"
              value="••••••••"
              full
            />
          </div>

          <span className={styles.hint}>
            A senha real não é exibida por motivos de segurança.
          </span>
        </section>
      </div>

      <div className={styles.lgpdNote}>
        <Info size={18} />

        <span>
          Esta página apresenta os dados da sua conta.
          Para solicitar alterações cadastrais, entre em
          contato com a recepção da clínica.
        </span>
      </div>
    </section>
  );
}
