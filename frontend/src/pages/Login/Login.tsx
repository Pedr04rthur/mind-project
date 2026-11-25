import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Lock,
  User,
  ChevronDown,
  HeartPulse,
  Stethoscope,
  Users,
} from "lucide-react";
import mindguy from "../../assets/images/mindguy.png";
import { useAuth, getHomeDoPerfil } from "../../contexts/AuthContext";
import type { PerfilUsuario } from "../../types/auth";
import { ApiError } from "../../services/api";
import styles from "./Login.module.css";

interface PerfilOpcao {
  id: PerfilUsuario;
  label: string;
  hint: string;
  icon: typeof HeartPulse;
}

const PERFIS: PerfilOpcao[] = [
  { id: "PACIENTE", label: "Paciente", hint: "Diário de humor", icon: HeartPulse },
  { id: "PROFISSIONAL", label: "Profissional", hint: "Painel clínico", icon: Stethoscope },
  { id: "RECEPCAO", label: "Recepção", hint: "Gestão da clínica", icon: Users },
];

const ROTULO_PERFIL: Record<PerfilUsuario, string> = {
  PACIENTE: "Paciente",
  PROFISSIONAL: "Profissional",
  RECEPCAO: "Recepção",
};

export function Login() {
  const navigate = useNavigate();
  const { entrar } = useAuth();

  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [perfilSelecionado, setPerfilSelecionado] =
    useState<PerfilUsuario | null>(null);
  const [perfilAberto, setPerfilAberto] = useState(false);

  const opcaoAtual = PERFIS.find((p) => p.id === perfilSelecionado) ?? null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErro(null);

    if (!perfilSelecionado) {
      setErro("Selecione seu perfil para continuar.");
      return;
    }
    if (!login.trim() || !senha) {
      setErro("Preencha login e senha para continuar.");
      return;
    }

    setLoading(true);
    try {
      const perfilReal = await entrar(login.trim(), senha);

      if (perfilReal !== perfilSelecionado) {
        setErro(
          `Essa conta é de ${ROTULO_PERFIL[perfilReal]}, não de ${ROTULO_PERFIL[perfilSelecionado]}.`
        );
        return;
      }

      navigate(getHomeDoPerfil(perfilReal), { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) setErro("Email ou senha inválidos.");
        else setErro(err.message);
      } else {
        setErro("Não foi possível entrar. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.brandPanel}>
        <div className={styles.brandContent}>
          <div className={styles.brandMark}>
            <img src={mindguy} alt="MindCare" className={styles.brandLogo} />
            <span>MindCare</span>
          </div>
          <h1 className={styles.brandTitle}>
            Cuidado contínuo em saúde mental.
          </h1>
          <p className={styles.brandSubtitle}>
            Acompanhe seu bem-estar, compartilhe seu diário com seu terapeuta
            e mantenha sua jornada terapêutica em um só lugar.
          </p>
        </div>
      </section>

      <section className={styles.formPanel}>
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <header className={styles.formHeader}>
            <div className={styles.mobileBrand}>
              <img
                src={mindguy}
                alt="MindCare"
                className={styles.mobileBrandLogo}
              />
              <span>MindCare</span>
            </div>
            <h2 className={styles.formTitle}>Bem-vindo</h2>
            <p className={styles.formSubtitle}>Faça o login</p>
          </header>

          <div className={styles.perfilField}>
            <label className={styles.label}>Selecione seu perfil</label>

            <button
              type="button"
              className={`${styles.perfilTrigger} ${
                perfilAberto ? styles.perfilTriggerAberto : ""
              }`}
              onClick={() => setPerfilAberto((v) => !v)}
              aria-expanded={perfilAberto}
              aria-haspopup="listbox"
            >
              {opcaoAtual ? (
                <span className={styles.perfilTriggerConteudo}>
                  <span className={styles.perfilTriggerIcone}>
                    <opcaoAtual.icon size={18} strokeWidth={2} />
                  </span>
                  <span className={styles.perfilTriggerTextos}>
                    <span className={styles.perfilTriggerLabel}>
                      {opcaoAtual.label}
                    </span>
                    <span className={styles.perfilTriggerHint}>
                      {opcaoAtual.hint}
                    </span>
                  </span>
                </span>
              ) : (
                <span className={styles.perfilPlaceholder}>
                  Escolha uma opção
                </span>
              )}
              <ChevronDown
                size={18}
                className={`${styles.perfilChevron} ${
                  perfilAberto ? styles.perfilChevronAberto : ""
                }`}
              />
            </button>

            {perfilAberto && (
              <div className={styles.perfilOpcoes} role="listbox">
                {PERFIS.map((opcao) => {
                  const Icone = opcao.icon;
                  const ativo = perfilSelecionado === opcao.id;
                  return (
                    <button
                      key={opcao.id}
                      type="button"
                      role="option"
                      aria-selected={ativo}
                      className={`${styles.perfilOpcao} ${
                        ativo ? styles.perfilOpcaoAtiva : ""
                      }`}
                      onClick={() => {
                        setPerfilSelecionado(opcao.id);
                        setPerfilAberto(false);
                        setErro(null);
                      }}
                    >
                      <span className={styles.perfilOpcaoIcone}>
                        <Icone size={18} strokeWidth={2} />
                      </span>
                      <span className={styles.perfilOpcaoTextos}>
                        <span className={styles.perfilOpcaoLabel}>
                          {opcao.label}
                        </span>
                        <span className={styles.perfilOpcaoHint}>
                          {opcao.hint}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="login" className={styles.label}>
              Email ou CPF
            </label>
            <div className={styles.inputWrapper}>
              <User size={18} className={styles.inputIcon} />
              <input
                id="login"
                type="text"
                autoComplete="username"
                className={styles.input}
                placeholder="voce@exemplo.com"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="senha" className={styles.label}>
              Senha
            </label>
            <div className={styles.inputWrapper}>
              <Lock size={18} className={styles.inputIcon} />
              <input
                id="senha"
                type={mostrarSenha ? "text" : "password"}
                autoComplete="current-password"
                className={styles.input}
                placeholder="Sua senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
              <button
                type="button"
                className={styles.togglePassword}
                onClick={() => setMostrarSenha((v) => !v)}
                aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
              >
                {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {erro && <p className={styles.error}>{erro}</p>}

          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>

          <p className={styles.helper}>
            O cadastro de novos pacientes é realizado pela recepção da clínica.
          </p>
        </form>
      </section>
    </main>
  );
}
