import { useEffect, useState } from "react";

import {
  HeartHandshake,
  RefreshCw,
  CalendarDays,
  Stethoscope,
} from "lucide-react";

import {
  api,
  type AppointmentDetailsApi,
} from "../../services/api";

import {
  type Prescricao,
  PRESCRICAO_STATUS_LABELS,
  PRESCRICAO_TIPO_LABELS,
  isOrientacaoTerapeutica,
} from "../../types/prescricao";

import styles from "../Profissional/Orientacoes/OrientacoesPage.module.css";

interface OrientacaoPaciente {
  orientacao: Prescricao;
  consulta: AppointmentDetailsApi;
}

export function Orientacoes() {
  const [registros, setRegistros] =
    useState<OrientacaoPaciente[]>([]);

  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [versao, setVersao] = useState(0);

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      setLoading(true);
      setErro("");
      setRegistros([]);

      try {
        const consultas = await api.appointments.listMine();

        const resultados = await Promise.allSettled(
          consultas.map(async (consulta) => {
            const dados =
              await api.prescriptions.list(consulta.id);

            return dados
              .filter(
                (item) =>
                  isOrientacaoTerapeutica(item.type) &&
                  (
                    item.status === "ISSUED" ||
                    (
                      item.status === "CANCELLED" &&
                      item.issuedAt !== null
                    )
                  )
              )
              .map((orientacao) => ({
                orientacao,
                consulta,
              }));
          })
        );

        const lista: OrientacaoPaciente[] = [];

        let falhas = 0;

        resultados.forEach((resultado) => {
          if (resultado.status === "fulfilled") {
            lista.push(...resultado.value);
          } else {
            falhas++;
          }
        });

        lista.sort(
          (a, b) =>
            new Date(
              b.orientacao.issuedAt ??
              b.orientacao.createdAt
            ).getTime() -
            new Date(
              a.orientacao.issuedAt ??
              a.orientacao.createdAt
            ).getTime()
        );

        if (!ativo) return;

        setRegistros(lista);

        if (falhas > 0) {
          setErro(
            "Não foi possível carregar todas as orientações."
          );
        }
      } catch (err) {
        if (ativo) {
          setRegistros([]);

          setErro(
            err instanceof Error
              ? err.message
              : "Erro ao carregar orientações."
          );
        }
      } finally {
        if (ativo) setLoading(false);
      }
    }

    carregar();

    return () => {
      ativo = false;
    };
  }, [versao]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <div className={styles.titleIcon}>
            <HeartHandshake size={25} />
          </div>

          <div>
            <h1>Minhas orientações</h1>

            <p>
              Acompanhe os aconselhamentos e exercícios
              dos seus profissionais.
            </p>
          </div>
        </div>

        <button
          type="button"
          className={styles.secondaryButton}
          disabled={loading}
          onClick={() => setVersao((v) => v + 1)}
        >
          <RefreshCw size={17} />
          Atualizar
        </button>
      </header>

      <div className={styles.info}>
        <HeartHandshake size={22} />

        <div>
          <strong>Seu acompanhamento terapêutico</strong>

          <p>
            Consulte as orientações disponibilizadas
            pelos profissionais responsáveis pelo seu
            acompanhamento.
          </p>
        </div>
      </div>

      {erro && (
        <div className={styles.erro} role="alert">
          {erro}
        </div>
      )}

      {loading ? (
        <div className={styles.empty}>
          Carregando orientações...
        </div>
      ) : registros.length === 0 ? (
        <div className={styles.empty}>
          <HeartHandshake size={48} strokeWidth={1.3} />

          <h3>Nenhuma orientação disponível</h3>

          <p>
            {erro
              ? "Não foi possível carregar os registros."
              : "As orientações emitidas pelos seus profissionais aparecerão aqui."}
          </p>
        </div>
      ) : (
        registros.map(({ orientacao, consulta }) => (
          <article
            className={styles.card}
            key={orientacao.id}
          >
            <div className={styles.cardHeader}>
              <div>
                <h3>
                  {PRESCRICAO_TIPO_LABELS[orientacao.type]}
                  {" "}#{orientacao.id}
                </h3>

                <small>
                  Emitida em{" "}
                  {new Date(
                    orientacao.issuedAt ??
                    orientacao.createdAt
                  ).toLocaleString("pt-BR")}
                </small>
              </div>

              <span
                className={`${styles.badge} ${
                  styles[orientacao.status]
                }`}
              >
                {PRESCRICAO_STATUS_LABELS[orientacao.status]}
              </span>
            </div>

            <div className={styles.contentBlock}>
              <p>
                <Stethoscope size={16} />{" "}
                {consulta.professional.name}
              </p>

              <p>{consulta.professional.specialty}</p>

              <p>
                <CalendarDays size={16} />{" "}
                Consulta em{" "}
                {new Date(
                  consulta.scheduledAt
                ).toLocaleString("pt-BR")}
              </p>
            </div>

            {orientacao.status === "CANCELLED" && (
              <div
                className={styles.erro}
                style={{ marginTop: 16 }}
              >
                Esta orientação foi cancelada pelo
                profissional. Consulte-o antes de
                continuar as atividades.
              </div>
            )}

            {orientacao.instructions && (
              <div className={styles.contentBlock}>
                <strong>
                  {orientacao.type === "COUNSELING"
                    ? "Aconselhamento"
                    : "Orientações gerais"}
                </strong>

                <p>{orientacao.instructions}</p>
              </div>
            )}

            {orientacao.recommendations && (
              <div className={styles.contentBlock}>
                <strong>
                  {orientacao.type === "EXERCISE"
                    ? "Descrição do exercício"
                    : "Recomendações"}
                </strong>

                <p>{orientacao.recommendations}</p>
              </div>
            )}

            {orientacao.followUpInstructions && (
              <div className={styles.contentBlock}>
                <strong>
                  Frequência, duração e acompanhamento
                </strong>

                <p>{orientacao.followUpInstructions}</p>
              </div>
            )}
          </article>
        ))
      )}
    </div>
  );
}