import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, Users, AlertCircle } from "lucide-react";
import { PacienteFormModal } from "./PacienteFormModal";
import { SearchInput } from "../../../components/SearchInput/SearchInput";
import { usePacientes } from "../../../contexts/PacientesContext";
import { formatDate } from "../../../utils/masks";
import { matchesSearch } from "../../../utils/search";
import type { Paciente } from "../../../types/paciente";
import styles from "./PacientesList.module.css";

export function PacientesList() {
  const navigate = useNavigate();
  const { pacientes, upsert, remove } = usePacientes();

  const [busca, setBusca] = useState("");
  // TODO: ativar debounce quando a lista vier do backend
  // const buscaAdiada = useDeferredValue(busca);

  const [modalAberto, setModalAberto] = useState(false);
  const [pacienteEditando, setPacienteEditando] = useState<Paciente | null>(null);
  const [confirmarExclusao, setConfirmarExclusao] = useState<Paciente | null>(null);

  const filtrados = useMemo(() => {
    return pacientes.filter((p) =>
      matchesSearch(busca, p.nome, p.cpf, p.email, p.telefone)
    );
  }, [pacientes, busca]);

  const handleNovo = () => {
    setPacienteEditando(null);
    setModalAberto(true);
  };

  const handleEditar = (paciente: Paciente, event?: React.MouseEvent) => {
    event?.stopPropagation();
    setPacienteEditando(paciente);
    setModalAberto(true);
  };

  const handleSalvar = (dados: Paciente) => {
    upsert(dados);
    setModalAberto(false);
    setPacienteEditando(null);
  };

  const handleExcluir = () => {
    if (!confirmarExclusao) return;
    remove(confirmarExclusao.cpf);
    setConfirmarExclusao(null);
  };

  const abrirDetalhe = (paciente: Paciente) => {
    navigate(`/recepcao/pacientes/${encodeURIComponent(paciente.cpf)}`);
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
        <SearchInput
          value={busca}
          onChange={setBusca}
          placeholder="Buscar por nome, CPF, e-mail ou telefone"
          ariaLabel="Buscar pacientes"
        />
        <span className={styles.counter}>
          {filtrados.length} {filtrados.length === 1 ? "paciente" : "pacientes"}
        </span>
      </div>

      <div className={styles.tableWrapper}>
        {filtrados.length === 0 ? (
          <div className={styles.emptyState}>
            <AlertCircle size={28} strokeWidth={1.6} />
            <p>
              {busca
                ? `Nenhum paciente encontrado para "${busca}".`
                : "Nenhum paciente cadastrado ainda."}
            </p>
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
