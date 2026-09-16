import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Pencil,
  Trash2,
  Stethoscope,
  AlertCircle,
  Filter,
  X,
} from "lucide-react";
import { ProfissionalFormModal } from "./ProfissionalFormModal";
import { SearchInput } from "../../../components/SearchInput/SearchInput";
import { useProfissionais } from "../../../contexts/ProfissionaisContext";
import { matchesSearch } from "../../../utils/search";
import type { Profissional } from "../../../types/profissional";
import styles from "./ProfissionaisList.module.css";

type FiltroTipo = "TODOS" | "PSICOLOGO" | "PSIQUIATRA";
const TODAS_ESPECIALIDADES = "__TODAS__";

export function ProfissionaisList() {
  const navigate = useNavigate();
  const { profissionais, upsert, remove } = useProfissionais();

  const [busca, setBusca] = useState("");
  // TODO: ativar debounce quando a lista vier do backend
  // const buscaAdiada = useDeferredValue(busca);

  const [filtroTipo, setFiltroTipo] = useState<FiltroTipo>("TODOS");
  const [filtroEspecialidade, setFiltroEspecialidade] = useState(
    TODAS_ESPECIALIDADES
  );

  const [modalAberto, setModalAberto] = useState(false);
  const [profissionalEditando, setProfissionalEditando] =
    useState<Profissional | null>(null);
  const [confirmarExclusao, setConfirmarExclusao] = useState<Profissional | null>(
    null
  );

  /**
   * Especialidades disponíveis para o filtro, derivadas dos profissionais
   * visíveis após aplicar o filtro de tipo. Ignora strings vazias e
   * ordena alfabeticamente (com locale pt-BR).
   */
  const especialidadesDisponiveis = useMemo(() => {
    const set = new Set<string>();
    profissionais.forEach((p) => {
      if (filtroTipo !== "TODOS" && p.tipo !== filtroTipo) return;
      const esp = p.especialidade?.trim();
      if (esp) set.add(esp);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [profissionais, filtroTipo]);

  /**
   * Se o usuário estava filtrando por uma especialidade e ela deixa de
   * existir (ex.: trocou o tipo para Psicólogos mas o filtro era de
   * Psiquiatras), resetamos automaticamente para "todas".
   */
  const especialidadeAtiva = useMemo(() => {
    if (filtroEspecialidade === TODAS_ESPECIALIDADES) return TODAS_ESPECIALIDADES;
    return especialidadesDisponiveis.includes(filtroEspecialidade)
      ? filtroEspecialidade
      : TODAS_ESPECIALIDADES;
  }, [filtroEspecialidade, especialidadesDisponiveis]);

  const filtrosAtivos =
    filtroTipo !== "TODOS" ||
    especialidadeAtiva !== TODAS_ESPECIALIDADES ||
    busca.trim().length > 0;

  const filtrados = useMemo(() => {
    return profissionais.filter((p) => {
      if (filtroTipo !== "TODOS" && p.tipo !== filtroTipo) return false;

      if (
        especialidadeAtiva !== TODAS_ESPECIALIDADES &&
        p.especialidade !== especialidadeAtiva
      ) {
        return false;
      }

      return matchesSearch(
        busca,
        p.nome,
        p.cpf,
        p.email,
        p.telefone,
        p.crp,
        p.crm,
        p.especialidade
      );
    });
  }, [profissionais, busca, filtroTipo, especialidadeAtiva]);

  const limparFiltros = () => {
    setBusca("");
    setFiltroTipo("TODOS");
    setFiltroEspecialidade(TODAS_ESPECIALIDADES);
  };

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
        <SearchInput
          value={busca}
          onChange={setBusca}
          placeholder="Buscar por nome, CPF, e-mail, CRP, CRM ou especialidade"
          ariaLabel="Buscar profissionais"
        />

        <div className={styles.filterGroup} role="tablist" aria-label="Filtrar por tipo">
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

        <div className={styles.specialtyFilter}>
          <Filter size={15} className={styles.specialtyIcon} aria-hidden="true" />
          <select
            className={styles.specialtySelect}
            value={especialidadeAtiva}
            onChange={(e) => setFiltroEspecialidade(e.target.value)}
            disabled={especialidadesDisponiveis.length === 0}
            aria-label="Filtrar por especialidade"
          >
            <option value={TODAS_ESPECIALIDADES}>Todas as especialidades</option>
            {especialidadesDisponiveis.map((esp) => (
              <option key={esp} value={esp}>
                {esp}
              </option>
            ))}
          </select>
        </div>

        <span className={styles.counter}>
          {filtrados.length}{" "}
          {filtrados.length === 1 ? "profissional" : "profissionais"}
        </span>

        {filtrosAtivos && (
          <button
            type="button"
            className={styles.clearFiltersButton}
            onClick={limparFiltros}
          >
            <X size={14} />
            <span>Limpar filtros</span>
          </button>
        )}
      </div>

      <div className={styles.tableWrapper}>
        {filtrados.length === 0 ? (
          <div className={styles.emptyState}>
            <AlertCircle size={28} strokeWidth={1.6} />
            <p>
              {filtrosAtivos
                ? "Nenhum profissional encontrado com os filtros atuais."
                : "Nenhum profissional cadastrado ainda."}
            </p>
            {filtrosAtivos && (
              <button
                type="button"
                className={styles.emptyClearButton}
                onClick={limparFiltros}
              >
                Limpar filtros
              </button>
            )}
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
