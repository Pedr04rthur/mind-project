import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Stethoscope,
  AlertCircle,
} from "lucide-react";
import { ProfissionalFormModal } from "./ProfissionalFormModal";
import { useProfissionais } from "../../../contexts/ProfissionaisContext";
import type { Profissional } from "../../../types/profissional";
import styles from "./ProfissionaisList.module.css";

export function ProfissionaisList() {
  const navigate = useNavigate();
  const { profissionais, upsert, remove } = useProfissionais();

  const [busca, setBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<"TODOS" | "PSICOLOGO" | "PSIQUIATRA">(
    "TODOS"
  );
  const [modalAberto, setModalAberto] = useState(false);
  const [profissionalEditando, setProfissionalEditando] =
    useState<Profissional | null>(null);
  const [confirmarExclusao, setConfirmarExclusao] = useState<Profissional | null>(
    null
  );

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return profissionais.filter((p) => {
      if (filtroTipo !== "TODOS" && p.tipo !== filtroTipo) return false;
      if (!termo) return true;
      return (
        p.nome.toLowerCase().includes(termo) ||
        p.cpf.toLowerCase().includes(termo) ||
        p.email.toLowerCase().includes(termo) ||
        p.crp.toLowerCase().includes(termo) ||
        p.crm.toLowerCase().includes(termo)
      );
    });
  }, [profissionais, busca, filtroTipo]);

  const handleNovo = () => {
    setProfissionalEditando(null);
    setModalAberto(true);
  };

  const handleEditar = (prof: Profissional, event?: React.MouseEvent) => {
    event?.stopPropagation();
    setProfissionalEditando(prof);
    setModalAberto(true);
  };

  const handleSalvar = (dados: Profissional) => {
    upsert(dados);
    setModalAberto(false);
    setProfissionalEditando(null);
  };

  const handleExcluir = () => {
    if (!confirmarExclusao) return;
    remove(confirmarExclusao.cpf);
    setConfirmarExclusao(null);
  };

  const abrirDetalhe = (prof: Profissional) => {
    navigate(`/recepcao/profissionais/${encodeURIComponent(prof.cpf)}`);
  };

  return (
    <section className={styles.page}>
      <header className={styles.pageHeader}>
        <div className={styles.pageTitle}>
          <div className={styles.titleIcon}>
            <Stethoscope size={22} strokeWidth={2} />
          </div>
          <div>
            <h1 className={styles.title}>Profissionais</h1>
            <p className={styles.subtitle}>
              Cadastro e gestão de psicólogos e psiquiatras da clínica.
            </p>
          </div>
        </div>

        <button type="button" className={styles.primaryButton} onClick={handleNovo}>
          <Plus size={18} strokeWidth={2.2} />
          <span>Cadastrar profissional</span>
        </button>
      </header>

      <div className={styles.toolbar}>
        <div className={styles.searchWrapper}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Buscar por nome, CPF, e-mail, CRP ou CRM"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <div className={styles.filterGroup} role="tablist">
          {(["TODOS", "PSICOLOGO", "PSIQUIATRA"] as const).map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={filtroTipo === t}
              className={`${styles.filterOption} ${
                filtroTipo === t ? styles.filterActive : ""
              }`}
              onClick={() => setFiltroTipo(t)}
            >
              {t === "TODOS"
                ? "Todos"
                : t === "PSICOLOGO"
                ? "Psicólogos"
                : "Psiquiatras"}
            </button>
          ))}
        </div>

        <span className={styles.counter}>
          {filtrados.length}{" "}
          {filtrados.length === 1 ? "profissional" : "profissionais"}
        </span>
      </div>

      <div className={styles.tableWrapper}>
        {filtrados.length === 0 ? (
          <div className={styles.emptyState}>
            <AlertCircle size={28} strokeWidth={1.6} />
            <p>Nenhum profissional encontrado.</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Tipo</th>
                <th>Registro</th>
                <th>Especialidade</th>
                <th>Contato</th>
                <th>Status</th>
                <th className={styles.actionsColumn}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((p) => (
                <tr
                  key={p.cpf}
                  className={styles.clickableRow}
                  onClick={() => abrirDetalhe(p)}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      abrirDetalhe(p);
                    }
                  }}
                >
                  <td className={styles.nameCell}>{p.nome}</td>
                  <td>
                    <span
                      className={`${styles.badge} ${
                        p.tipo === "PSIQUIATRA"
                          ? styles.badgePsiquiatra
                          : styles.badgePsicologo
                      }`}
                    >
                      {p.tipo === "PSIQUIATRA" ? "Psiquiatra" : "Psicólogo"}
                    </span>
                  </td>
                  <td className={styles.monoCell}>
                    {p.tipo === "PSIQUIATRA" ? p.crm : p.crp}
                  </td>
                  <td>{p.especialidade || "—"}</td>
                  <td>
                    <div className={styles.contactCell}>
                      <span>{p.email}</span>
                      <span className={styles.contactMuted}>{p.telefone}</span>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`${styles.badge} ${
                        p.status === "ATIVO"
                          ? styles.badgeAtivo
                          : styles.badgeInativo
                      }`}
                    >
                      {p.status === "ATIVO" ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className={styles.actionsCell}>
                    <button
                      type="button"
                      className={styles.iconButton}
                      onClick={(e) => handleEditar(p, e)}
                      aria-label={`Editar ${p.nome}`}
                      title="Editar"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      type="button"
                      className={`${styles.iconButton} ${styles.iconButtonDanger}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmarExclusao(p);
                      }}
                      aria-label={`Excluir ${p.nome}`}
                      title="Excluir"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalAberto && (
        <ProfissionalFormModal
          profissional={profissionalEditando}
          onClose={() => {
            setModalAberto(false);
            setProfissionalEditando(null);
          }}
          onSave={handleSalvar}
        />
      )}

      {confirmarExclusao && (
        <div className={styles.overlay} onClick={() => setConfirmarExclusao(null)}>
          <div className={styles.confirmBox} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.confirmTitle}>Excluir profissional</h3>
            <p className={styles.confirmText}>
              Tem certeza que deseja excluir{" "}
              <strong>{confirmarExclusao.nome}</strong>? Esta ação gera um
              registro de auditoria (LGPD).
            </p>
            <div className={styles.confirmActions}>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => setConfirmarExclusao(null)}
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
