import { useEffect, useState } from "react";

import {
  HeartHandshake,
  Plus,
  Pencil,
  Send,
  Ban,
  CalendarDays,
} from "lucide-react";

import {
  api,
  type AppointmentDetailsApi,
} from "../../../services/api";

import {
  type Prescricao,
  PRESCRICAO_STATUS_LABELS,
  PRESCRICAO_TIPO_LABELS,
  isOrientacaoTerapeutica,
} from "../../../types/prescricao";

import {
  PrescricaoFormModal,
} from "../Prescricoes/PrescricaoFormModal";

import styles from "./OrientacoesPage.module.css";

export function OrientacoesPage() {
  const [consultas, setConsultas] =
    useState<AppointmentDetailsApi[]>([]);

  const [consultaId, setConsultaId] =
    useState<number | null>(null);

  const [orientacoes, setOrientacoes] =
    useState<Prescricao[]>([]);

  const [loadingConsultas, setLoadingConsultas] =
    useState(true);

  const [loading, setLoading] = useState(false);
  const [processando, setProcessando] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);

  const [editando, setEditando] =
    useState<Prescricao | undefined>();

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [versao, setVersao] = useState(0);

  const consulta = consultas.find(
    (c) => c.id === consultaId
  );

  const consultaCancelada =
    consulta?.status === "CANCELLED";

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      try {
        const dados = await api.appointments.listMine();

        if (!ativo) return;

        setConsultas(dados);
        setConsultaId(dados[0]?.id ?? null);
      } catch (err) {
        if (ativo) {
          setErro(
            err instanceof Error
              ? err.message
              : "Erro ao carregar consultas."
          );
        }
      } finally {
        if (ativo) setLoadingConsultas(false);
      }
    }

    carregar();

    return () => {
      ativo = false;
    };
  }, []);

  useEffect(() => {
    if (consultaId === null) return;

    let ativo = true;
    const id = consultaId;

    async function carregar() {
      setLoading(true);
      setOrientacoes([]);
      setErro("");

      try {
        const dados = await api.prescriptions.list(id);

        if (!ativo) return;

        setOrientacoes(
          dados.filter(
            (item) => isOrientacaoTerapeutica(item.type)
          )
        );
      } catch (err) {
        if (ativo) {
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
  }, [consultaId, versao]);

  function atualizar() {
    setVersao((v) => v + 1);
  }

  function abrirNova() {
    if (!consulta || consultaCancelada) return;

    setEditando(undefined);
    setErro("");
    setSucesso("");
    setModalAberto(true);
  }

  function abrirEdicao(orientacao: Prescricao) {
    if (
      consultaCancelada ||
      orientacao.status !== "DRAFT"
    ) {
      return;
    }

    setEditando(orientacao);
    setErro("");
    setSucesso("");
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setEditando(undefined);
  }

  function handleSave() {
    fecharModal();

    setErro("");
    setSucesso("Orientação salva com sucesso.");

    atualizar();
  }

  async function emitir(orientacao: Prescricao) {
    if (
      processando ||
      consultaCancelada ||
      orientacao.status !== "DRAFT"
    ) {
      return;
    }

    if (
      !window.confirm(
        "Deseja disponibilizar esta orientação ao paciente?"
      )
    ) {
      return;
    }

    setProcessando(true);
    setErro("");
    setSucesso("");

    try {
      await api.prescriptions.issue(
        orientacao.consultationId,
        orientacao.id
      );

      setSucesso(
        "Orientação disponibilizada ao paciente."
      );

      atualizar();
    } catch (err) {
      setErro(
        err instanceof Error
          ? err.message
          : "Erro ao emitir orientação."
      );
    } finally {
      setProcessando(false);
    }
  }

  async function cancelar(orientacao: Prescricao) {
    if (
      processando ||
      orientacao.status === "CANCELLED"
    ) {
      return;
    }

    if (
      !window.confirm(
        "Deseja cancelar esta orientação?"
      )
    ) {
      return;
    }

    setProcessando(true);
    setErro("");
    setSucesso("");

    try {
      await api.prescriptions.cancel(
        orientacao.consultationId,
        orientacao.id
      );

      setSucesso("Orientação cancelada com sucesso.");

      atualizar();
    } catch (err) {
      setErro(
        err instanceof Error
          ? err.message
          : "Erro ao cancelar orientação."
      );
    } finally {
      setProcessando(false);
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <div className={styles.titleIcon}>
            <HeartHandshake size={25} />
          </div>

          <div>
            <h1>Orientações terapêuticas</h1>

            <p>
              Cadastre aconselhamentos e exercícios
              para seus pacientes.
            </p>
          </div>
        </div>

        <button
          type="button"
          className={styles.primaryButton}
          disabled={
            !consulta ||
            consultaCancelada ||
            loading ||
            loadingConsultas ||
            processando ||
            modalAberto
          }
          onClick={abrirNova}
        >
          <Plus size={18} />
          Nova orientação
        </button>
      </header>

      {erro && (
        <div className={styles.erro} role="alert">
          {erro}
        </div>
      )}

      {sucesso && (
        <div className={styles.sucesso} role="status">
          {sucesso}
        </div>
      )}

      <div className={styles.info}>
        <HeartHandshake size={22} />

        <div>
          <strong>Acompanhamento terapêutico</strong>

          <p>
            Registre aconselhamentos e exercícios
            sem prescrição de medicamentos.
            Este fluxo não exige CRM.
          </p>
        </div>
      </div>

      <section className={styles.card}>
        <h2>
          <CalendarDays size={19} />
          Consulta vinculada
        </h2>

        <label className={styles.field}>
          <span>Selecione uma consulta</span>

          <select
            value={consultaId ?? ""}
            disabled={
              loadingConsultas ||
              processando ||
              modalAberto
            }
            onChange={(e) => {
              setErro("");
              setSucesso("");
              setOrientacoes([]);

              setConsultaId(
                e.target.value
                  ? Number(e.target.value)
                  : null
              );
            }}
          >
            {!consultas.length && (
              <option value="">
                {loadingConsultas
                  ? "Carregando consultas..."
                  : "Nenhuma consulta encontrada"}
              </option>
            )}

            {consultas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.patient.name} —{" "}
                {new Date(
                  c.scheduledAt
                ).toLocaleString("pt-BR")}

                {c.status === "CANCELLED"
                  ? " (Cancelada)"
                  : ""}
              </option>
            ))}
          </select>
        </label>

        {consulta && (
          <div className={styles.consultaDados}>
            <div>
              <span>Paciente</span>
              <strong>{consulta.patient.name}</strong>
            </div>

            <div>
              <span>Profissional</span>
              <strong>{consulta.professional.name}</strong>
            </div>

            <div>
              <span>Especialidade</span>
              <strong>{consulta.professional.specialty}</strong>
            </div>
          </div>
        )}
      </section>

      {consultaCancelada && (
        <div className={styles.erro}>
          Esta consulta foi cancelada. Não é possível
          cadastrar, editar ou emitir orientações.
        </div>
      )}

      <section className={styles.listagem}>
        <div className={styles.listagemHeader}>
          <h2>Orientações da consulta</h2>

          <span>{orientacoes.length} registro(s)</span>
        </div>

        {loading || loadingConsultas ? (
          <div className={styles.empty}>
            Carregando orientações...
          </div>
        ) : orientacoes.length === 0 ? (
          <div className={styles.empty}>
            <HeartHandshake size={45} strokeWidth={1.3} />

            <h3>Nenhuma orientação encontrada</h3>

            <p>
              {erro
                ? "Não foi possível carregar os registros."
                : "As orientações cadastradas aparecerão aqui."}
            </p>
          </div>
        ) : (
          orientacoes.map((orientacao) => (
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
                    {new Date(
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

              <div className={styles.actions}>
                {orientacao.status === "DRAFT" &&
                  !consultaCancelada && (
                    <>
                      <button
                        type="button"
                        className={styles.secondaryButton}
                        disabled={
                          processando || modalAberto || loading
                        }
                        onClick={() => abrirEdicao(orientacao)}
                      >
                        <Pencil size={16} />
                        Editar
                      </button>

                      <button
                        type="button"
                        className={styles.primaryButton}
                        disabled={
                          processando || modalAberto || loading
                        }
                        onClick={() => emitir(orientacao)}
                      >
                        <Send size={16} />
                        Emitir
                      </button>
                    </>
                  )}

                {orientacao.status !== "CANCELLED" && (
                  <button
                    type="button"
                    className={styles.dangerButton}
                    disabled={
                      processando || modalAberto || loading
                    }
                    onClick={() => cancelar(orientacao)}
                  >
                    <Ban size={16} />
                    Cancelar
                  </button>
                )}
              </div>
            </article>
          ))
        )}
      </section>

      {modalAberto && consulta && !consultaCancelada && (
        <PrescricaoFormModal
          consulta={consulta}
          prescricao={editando}
          modo="ORIENTACOES"
          onClose={fecharModal}
          onSave={handleSave}
        />
      )}
    </div>
  );
}