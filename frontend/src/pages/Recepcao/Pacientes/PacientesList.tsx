import { useMemo, useState } from "react";
import { Plus, Search, Pencil, Trash2, Users, AlertCircle } from "lucide-react";
import { PacienteFormModal } from "./PacienteFormModal";
import { MOCK_PACIENTES } from "../../../data/mockPacientes";
import { formatDate } from "../../../utils/masks";
import type { Paciente } from "../../../types/paciente";
import styles from "./PacientesList.module.css";

export function PacientesList() {
  const [pacientes, setPacientes] = useState<Paciente[]>(MOCK_PACIENTES);
  const [busca, setBusca] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [pacienteEditando, setPacienteEditando] = useState<Paciente | null>(null);
  const [confirmarExclusao, setConfirmarExclusao] = useState<Paciente | null>(null);

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return pacientes;
    return pacientes.filter(
      (p) =>
        p.nome.toLowerCase().includes(termo) ||
        p.cpf.toLowerCase().includes(termo) ||
        p.email.toLowerCase().includes(termo)
    );
  }, [pacientes, busca]);

  const handleNovo = () => {
    setPacienteEditando(null);
    setModalAberto(true);
  };

  const handleEditar = (paciente: Paciente) => {
    setPacienteEditando(paciente);
    setModalAberto(true);
  };

  const handleSalvar = (dados: Paciente) => {
    setPacientes((atual) => {
      const existe = atual.some((p) => p.cpf === dados.cpf);
      if (existe) {
        return atual.map((p) => (p.cpf === dados.cpf ? { ...p, ...dados } : p));
      }
      return [dados, ...atual];
    });
    setModalAberto(false);
    setPacienteEditando(null);
  };

  const handleExcluir = () => {
    if (!confirmarExclusao) return;
    setPacientes((atual) => atual.filter((p) => p.cpf !== confirmarExclusao.cpf));
    setConfirmarExclusao(null);
  };

  return (
    <section className={styles.page}>
      <header className={styles.pageHeader}>
        <div className={styles.pageTitle}>
          <div className={styles.titleIcon}>
            <Users size={22} strokeWidth={2} />
          </div>
          <div>
            <h1 className={styles.title}>Pacientes</h1>
            <p className={styles.subtitle}>
              Gerencie o cadastro dos pacientes da clínica.
            </p>
          </div>
        </div>

        <button type="button" className={styles.primaryButton} onClick={handleNovo}>
          <Plus size={18} strokeWidth={2.2} />
          <span>Cadastrar paciente</span>
        </button>
      </header>

      <div className={styles.toolbar}>
        <div className={styles.searchWrapper}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Buscar por nome, CPF ou e-mail"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <span className={styles.counter}>
          {filtrados.length} {filtrados.length === 1 ? "paciente" : "pacientes"}
        </span>
      </div>

      <div className={styles.tableWrapper}>
        {filtrados.length === 0 ? (
          <div className={styles.emptyState}>
            <AlertCircle size={28} strokeWidth={1.6} />
            <p>Nenhum paciente encontrado.</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nome</th>
                <th>CPF</th>
                <th>Contato</th>
                <th>Nascimento</th>
                <th>Prioridade</th>
                <th>Status</th>
                <th className={styles.actionsColumn}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((p) => (
                <tr key={p.cpf}>
                  <td className={styles.nameCell}>{p.nome}</td>
                  <td>{p.cpf}</td>
                  <td>
                    <div className={styles.contactCell}>
                      <span>{p.email}</span>
                      <span className={styles.contactMuted}>{p.telefone}</span>
                    </div>
                  </td>
                  <td>{formatDate(p.dataNasc)}</td>
                  <td>
                    <span
                      className={`${styles.badge} ${styles[`prioridade${p.prioridade}`]}`}
                    >
                      {p.prioridade === "ALTA"
                        ? "Alta"
                        : p.prioridade === "MEDIA"
                        ? "Média"
                        : "Baixa"}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`${styles.badge} ${
                        p.status === "ATIVO" ? styles.badgeAtivo : styles.badgeInativo
                      }`}
                    >
                      {p.status === "ATIVO" ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className={styles.actionsCell}>
                    <button
                      type="button"
                      className={styles.iconButton}
                      onClick={() => handleEditar(p)}
                      aria-label={`Editar ${p.nome}`}
                      title="Editar"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      type="button"
                      className={`${styles.iconButton} ${styles.iconButtonDanger}`}
                      onClick={() => setConfirmarExclusao(p)}
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
        <PacienteFormModal
          paciente={pacienteEditando}
          onClose={() => {
            setModalAberto(false);
            setPacienteEditando(null);
          }}
          onSave={handleSalvar}
        />
      )}

      {confirmarExclusao && (
        <div className={styles.overlay} onClick={() => setConfirmarExclusao(null)}>
          <div className={styles.confirmBox} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.confirmTitle}>Excluir paciente</h3>
            <p className={styles.confirmText}>
              Tem certeza que deseja excluir <strong>{confirmarExclusao.nome}</strong>?
              Esta ação gera um registro de auditoria (LGPD).
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
