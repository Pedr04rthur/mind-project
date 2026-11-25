import { HistoricoPrescricoes } from "../../../components/HistoricoPrescricoes/HistoricoPrescricoes";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Smile,
  Frown,
  Calendar,
  AlertCircle,
  RefreshCw,
  ClipboardList,
  Pill,
} from "lucide-react";

import { api } from "../../../services/api";
import { cpfToApi } from "../../../services/adapters";
import { useAuth } from "../../../contexts/AuthContext";

import styles from "./PacienteClinicoDetail.module.css";

interface DadosPaciente {
  id: number;
  cpf: string;
  name: string;
  phone: string;
  email: string;
  address: string;
}

interface RegistroHumor {
  id: number;
  level: "GOOD" | "BAD";
  date: string;
  comment: string | null;
}

interface Consulta {
  id: number;
  scheduledAt: string;
  status: string;
}

const statusLabels: Record<string, string> = {
  SCHEDULED: "Agendada",
  COMPLETED: "Concluída",
  CANCELLED: "Cancelada",
};

export function PacienteClinicoDetail() {
  const { cpf } = useParams<{ cpf: string }>();
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const [paciente, setPaciente] =
    useState<DadosPaciente | null>(null);

  const [humores, setHumores] =
    useState<RegistroHumor[]>([]);

  const [consultas, setConsultas] =
    useState<Consulta[]>([]);

  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [versao, setVersao] = useState(0);

  const [aba, setAba] = useState<
    "GERAL" | "HUMOR" | "CONSULTAS" | "PRESCRICOES" | "ORIENTACOES"
  >("GERAL");

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      setLoading(true);
      setErro(null);
      setPaciente(null);
      setHumores([]);
      setConsultas([]);

      try {
        if (!cpf || usuario?.perfil !== "PROFISSIONAL") {
          throw new Error("Acesso não autorizado.");
        }

        const cpfPaciente = cpfToApi(cpf);

        const agendamentos =
          await api.appointments.listMine();

        const consultasPaciente = agendamentos.filter(
          (c) => cpfToApi(c.patient.cpf) === cpfPaciente
        );

        const possuiVinculo = consultasPaciente.some(
          (c) => c.status !== "CANCELLED"
        );

        if (!possuiVinculo) {
          throw new Error(
            "Este paciente não está vinculado a você."
          );
        }

        const [dados, registros] = await Promise.all([
          api.patients.getByCpf(cpfPaciente),
          api.mood.list(cpfPaciente, "DESC"),
        ]);

        if (!ativo) return;

        setPaciente(dados);
        setHumores(registros);
        setConsultas(consultasPaciente);

      } catch (err) {
        if (!ativo) return;

        setErro(
          err instanceof Error
            ? err.message
            : "Não foi possível carregar o paciente."
        );
      } finally {
        if (ativo) setLoading(false);
      }
    }

    void carregar();

    return () => {
      ativo = false;
    };
  }, [cpf, usuario?.emailLogin, usuario?.perfil, versao]);

  const voltar = () => {
    navigate("/profissional/pacientes");
  };

  if (loading) {
    return (
      <div className={styles.empty}>
        <RefreshCw size={30} />
        <p>Carregando dados clínicos...</p>
      </div>
    );
  }

  if (erro || !paciente) {
    return (
      <div className={styles.empty}>
        <AlertCircle size={32} />
        <h2>Não foi possível carregar o paciente</h2>
        <p>{erro ?? "Paciente não encontrado."}</p>

        <button className={styles.button} onClick={voltar}>
          <ArrowLeft size={16} />
          Voltar
        </button>

        <button
          className={styles.button}
          onClick={() => setVersao((v) => v + 1)}
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  const bons = humores.filter(
    (h) => h.level === "GOOD"
  ).length;

  const ruins = humores.filter(
    (h) => h.level === "BAD"
  ).length;

  const iniciais = paciente.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("");

  return (
    <section className={styles.page}>

      <div className={styles.header}>
        <button className={styles.button} onClick={voltar}>
          <ArrowLeft size={17} />
          Meus pacientes
        </button>

        <button
          className={styles.button}
          onClick={() => setVersao((v) => v + 1)}
        >
          <RefreshCw size={16} />
          Atualizar
        </button>
      </div>

      <div className={styles.identity}>
        <div className={styles.avatar}>{iniciais}</div>

        <div>
          <h1>{paciente.name}</h1>
          <p>CPF: {paciente.cpf}</p>
          <span className={styles.badge}>
            Paciente vinculado
          </span>
        </div>
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <ClipboardList size={22} />
          <strong>{humores.length}</strong>
          <span>Registros de humor</span>
        </div>

        <div className={`${styles.stat} ${styles.good}`}>
          <Smile size={22} />
          <strong>{bons}</strong>
          <span>Registros bons</span>
        </div>

        <div className={`${styles.stat} ${styles.bad}`}>
          <Frown size={22} />
          <strong>{ruins}</strong>
          <span>Registros ruins</span>
        </div>

        <div className={styles.stat}>
          <Calendar size={22} />
          <strong>{consultas.length}</strong>
          <span>Consultas</span>
        </div>
      </div>

      <nav className={styles.tabs}>
        <button
          className={aba === "GERAL" ? styles.active : ""}
          onClick={() => setAba("GERAL")}
        >
          <User size={17} />
          Dados pessoais
        </button>

        <button
          className={aba === "HUMOR" ? styles.active : ""}
          onClick={() => setAba("HUMOR")}
        >
          <Smile size={17} />
          Histórico de humor
        </button>

        <button
          className={aba === "CONSULTAS" ? styles.active : ""}
          onClick={() => setAba("CONSULTAS")}
        >
          <Calendar size={17} />
          Consultas
        </button>
      
        <button
          className={aba === "PRESCRICOES" ? styles.active : ""}
          onClick={() => setAba("PRESCRICOES")}
        >
          <Pill size={17} />
          Prescrições
        </button>

        <button
          className={aba === "ORIENTACOES" ? styles.active : ""}
          onClick={() => setAba("ORIENTACOES")}
        >
          <ClipboardList size={17} />
          Orientações
        </button>
      </nav>

      {aba === "GERAL" && (
        <div className={styles.card}>
          <h2>Informações do paciente</h2>

          <div className={styles.grid}>
            {[
              ["Nome completo", paciente.name],
              ["CPF", paciente.cpf],
              ["Telefone", paciente.phone],
              ["E-mail", paciente.email],
              ["Endereço", paciente.address],
              ["Código do paciente", paciente.id],
            ].map(([label, valor]) => (
              <div className={styles.field} key={label}>
                <label>{label}</label>
                <span>{valor || "Não informado"}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {aba === "HUMOR" && (
        <div className={styles.card}>
          <h2>Histórico de humor</h2>

          {humores.length === 0 ? (
            <div className={styles.empty}>
              Nenhum registro de humor encontrado.
            </div>
          ) : (
            <div className={styles.timeline}>
              {humores.map((humor) => (
                <article
                  key={humor.id}
                  className={styles.record}
                >
                  <div
                    className={`${styles.moodIcon} ${
                      humor.level === "GOOD"
                        ? styles.good
                        : styles.bad
                    }`}
                  >
                    {humor.level === "GOOD"
                      ? <Smile size={24} />
                      : <Frown size={24} />}
                  </div>

                  <div className={styles.recordContent}>
                    <div className={styles.recordHeader}>
                      <strong>
                        {humor.level === "GOOD"
                          ? "Humor bom"
                          : "Humor ruim"}
                      </strong>

                      <time>
                        {humor.date.split("-").reverse().join("/")}
                      </time>
                    </div>

                    <p>
                      {humor.comment || "Sem comentários."}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      )}

      {aba === "CONSULTAS" && (
        <div className={styles.card}>
          <h2>Histórico de consultas</h2>

          {consultas.length === 0 ? (
            <div className={styles.empty}>
              Nenhuma consulta encontrada.
            </div>
          ) : (
            <div className={styles.timeline}>
              {consultas.map((consulta) => (
                <article
                  key={consulta.id}
                  className={styles.record}
                >
                  <div className={styles.moodIcon}>
                    <Calendar size={22} />
                  </div>

                  <div className={styles.recordContent}>
                    <div className={styles.recordHeader}>
                      <strong>Consulta #{consulta.id}</strong>

                      <span className={styles.badge}>
                        {statusLabels[consulta.status]
                          ?? consulta.status}
                      </span>
                    </div>

                    <p>
                      {new Date(
                        consulta.scheduledAt
                      ).toLocaleString("pt-BR")}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      )}

    
      {aba === "PRESCRICOES" && (
        <HistoricoPrescricoes
          cpf={paciente.cpf}
          modo="MEDICAMENTOS"
        />
      )}

      {aba === "ORIENTACOES" && (
        <HistoricoPrescricoes
          cpf={paciente.cpf}
          modo="ORIENTACOES"
        />
      )}

    </section>
  );
}
