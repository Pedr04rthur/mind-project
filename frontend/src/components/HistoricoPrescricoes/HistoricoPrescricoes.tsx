import { useEffect, useState } from "react";
import {
  Pill,
  ClipboardList,
  Calendar,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

import { api } from "../../services/api";
import { cpfToApi } from "../../services/adapters";
import type { Prescricao } from "../../types/prescricao";

import styles from "./HistoricoPrescricoes.module.css";

interface Props {
  cpf: string;
  modo: "MEDICAMENTOS" | "ORIENTACOES";
}

const TIPOS: Record<string, string> = {
  MEDICATION: "Medicamento",
  EXAM: "Exame",
  COUNSELING: "Aconselhamento",
  EXERCISE: "Exercício",
  THERAPEUTIC: "Orientação terapêutica",
};

const STATUS: Record<string, string> = {
  DRAFT: "Rascunho",
  ISSUED: "Emitida",
  CANCELLED: "Cancelada",
};

function formatarData(data: string) {
  return new Date(data).toLocaleString("pt-BR");
}

export function HistoricoPrescricoes({ cpf, modo }: Props) {
  const [prescricoes, setPrescricoes] =
    useState<Prescricao[]>([]);

  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [versao, setVersao] = useState(0);
  const [filtro, setFiltro] = useState("TODAS");

  const medicamentos = modo === "MEDICAMENTOS";

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      setLoading(true);
      setErro(null);
      setPrescricoes([]);

      try {
        const consultas = await api.appointments.listMine();

        const consultasPaciente = consultas.filter(
          (c) => cpfToApi(c.patient.cpf) === cpfToApi(cpf)
        );

        if (!consultasPaciente.some(
          (c) => c.status !== "CANCELLED"
        )) {
          throw new Error(
            "Este paciente não está vinculado a você."
          );
        }

        const resultados = await Promise.allSettled(
          consultasPaciente.map(
            (consulta) => api.prescriptions.list(consulta.id)
          )
        );

        if (!ativo) return;

        const registros: Prescricao[] = [];
        let falhas = 0;

        for (const resultado of resultados) {
          if (resultado.status === "fulfilled") {
            registros.push(...resultado.value);
          } else {
            falhas++;
          }
        }

        const filtrados = registros.filter((p) =>
          medicamentos
            ? p.type === "MEDICATION"
            : [
                "THERAPEUTIC",
                "COUNSELING",
                "EXERCISE",
              ].includes(p.type)
        );

        filtrados.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
        );

        setPrescricoes(filtrados);

        if (falhas > 0) {
          setErro(
            `Não foi possível carregar as prescrições de ${falhas} consulta(s).`
          );
        }

      } catch (err) {
        if (!ativo) return;

        setErro(
          err instanceof Error
            ? err.message
            : "Não foi possível carregar o histórico."
        );

      } finally {
        if (ativo) setLoading(false);
      }
    }

    void carregar();

    return () => {
      ativo = false;
    };
  }, [cpf, modo, versao, medicamentos]);

  const filtradas = prescricoes.filter(
    (p) => filtro === "TODAS" || p.status === filtro
  );

  return (
    <section className={styles.container}>
      <header className={styles.header}>
        <div>
          <h2>
            {medicamentos
              ? "Histórico de prescrições"
              : "Orientações terapêuticas"}
          </h2>

          <p>
            Registros dos seus atendimentos com este paciente.
          </p>
        </div>

        <button
          className={styles.button}
          disabled={loading}
          onClick={() => setVersao((v) => v + 1)}
        >
          <RefreshCw size={16} />
          Atualizar
        </button>
      </header>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span>Total de registros</span>
          <strong>{prescricoes.length}</strong>
        </div>

        <div className={styles.stat}>
          <span>Emitidas</span>
          <strong className={styles.green}>
            {prescricoes.filter(
              (p) => p.status === "ISSUED"
            ).length}
          </strong>
        </div>

        <div className={styles.stat}>
          <span>Rascunhos</span>
          <strong className={styles.yellow}>
            {prescricoes.filter(
              (p) => p.status === "DRAFT"
            ).length}
          </strong>
        </div>

        <div className={styles.stat}>
          <span>Canceladas</span>
          <strong className={styles.red}>
            {prescricoes.filter(
              (p) => p.status === "CANCELLED"
            ).length}
          </strong>
        </div>
      </div>

      <div className={styles.toolbar}>
        <span>{filtradas.length} registros</span>

        <select
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        >
          <option value="TODAS">Todos os status</option>
          <option value="ISSUED">Emitidas</option>
          <option value="DRAFT">Rascunhos</option>
          <option value="CANCELLED">Canceladas</option>
        </select>
      </div>

      {erro && (
        <div className={styles.error}>
          <AlertCircle size={18} />
          {erro}
        </div>
      )}

      {loading ? (
        <div className={styles.empty}>
          <RefreshCw size={28} />
          <p>Carregando histórico...</p>
        </div>
      ) : filtradas.length === 0 ? (
        <div className={styles.empty}>
          {medicamentos
            ? <Pill size={36} />
            : <ClipboardList size={36} />}

          <h3>
            {medicamentos
              ? "Nenhuma prescrição encontrada"
              : "Nenhuma orientação encontrada"}
          </h3>

          <p>
            {erro
              ? "O histórico pode estar incompleto."
              : "Não existem registros para os filtros selecionados."}
          </p>
        </div>
      ) : (
        <div className={styles.list}>
          {filtradas.map((prescricao) => (
            <article
              key={prescricao.id}
              className={styles.card}
            >
              <div className={styles.cardHeader}>
                <div className={styles.icon}>
                  {medicamentos
                    ? <Pill size={23} />
                    : <ClipboardList size={23} />}
                </div>

                <div className={styles.title}>
                  <h3>
                    {TIPOS[prescricao.type] ?? prescricao.type}
                    {" "}#{prescricao.id}
                  </h3>

                  <span>
                    Consulta #{prescricao.consultationId}
                  </span>
                </div>

                <span
                  className={`${styles.badge} ${
                    styles[prescricao.status]
                  }`}
                >
                  {STATUS[prescricao.status]}
                </span>
              </div>

              <div className={styles.date}>
                <Calendar size={15} />
                Criada em {formatarData(prescricao.createdAt)}
              </div>

              {prescricao.issuedAt && (
                <div className={styles.date}>
                  Emitida em {formatarData(prescricao.issuedAt)}
                </div>
              )}

              {prescricao.cancelledAt && (
                <div className={styles.date}>
                  Cancelada em {formatarData(prescricao.cancelledAt)}
                </div>
              )}

              {medicamentos && (
                <div className={styles.items}>
                  {prescricao.items.map((item, index) => (
                    <div
                      className={styles.medication}
                      key={index}
                    >
                      <h4>{item.medicationName}</h4>

                      <div className={styles.grid}>
                        {[
                          ["Princípio ativo", item.activeIngredient],
                          ["Concentração", item.concentration],
                          ["Forma farmacêutica", item.pharmaceuticalForm],
                          ["Dose", item.dose],
                          ["Via de administração", item.route],
                          ["Frequência", item.frequency],
                          ["Duração", item.duration],
                          ["Quantidade", item.quantity],
                        ].map(([label, valor]) => (
                          <div
                            className={styles.field}
                            key={label}
                          >
                            <span>{label}</span>
                            <strong>{valor || "—"}</strong>
                          </div>
                        ))}
                      </div>

                      {item.instructions && (
                        <div className={styles.textBlock}>
                          <strong>Instruções do medicamento</strong>
                          <p>{item.instructions}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {[
                ["Instruções", prescricao.instructions],
                ["Recomendações", prescricao.recommendations],
                ["Acompanhamento", prescricao.followUpInstructions],
              ].map(([label, valor]) =>
                valor ? (
                  <div
                    className={styles.textBlock}
                    key={label}
                  >
                    <strong>{label}</strong>
                    <p>{valor}</p>
                  </div>
                ) : null
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
