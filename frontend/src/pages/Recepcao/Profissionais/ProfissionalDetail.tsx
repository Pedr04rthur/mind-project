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
  BadgeCheck,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import { ProfissionalFormModal } from "./ProfissionalFormModal";
import { useProfissionais } from "../../../contexts/ProfissionaisContext";
import { formatDate } from "../../../utils/masks";
import type { Profissional } from "../../../types/profissional";
import styles from "./ProfissionalDetail.module.css";

export function ProfissionalDetail() {
  const navigate = useNavigate();
  const { cpf } = useParams<{ cpf: string }>();
  const { getByCpf, upsert, remove } = useProfissionais();

  const profissional = cpf ? getByCpf(cpf) : undefined;

  const [editando, setEditando] = useState(false);
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);

  if (!profissional) {
    return (
      <section className={styles.notFound}>
        <AlertCircle size={32} strokeWidth={1.6} />
        <h2 className={styles.notFoundTitle}>Profissional não encontrado</h2>
        <p className={styles.notFoundText}>
          O CPF informado não corresponde a nenhum profissional cadastrado.
        </p>
        <button
          type="button"
          className={styles.primaryButton}
          onClick={() => navigate("/recepcao/profissionais")}
        >
          <ArrowLeft size={16} />
          <span>Voltar para a lista</span>
        </button>
      </section>
    );
  }

  const handleSalvar = (dados: Profissional) => {
    upsert(dados);
    setEditando(false);
  };

  const handleExcluir = () => {
    remove(profissional.cpf);
    navigate("/recepcao/profissionais");
  };

  const iniciais = profissional.nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");

  const registro =
    profissional.tipo === "PSIQUIATRA" ? profissional.crm : profissional.crp;

  return (
    <section className={styles.page}>
      <button
        type="button"
        className={styles.backButton}
        onClick={() => navigate("/recepcao/profissionais")}
      >
        <ArrowLeft size={16} />
        <span>Voltar para profissionais</span>
      </button>

      <header className={styles.profileHeader}>
        <div className={styles.profileIdentity}>
          <div className={styles.avatar}>{iniciais}</div>
          <div className={styles.profileInfo}>
            <h1 className={styles.name}>{profissional.nome}</h1>
            <div className={styles.metaRow}>
              <span
                className={`${styles.badge} ${
                  profissional.tipo === "PSIQUIATRA"
                    ? styles.badgePsiquiatra
                    : styles.badgePsicologo
                }`}
              >
                {profissional.tipo === "PSIQUIATRA" ? "Psiquiatra" : "Psicólogo"}
              </span>
              <span className={styles.metaItem}>{registro}</span>
              <span className={styles.metaDivider} aria-hidden="true" />
              <span
                className={`${styles.badge} ${
                  profissional.status === "ATIVO"
                    ? styles.badgeAtivo
                    : styles.badgeInativo
                }`}
              >
                {profissional.status === "ATIVO" ? "Ativo" : "Inativo"}
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
              <dd className={styles.infoValue}>{profissional.nome}</dd>
            </div>
            <div className={styles.infoRow}>
              <dt className={styles.infoLabel}>CPF</dt>
              <dd className={styles.infoValue}>{profissional.cpf}</dd>
            </div>
            <div className={styles.infoRow}>
              <dt className={styles.infoLabel}>Sexo</dt>
              <dd className={styles.infoValue}>
                {profissional.sexo === "FEMININO"
                  ? "Feminino"
                  : profissional.sexo === "MASCULINO"
                  ? "Masculino"
                  : "Outro"}
              </dd>
            </div>
          </dl>
        </article>

        <article className={styles.card}>
          <header className={styles.cardHeader}>
            <BadgeCheck size={18} strokeWidth={2} />
            <h2 className={styles.cardTitle}>Registro profissional</h2>
          </header>
          <dl className={styles.infoList}>
            <div className={styles.infoRow}>
              <dt className={styles.infoLabel}>Tipo</dt>
              <dd className={styles.infoValue}>
                {profissional.tipo === "PSIQUIATRA" ? "Psiquiatra" : "Psicólogo"}
              </dd>
            </div>
            <div className={styles.infoRow}>
              <dt className={styles.infoLabel}>
                {profissional.tipo === "PSIQUIATRA" ? "CRM" : "CRP"}
              </dt>
              <dd className={styles.infoValue}>
                {registro || "—"}
              </dd>
            </div>
            <div className={styles.infoRow}>
              <dt className={styles.infoLabel}>Especialidade</dt>
              <dd className={styles.infoValue}>
                {profissional.especialidade || "—"}
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
                {profissional.telefone || "—"}
              </dd>
            </div>
            <div className={styles.infoRow}>
              <dt className={styles.infoLabel}>
                <Mail size={14} /> E-mail
              </dt>
              <dd className={styles.infoValue}>{profissional.email}</dd>
            </div>
            <div className={styles.infoRow}>
              <dt className={styles.infoLabel}>
                <MapPin size={14} /> Endereço
              </dt>
              <dd className={styles.infoValue}>
                {profissional.endereco || "—"}
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
              <dd className={styles.infoValue}>{formatDate(profissional.criadoEm)}</dd>
            </div>
            <div className={styles.infoRow}>
              <dt className={styles.infoLabel}>Status</dt>
              <dd className={styles.infoValue}>
                {profissional.status === "ATIVO" ? "Ativo" : "Inativo"}
              </dd>
            </div>
          </dl>
        </article>
      </div>

      <div className={styles.lgpdNote}>
        <ShieldCheck size={16} strokeWidth={2} />
        <span>
          Exclusões de profissionais são registradas na tabela{" "}
          <code>LogExclusoes</code> conforme exigido pela LGPD.
        </span>
      </div>

      {editando && (
        <ProfissionalFormModal
          profissional={profissional}
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
            <h3 className={styles.confirmTitle}>Excluir profissional</h3>
            <p className={styles.confirmText}>
              Tem certeza que deseja excluir{" "}
              <strong>{profissional.nome}</strong>? Esta ação gera um registro de
              auditoria (LGPD).
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
