import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  User,
  Phone,
  Mail,
  MapPin,
  CalendarDays,
  ClipboardList,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import { PacienteFormModal } from "./PacienteFormModal";
import { usePacientes } from "../../../contexts/PacientesContext";
import { formatDate } from "../../../utils/masks";
import type { Paciente } from "../../../types/paciente";
import styles from "./PacienteDetail.module.css";

export function PacienteDetail() {
  const navigate = useNavigate();
  const { cpf } = useParams<{ cpf: string }>();
  const { getByCpf, upsert, remove } = usePacientes();

  const paciente = cpf ? getByCpf(cpf) : undefined;

  const [editando, setEditando] = useState(false);
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);

  if (!paciente) {
    return (
      <section className={styles.notFound}>
        <AlertCircle size={32} strokeWidth={1.6} />
        <h2 className={styles.notFoundTitle}>Paciente não encontrado</h2>
        <p className={styles.notFoundText}>
          O CPF informado não corresponde a nenhum paciente cadastrado.
        </p>
        <button
          type="button"
          className={styles.primaryButton}
          onClick={() => navigate("/recepcao/pacientes")}
        >
          <ArrowLeft size={16} />
          <span>Voltar para a lista</span>
        </button>
      </section>
    );
  }

  const handleSalvar = (dados: Paciente) => {
    upsert(dados);
    setEditando(false);
  };

  const handleExcluir = () => {
    remove(paciente.cpf);
    navigate("/recepcao/pacientes");
  };

  const iniciais = paciente.nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");

  return (
    <section className={styles.page}>
      <button
        type="button"
        className={styles.backButton}
        onClick={() => navigate("/recepcao/pacientes")}
      >
        <ArrowLeft size={16} />
        <span>Voltar para pacientes</span>
      </button>

      <header className={styles.profileHeader}>
        <div className={styles.profileIdentity}>
          <div className={styles.avatar}>{iniciais}</div>
          <div className={styles.profileInfo}>
            <h1 className={styles.name}>{paciente.nome}</h1>
            <div className={styles.metaRow}>
              <span className={styles.metaItem}>CPF {paciente.cpf}</span>
              <span className={styles.metaDivider} aria-hidden="true" />
              <span className={styles.metaItem}>
                Nasc. {formatDate(paciente.dataNasc)}
              </span>
              <span className={styles.metaDivider} aria-hidden="true" />
              <span
                className={`${styles.badge} ${
                  paciente.status === "ATIVO" ? styles.badgeAtivo : styles.badgeInativo
                }`}
              >
                {paciente.status === "ATIVO" ? "Ativo" : "Inativo"}
              </span>
              <span
                className={`${styles.badge} ${styles[`prioridade${paciente.prioridade}`]}`}
              >
                Prioridade{" "}
                {paciente.prioridade === "ALTA"
                  ? "alta"
                  : paciente.prioridade === "MEDIA"
                  ? "média"
                  : "baixa"}
              </span>
            </div>
          </div>
        </div>

        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => setEditando(true)}
          >
            <Pencil size={16} />
            <span>Editar</span>
          </button>
          <button
            type="button"
            className={styles.dangerButton}
            onClick={() => setConfirmarExclusao(true)}
          >
            <Trash2 size={16} />
            <span>Excluir</span>
          </button>
        </div>
      </header>

      <div className={styles.grid}>
        <article className={styles.card}>
          <header className={styles.cardHeader}>
            <User size={18} strokeWidth={2} />
            <h2 className={styles.cardTitle}>Dados pessoais</h2>
          </header>
          <dl className={styles.infoList}>
            <div className={styles.infoRow}>
              <dt className={styles.infoLabel}>Nome completo</dt>
              <dd className={styles.infoValue}>{paciente.nome}</dd>
            </div>
            <div className={styles.infoRow}>
              <dt className={styles.infoLabel}>CPF</dt>
              <dd className={styles.infoValue}>{paciente.cpf}</dd>
            </div>
            <div className={styles.infoRow}>
              <dt className={styles.infoLabel}>Data de nascimento</dt>
              <dd className={styles.infoValue}>{formatDate(paciente.dataNasc)}</dd>
            </div>
            <div className={styles.infoRow}>
              <dt className={styles.infoLabel}>Sexo</dt>
              <dd className={styles.infoValue}>
                {paciente.sexo === "FEMININO"
                  ? "Feminino"
                  : paciente.sexo === "MASCULINO"
                  ? "Masculino"
                  : "Outro"}
              </dd>
            </div>
          </dl>
        </article>

        <article className={styles.card}>
          <header className={styles.cardHeader}>
            <Phone size={18} strokeWidth={2} />
            <h2 className={styles.cardTitle}>Contato</h2>
          </header>
          <dl className={styles.infoList}>
            <div className={styles.infoRow}>
              <dt className={styles.infoLabel}>
                <Phone size={14} /> Telefone
              </dt>
              <dd className={styles.infoValue}>
                {paciente.telefone || "—"}
              </dd>
            </div>
            <div className={styles.infoRow}>
              <dt className={styles.infoLabel}>
                <Mail size={14} /> E-mail
              </dt>
              <dd className={styles.infoValue}>{paciente.email}</dd>
            </div>
            <div className={styles.infoRow}>
              <dt className={styles.infoLabel}>
                <MapPin size={14} /> Endereço
              </dt>
              <dd className={styles.infoValue}>
                {paciente.endereco || "—"}
              </dd>
            </div>
          </dl>
        </article>

        <article className={styles.card}>
          <header className={styles.cardHeader}>
            <ClipboardList size={18} strokeWidth={2} />
            <h2 className={styles.cardTitle}>Triagem</h2>
          </header>
          <dl className={styles.infoList}>
            <div className={styles.infoRow}>
              <dt className={styles.infoLabel}>Prioridade</dt>
              <dd className={styles.infoValue}>
                <span
                  className={`${styles.badge} ${styles[`prioridade${paciente.prioridade}`]}`}
                >
                  {paciente.prioridade === "ALTA"
                    ? "Alta"
                    : paciente.prioridade === "MEDIA"
                    ? "Média"
                    : "Baixa"}
                </span>
              </dd>
            </div>
            <div className={styles.infoRow}>
              <dt className={styles.infoLabel}>Observação</dt>
              <dd className={styles.infoValue}>
                {paciente.observacao || "Sem observações registradas."}
              </dd>
            </div>
          </dl>
        </article>

        <article className={styles.card}>
          <header className={styles.cardHeader}>
            <CalendarDays size={18} strokeWidth={2} />
            <h2 className={styles.cardTitle}>Registro</h2>
          </header>
          <dl className={styles.infoList}>
            <div className={styles.infoRow}>
              <dt className={styles.infoLabel}>Cadastrado em</dt>
              <dd className={styles.infoValue}>{formatDate(paciente.criadoEm)}</dd>
            </div>
            <div className={styles.infoRow}>
              <dt className={styles.infoLabel}>Status</dt>
              <dd className={styles.infoValue}>
                {paciente.status === "ATIVO" ? "Ativo" : "Inativo"}
              </dd>
            </div>
          </dl>
        </article>
      </div>

      <div className={styles.lgpdNote}>
        <ShieldCheck size={16} strokeWidth={2} />
        <span>
          Dados sensíveis de saúde protegidos pela LGPD. Exclusões são registradas
          na tabela <code>LogExclusoes</code>.
        </span>
      </div>

      {editando && (
        <PacienteFormModal
          paciente={paciente}
          onClose={() => setEditando(false)}
          onSave={handleSalvar}
        />
      )}

      {confirmarExclusao && (
        <div
          className={styles.overlay}
          onClick={() => setConfirmarExclusao(false)}
        >
          <div className={styles.confirmBox} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.confirmTitle}>Excluir paciente</h3>
            <p className={styles.confirmText}>
              Tem certeza que deseja excluir <strong>{paciente.nome}</strong>? Esta
              ação gera um registro de auditoria (LGPD).
            </p>
            <div className={styles.confirmActions}>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => setConfirmarExclusao(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className={styles.dangerButton}
                onClick={handleExcluir}
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
