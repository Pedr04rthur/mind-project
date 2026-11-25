import { useEffect, useState } from "react";

import {
  FileText,
  CalendarDays,
  Stethoscope,
  Pill,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

import {
  api,
  type AppointmentDetailsApi,
} from "../../services/api";

import {
  type Prescricao,
  PRESCRICAO_TIPO_LABELS,
  isOrientacaoTerapeutica,
} from "../../types/prescricao";

import styles from "./Prescricoes.module.css";

interface PrescricaoPaciente {
  prescricao: Prescricao;
  consulta: AppointmentDetailsApi;
}

function formatarData(data: string | null) {
  if (!data) return "—";

  return new Date(data).toLocaleDateString("pt-BR");
}

export function Prescricoes() {
  const [prescricoes, setPrescricoes] =
    useState<PrescricaoPaciente[]>([]);

  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [expandida, setExpandida] = useState<number | null>(null);
  const [filtro, setFiltro] = useState("TODAS");
  const [versao, setVersao] = useState(0);

  useEffect(() => {
    let ativo = true;

    async function carregarPrescricoes() {
      setLoading(true);
      setErro("");
      setPrescricoes([]);

      try {
        const consultas = await api.appointments.listMine();

        const resultados = await Promise.allSettled(
          consultas.map(async (consulta) => {
            const response = await api.prescriptions.list(consulta.id);

            return response
              .filter(
                (prescricao) =>
                  !isOrientacaoTerapeutica(prescricao.type) &&
                  (
                    prescricao.status === "ISSUED" ||
                    (
                      prescricao.status === "CANCELLED" &&
                      prescricao.issuedAt !== null
                    )
                  )
              )
              .map((prescricao) => ({
                prescricao,
                consulta,
              }));
          })
        );

        const registros: PrescricaoPaciente[] = [];

        let falhas = 0;

        for (const resultado of resultados) {
          if (resultado.status === "fulfilled") {
            registros.push(...resultado.value);
          } else {
            falhas++;
          }
        }

        registros.sort(
          (a, b) =>
            new Date(
              b.prescricao.issuedAt ?? b.prescricao.createdAt
            ).getTime() -
            new Date(
              a.prescricao.issuedAt ?? a.prescricao.createdAt
            ).getTime()
        );

        if (!ativo) return;

        setPrescricoes(registros);

        if (falhas > 0) {
          setErro(
            "Não foi possível carregar todas as prescrições. Tente novamente."
          );
        }
      } catch (err) {
        if (ativo) {
          setErro(
            err instanceof Error
              ? err.message
              : "Erro ao carregar prescrições."
          );
        }
      } finally {
        if (ativo) setLoading(false);
      }
    }

    carregarPrescricoes();

    return () => {
      ativo = false;
    };
  }, [versao]);

  const emitidas = prescricoes.filter(
    ({ prescricao }) => prescricao.status === "ISSUED"
  ).length;

  const canceladas = prescricoes.filter(
    ({ prescricao }) => prescricao.status === "CANCELLED"
  ).length;

  const prescricoesFiltradas = prescricoes.filter(
    ({ prescricao }) =>
      filtro === "TODAS" || prescricao.status === filtro
  );

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <div className={styles.titleIcon}>
            <FileText size={25} strokeWidth={2} />
          </div>

          <div>
            <h1>Minhas prescrições</h1>

            <p>
              Consulte as prescrições emitidas
              pelos seus profissionais.
            </p>
          </div>
        </div>

        <button
          type="button"
          className={styles.refreshButton}
          disabled={loading}
          onClick={() => setVersao((v) => v + 1)}
        >
          <RefreshCw size={16} />
          Atualizar
        </button>
      </header>

      <div className={styles.resumo}>
        <div className={styles.resumoCard}>
          <div className={styles.resumoIcon}>
            <FileText size={22} />
          </div>

          <div>
            <span>Total de prescrições</span>
            <strong>{loading ? "—" : prescricoes.length}</strong>
          </div>
        </div>

        <div className={styles.resumoCard}>
          <div className={styles.resumoIconGreen}>
            <Pill size={22} />
          </div>

          <div>
            <span>Emitidas</span>
            <strong>{loading ? "—" : emitidas}</strong>
          </div>
        </div>

        <div className={styles.resumoCard}>
          <div className={styles.resumoIconRed}>
            <AlertCircle size={22} />
          </div>

          <div>
            <span>Canceladas</span>
            <strong>{loading ? "—" : canceladas}</strong>
          </div>
        </div>
      </div>

      {erro && (
        <div className={styles.erro} role="alert">
          <AlertCircle size={20} />
          {erro}
        </div>
      )}

      <section className={styles.listagem}>
        <div className={styles.listagemHeader}>
          <h2>Histórico de prescrições</h2>

          <select
            className={styles.filtro}
            value={filtro}
            aria-label="Filtrar prescrições por status"
            onChange={(e) => setFiltro(e.target.value)}
          >
            <option value="TODAS">Todas as prescrições</option>
            <option value="ISSUED">Emitidas</option>
            <option value="CANCELLED">Canceladas</option>
          </select>
        </div>

        {loading ? (
          <div className={styles.empty}>
            <RefreshCw size={32} className={styles.spinner} />
            <p>Carregando prescrições...</p>
          </div>
        ) : prescricoesFiltradas.length === 0 ? (
          <div className={styles.empty}>
            <FileText size={48} strokeWidth={1.3} />

            <h3>Nenhuma prescrição encontrada</h3>

            <p>
              {erro
                ? "Não foi possível carregar todos os registros."
                : "As prescrições emitidas pelos seus profissionais aparecerão aqui."}
            </p>
          </div>
        ) : (
          <div className={styles.cards}>
            {prescricoesFiltradas.map(({ prescricao, consulta }) => {
              const aberta = expandida === prescricao.id;
              const cancelada = prescricao.status === "CANCELLED";
              const medicamento = prescricao.type === "MEDICATION";

              return (
                <article
                  key={prescricao.id}
                  className={styles.prescricaoCard}
                >
                  <div className={styles.cardHeader}>
                    <div className={styles.cardTitle}>
                      <div className={styles.cardIcon}>
                        <FileText size={23} />
                      </div>

                      <div>
                        <h3>
                          {PRESCRICAO_TIPO_LABELS[prescricao.type]}
                          {" "}#{prescricao.id}
                        </h3>

                        <span>
                          Emitida em {formatarData(prescricao.issuedAt)}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`${styles.badge} ${
                        cancelada
                          ? styles.cancelada
                          : styles.emitida
                      }`}
                    >
                      {cancelada ? "Cancelada" : "Emitida"}
                    </span>
                  </div>

                  <div className={styles.informacoes}>
                    <div className={styles.info}>
                      <Stethoscope size={19} />

                      <div>
                        <span>Profissional responsável</span>
                        <strong>{consulta.professional.name}</strong>
                        <small>{consulta.professional.specialty}</small>
                      </div>
                    </div>

                    <div className={styles.info}>
                      <CalendarDays size={19} />

                      <div>
                        <span>Data da consulta</span>
                        <strong>
                          {formatarData(consulta.scheduledAt)}
                        </strong>
                      </div>
                    </div>

                    <div className={styles.info}>
                      {medicamento
                        ? <Pill size={19} />
                        : <FileText size={19} />
                      }

                      <div>
                        <span>Tipo de prescrição</span>

                        <strong>
                          {PRESCRICAO_TIPO_LABELS[prescricao.type]}
                        </strong>

                        {medicamento && (
                          <small>
                            {prescricao.items.length} medicamento(s)
                          </small>
                        )}
                      </div>
                    </div>
                  </div>

                  {cancelada && (
                    <div className={styles.avisoCancelamento}>
                      <AlertCircle size={18} />

                      <div>
                        <strong>Prescrição cancelada</strong>

                        <p>
                          Esta prescrição não está mais válida.
                          Consulte seu profissional para receber
                          orientações atualizadas.
                        </p>

                        <small>
                          Cancelada em{" "}
                          {formatarData(prescricao.cancelledAt)}
                        </small>
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    className={styles.detalhesButton}
                    aria-expanded={aberta}
                    onClick={() =>
                      setExpandida(aberta ? null : prescricao.id)
                    }
                  >
                    {aberta
                      ? "Ocultar detalhes"
                      : "Visualizar prescrição"}

                    {aberta
                      ? <ChevronUp size={18} />
                      : <ChevronDown size={18} />
                    }
                  </button>

                  {aberta && (
                    <div className={styles.detalhes}>
                      {cancelada && (
                        <p className={styles.historicoAviso}>
                          Registro histórico de uma prescrição cancelada.
                          Não utilize estas informações como orientação atual.
                        </p>
                      )}

                      {medicamento && (
                        <h3>Medicamentos prescritos</h3>
                      )}

                      {medicamento && prescricao.items.map((item) => (
                        <div
                          key={item.id}
                          className={styles.medicamento}
                        >
                          <div className={styles.medicamentoTitle}>
                            <Pill size={20} />
                            <h4>{item.medicationName}</h4>
                          </div>

                          <div className={styles.medicamentoGrid}>
                            <div>
                              <span>Princípio ativo</span>
                              <strong>{item.activeIngredient || "—"}</strong>
                            </div>

                            <div>
                              <span>Concentração</span>
                              <strong>{item.concentration || "—"}</strong>
                            </div>

                            <div>
                              <span>Forma farmacêutica</span>
                              <strong>{item.pharmaceuticalForm || "—"}</strong>
                            </div>

                            <div>
                              <span>Dosagem</span>
                              <strong>{item.dose}</strong>
                            </div>

                            <div>
                              <span>Via de administração</span>
                              <strong>{item.route}</strong>
                            </div>

                            <div>
                              <span>Frequência</span>
                              <strong>{item.frequency}</strong>
                            </div>

                            <div>
                              <span>Duração</span>
                              <strong>{item.duration}</strong>
                            </div>

                            <div>
                              <span>Quantidade</span>
                              <strong>{item.quantity}</strong>
                            </div>
                          </div>

                          {item.instructions && (
                            <div className={styles.orientacao}>
                              <strong>Instruções de uso</strong>
                              <p>{item.instructions}</p>
                            </div>
                          )}
                        </div>
                      ))}

                      {prescricao.instructions && (
                        <div className={styles.orientacao}>
                          <strong>
                            {prescricao.type === "EXAM"
                              ? "Exame solicitado"
                              : "Orientações gerais"}
                          </strong>

                          <p>{prescricao.instructions}</p>
                        </div>
                      )}

                      {prescricao.recommendations && (
                        <div className={styles.orientacao}>
                          <strong>Recomendações</strong>
                          <p>{prescricao.recommendations}</p>
                        </div>
                      )}

                      {prescricao.followUpInstructions && (
                        <div className={styles.orientacao}>
                          <strong>Orientações de acompanhamento</strong>
                          <p>{prescricao.followUpInstructions}</p>
                        </div>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>

      <div className={styles.aviso}>
        <AlertCircle size={21} />

        <div>
          <strong>Cuide da sua saúde</strong>

          <p>
            Siga as orientações do seu profissional de saúde.
            Não altere dosagens nem interrompa tratamentos
            sem orientação médica.
          </p>
        </div>
      </div>
    </div>
  );
}