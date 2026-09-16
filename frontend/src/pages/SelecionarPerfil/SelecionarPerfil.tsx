import { useNavigate } from "react-router-dom";
import {
  HeartPulse,
  Heart,
  Stethoscope,
  Users,
  ArrowRight,
  ChevronLeft,
} from "lucide-react";
import { useAuth, getHomeDoPerfil } from "../../contexts/AuthContext";
import type { PerfilUsuario, UsuarioLogado } from "../../types/auth";
import styles from "./SelecionarPerfil.module.css";

interface PerfilOpcao {
  perfil: PerfilUsuario;
  titulo: string;
  subtitulo: string;
  descricao: string;
  bullets: string[];
  icon: typeof Heart;
  accent: "verde" | "roxo" | "azul";
  usuario: UsuarioLogado;
}

const OPCOES: PerfilOpcao[] = [
  {
    perfil: "PACIENTE",
    titulo: "Paciente",
    subtitulo: "Diário de humor",
    descricao:
      "Registre seu humor diariamente e compartilhe com seu terapeuta.",
    bullets: [
      "Registro diário de humor",
      "Comentários contextuais",
      "Consulta de prescrições e horários",
    ],
    icon: Heart,
    accent: "verde",
    usuario: {
      perfil: "PACIENTE",
      cpf: "123.456.789-00",
      nome: "Ana Carolina Souza",
      emailLogin: "ana.souza@exemplo.com",
    },
  },
  {
    perfil: "PROFISSIONAL",
    titulo: "Profissional",
    subtitulo: "Painel clínico",
    descricao:
      "Acompanhe a evolução dos pacientes e conduza as sessões.",
    bullets: [
      "Histórico longitudinal de humor",
      "Registro de prontuário",
      "Emissão de prescrições (psiquiatras)",
    ],
    icon: Stethoscope,
    accent: "roxo",
    usuario: {
      perfil: "PROFISSIONAL",
      cpf: "222.333.444-55",
      nome: "Dra. Marina Alencar",
      tipoProfissional: "PSIQUIATRA",
      registro: "CRM-PB 12345",
      emailLogin: "marina.alencar@mindcare.com",
    },
  },
  {
    perfil: "RECEPCAO",
    titulo: "Recepção",
    subtitulo: "Gestão da clínica",
    descricao:
      "Cadastre pacientes, faça a triagem inicial e controle a agenda.",
    bullets: [
      "Cadastro de pacientes e profissionais",
      "Triagem inicial",
      "Controle da agenda clínica",
    ],
    icon: Users,
    accent: "azul",
    usuario: {
      perfil: "RECEPCAO",
      cpf: "000.000.000-00",
      nome: "Recepção MindCare",
      emailLogin: "recepcao@mindcare.com",
    },
  },
];

export function SelecionarPerfil() {
  const navigate = useNavigate();
  const { entrar } = useAuth();

  const handleSelecionar = (opcao: PerfilOpcao) => {
    entrar(opcao.usuario);
    navigate(getHomeDoPerfil(opcao.perfil));
  };

  return (
    <main className={styles.page}>
      <header className={styles.topBar}>
        <button
          type="button"
          className={styles.backButton}
          onClick={() => navigate("/login")}
        >
          <ChevronLeft size={16} />
          <span>Voltar</span>
        </button>

        <div className={styles.brand}>
          <span className={styles.brandMark} aria-hidden="true">
            <HeartPulse size={18} strokeWidth={2.2} />
          </span>
          <span className={styles.brandName}>MindCare</span>
        </div>
      </header>

      <section className={styles.hero}>
        <span className={styles.eyebrow}>Simulação de acesso</span>
        <h1 className={styles.title}>Como você quer entrar hoje?</h1>
        <p className={styles.subtitle}>
          Escolha um perfil para simular a experiência. Cada perfil tem uma
          interface e permissões próprias.
        </p>
      </section>

      <section className={styles.grid}>
        {OPCOES.map((opcao) => {
          const Icon = opcao.icon;
          return (
            <button
              key={opcao.perfil}
              type="button"
              className={`${styles.card} ${styles[`card_${opcao.accent}`]}`}
              onClick={() => handleSelecionar(opcao)}
            >
              <header className={styles.cardHeader}>
                <span className={styles.iconWrap} aria-hidden="true">
                  <Icon size={24} strokeWidth={2} />
                </span>
                <div className={styles.cardTitles}>
                  <span className={styles.cardTitle}>{opcao.titulo}</span>
                  <span className={styles.cardSubtitle}>{opcao.subtitulo}</span>
                </div>
              </header>

              <p className={styles.cardDescription}>{opcao.descricao}</p>

              <ul className={styles.bullets}>
                {opcao.bullets.map((b) => (
                  <li key={b} className={styles.bullet}>
                    <span className={styles.bulletDot} aria-hidden="true" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>

              <footer className={styles.cardFooter}>
                <span className={styles.cardUser}>
                  {opcao.usuario.nome}
                </span>
                <span className={styles.enterHint}>
                  Entrar
                  <ArrowRight size={14} />
                </span>
              </footer>
            </button>
          );
        })}
      </section>

      <p className={styles.disclaimer}>
        Esta é uma simulação para fins de desenvolvimento. Nenhum dado real é
        processado.
      </p>
    </main>
  );
}
