import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, User, HeartPulse } from "lucide-react";
import styles from "./Login.module.css";

export function Login() {
  const navigate = useNavigate();

  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErro(null);

    if (!login.trim() || !senha) {
      setErro("Preencha login e senha para continuar.");
      return;
    }

    setLoading(true);

    try {
      await new Promise((r) => setTimeout(r, 700));
      navigate("/selecionar-perfil");
    } catch {
      setErro("Credenciais inválidas. Verifique e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.brandPanel}>
        <div className={styles.brandContent}>
          <div className={styles.brandMark}>
            <HeartPulse size={28} strokeWidth={2.2} />
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
              <HeartPulse size={20} strokeWidth={2.2} />
              <span>MindCare</span>
            </div>
            <h2 className={styles.formTitle}>Entrar</h2>
            <p className={styles.formSubtitle}>
              Acesse com suas credenciais para continuar.
            </p>
          </header>

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
