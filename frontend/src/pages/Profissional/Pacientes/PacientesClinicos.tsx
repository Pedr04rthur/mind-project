import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Search,
  AlertTriangle,
  Smile,
  Frown,
  MinusCircle,
  ChevronRight,
} from "lucide-react";
import { usePacientes } from "../../../contexts/PacientesContext";
import { useRegistrosHumor } from "../../../contexts/RegistrosHumorContext";
import { getDataDiaAtual } from "../../../utils/dates";
import { matchesSearch } from "../../../utils/search";
import type { Paciente } from "../../../types/paciente";
import type { RegistroHumor } from "../../../types/humor";
import styles from "./PacientesClinicos.module.css";

interface LinhaPaciente {
  paciente: Paciente;
  ultimoRegistro: RegistroHumor | null;
  /** Contagem de "ruim" nos últimos 5 registros */
  ruinsRecentes: number;
  temAlerta: boolean;
}

export function PacientesClinicos() {
  const navigate = useNavigate();
  const { pacientes } = usePacientes();
  const { registros } = useRegistrosHumor();
  const [busca, setBusca] = useState("");

  const linhas = useMemo<LinhaPaciente[]>(() => {
    return pacientes.map((paciente) => {
      const registrosDoPaciente = registros
        .filter((r) => r.cpfPaciente === paciente.cpf)
        .sort(
          (a, b) =>
            new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime()
        );

      const ultimo = registrosDoPaciente[0] ?? null;

      const ultimos5 = registrosDoPaciente.slice(0, 5);
      const ruinsRecentes = ultimos5.filter((r) => r.humor === "ruim").length;
      const temAlerta = ruinsRecentes >= 3;

      return { paciente, ultimoRegistro: ultimo, ruinsRecentes, temAlerta };
    });
  }, [pacientes, registros]);

  const filtrados = useMemo(() => {
    return linhas.filter((l) =>
      matchesSearch(busca, l.paciente.nome, l.paciente.cpf, l.paciente.email)
    );
  }, [linhas, busca]);

  const comAlerta = filtrados.filter((l) => l.temAlerta).length;

  const abrir = (cpf: string) => {
    navigate(`/profissional/pacientes/${encodeURIComponent(cpf)}`);
  };

  const hoje = getDataDiaAtual();

  return (
    <section className={styles.page}>
      <header className={styles.pageHeader}>
        <div className={styles.pageTitle}>
          <div className={styles.titleIcon}>
            <Users size={22} strokeWidth={2} />
          </div>
          <div>
            <h1 className={styles.title}>Meus pacientes</h1>
            <p className={styles.subtitle}>
              Acompanhe a evolução de humor e abra o prontuário de cada paciente.
            </p>
          </div>
        </div>
      </header>

      {comAlerta > 0 && (
        <div className={styles.alertBanner} role="alert">
          <AlertTriangle size={18} strokeWidth={2.2} />
          <div>
            <strong>
              {comAlerta} {comAlerta === 1 ? "paciente precisa" : "pacientes precisam"} de atenção
            </strong>
            <p>
              Identificamos registros de humor ruim consecutivos. Recomenda-se
              contato ativo.
            </p>
          </div>
        </div>
      )}

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
            <MinusCircle size={28} strokeWidth={1.6} />
            <p>
              {busca
                ? `Nenhum paciente encontrado para "${busca}".`
                : "Nenhum paciente atribuído a você ainda."}
            </p>
          </div>
        ) : (
          <ul className={styles.list}>
            {filtrados.map(({ paciente, ultimoRegistro, ruinsRecentes, temAlerta }) => (
              <li key={paciente.cpf}>
                <button
                  type="button"
                  className={`${styles.row} ${temAlerta ? styles.rowAlerta : ""}`}
                  onClick={() => abrir(paciente.cpf)}
                >
                  <div className={styles.rowLeft}>
                    <span
                      className={`${styles.avatar} ${
                        temAlerta ? styles.avatarAlerta : ""
                      }`}
                    >
                      {paciente.nome
                        .split(" ")
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((n) => n[0]?.toUpperCase())
                        .join("")}
                    </span>
                    <div className={styles.rowInfo}>
                      <span className={styles.rowName}>{paciente.nome}</span>
                      <span className={styles.rowMeta}>
                        CPF {paciente.cpf}
                      </span>
                    </div>
                  </div>

                  <div className={styles.rowMood}>
                    {ultimoRegistro ? (
                      <>
                        <span
                          className={`${styles.moodIcon} ${
                            ultimoRegistro.humor === "bom"
                              ? styles.moodBom
                              : styles.moodRuim
                          }`}
                          aria-hidden="true"
                        >
                          {ultimoRegistro.humor === "bom" ? (
                            <Smile size={18} />
                          ) : (
                            <Frown size={18} />
                          )}
                        </span>
                        <div className={styles.moodText}>
                          <span className={styles.moodLabel}>
                            Último:{" "}
                            {ultimoRegistro.humor === "bom" ? "Bom" : "Ruim"}
                          </span>
                          <span className={styles.moodDate}>
                            {ultimoRegistro.dataDia === hoje
                              ? "Hoje"
                              : ultimoRegistro.dataDia}
                          </span>
                        </div>
                      </>
                    ) : (
                      <span className={styles.semRegistro}>
                        Sem registros ainda
                      </span>
                    )}
                  </div>

                  {temAlerta && (
                    <span className={styles.alertaBadge}>
                      <AlertTriangle size={12} aria-hidden="true" />
                      {ruinsRecentes} de 5 ruins
                    </span>
                  )}

                  <ChevronRight
                    size={18}
                    className={styles.rowChevron}
                    aria-hidden="true"
                  />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
