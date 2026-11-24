import { useEffect, useState } from "react";

import {
  FileText,
  Plus,
  Pencil,
  Send,
  Ban,
  CalendarDays,
  ShieldAlert,
} from "lucide-react";

import {
  api,
  ApiError,
  type AppointmentDetailsApi,
} from "../../../services/api";

import {
  PRESCRICAO_STATUS_LABELS,
  PRESCRICAO_TIPO_LABELS,
  isOrientacaoTerapeutica,
  type Prescricao,
} from "../../../types/prescricao";

import { PrescricaoFormModal } from "./PrescricaoFormModal";

import styles from "./PrescricoesClinicasPage.module.css";

const MENSAGEM_PERMISSAO_NEGADA =
  "Você não possui autorização para prescrever medicamentos. " +
  "A prescrição medicamentosa é restrita a médicos psiquiatras " +
  "com registro ativo no CRM.";

function tratarErro(err: unknown, mensagemPadrao: string): string {
  if (err instanceof ApiError && err.status === 403) {
    return "Permissão negada para esta operação.";
  }

  return err instanceof Error ? err.message : mensagemPadrao;
}

export function PrescricoesClinicasPage() {
  const [consultas, setConsultas] = useState<AppointmentDetailsApi[]>([]);
  const [consultaId, setConsultaId] = useState<number | null>(null);
  const [prescricoes, setPrescricoes] = useState<Prescricao[]>([]);

  const [loadingConsultas, setLoadingConsultas] = useState(true);
  const [loadingPrescricoes, setLoadingPrescricoes] = useState(false);
  const [processando, setProcessando] = useState(false);

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Prescricao | undefined>();

  const [versao, setVersao] = useState(0);

  const consulta = consultas.find((c) => c.id === consultaId);

  const especialidade = consulta?.professional.specialty
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

  // Restrição provisória baseada na especialidade.
  const podePrescrever =
    especialidade === "psiquiatria" ||
    especialidade === "psiquiatria clinica";

  const consultaCancelada = consulta?.status === "CANCELLED";

  useEffect(() => {
    let ativo = true;

    async function carregarConsultas() {
      try {
        const response = await api.appointments.listMine();

        if (!ativo) return;

        setConsultas(response);
        setConsultaId(response[0]?.id ?? null);
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

    carregarConsultas();

    return () => {
      ativo = false;
    };
  }, []);

  useEffect(() => {
    if (consultaId === null) return;

    let ativo = true;

    async function carregarPrescricoes(id: number) {
      setLoadingPrescricoes(true);
      setPrescricoes([]);
      setErro("");

      try {
        const response = await api.prescriptions.list(id);

        if (ativo) {
          setPrescricoes(
            response.filter(
              (item) => !isOrientacaoTerapeutica(item.type)
            )
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
        if (ativo) setLoadingPrescricoes(false);
      }
    }

    carregarPrescricoes(consultaId);

    return () => {
      ativo = false;
    };
  }, [consultaId, versao]);

  function atualizarLista() {
    setVersao((v) => v + 1);
  }

  function validarPermissao(): boolean {
    if (!consulta) {
      setErro("Selecione uma consulta.");
      return false;
    }

    if (!podePrescrever) {
      setSucesso("");
      setErro(`Permissão negada. ${MENSAGEM_PERMISSAO_NEGADA}`);
      return false;
    }

    return true;
  }

  function abrirNovaPrescricao() {
    if (!validarPermissao()) return;

    if (consultaCancelada) {
      setErro(
        "Não é possível criar prescrições para consultas canceladas."
      );
      return;
    }

    setErro("");
    setSucesso("");
    setEditando(undefined);
    setModalAberto(true);
  }

  function abrirEdicao(prescricao: Prescricao) {
    if (!validarPermissao()) return;

    if (consultaCancelada) {
      setErro(
        "Não é possível editar prescrições de consultas canceladas."
      );
      return;
    }

    if (prescricao.status !== "DRAFT") {
      setErro("Somente prescrições em rascunho podem ser editadas.");
      return;
    }

    setErro("");
    setSucesso("");
    setEditando(prescricao);
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setEditando(undefined);
  }

  function handleSave() {
    fecharModal();
    setErro("");
    setSucesso("Prescrição salva com sucesso.");
    atualizarLista();
  }

  async function emitir(prescricao: Prescricao) {
    if (processando || !validarPermissao()) return;

    if (consultaCancelada) {
      setErro(
        "Não é possível emitir prescrições de consultas canceladas."
      );
      return;
    }

    if (prescricao.status !== "DRAFT") {
      setErro("Somente prescrições em rascunho podem ser emitidas.");
      return;
    }

    if (!window.confirm("Deseja emitir esta prescrição?")) return;

    setProcessando(true);
    setErro("");
    setSucesso("");

    try {
      await api.prescriptions.issue(
        prescricao.consultationId,
        prescricao.id
      );

      setSucesso("Prescrição emitida com sucesso.");
      atualizarLista();
    } catch (err) {
      setErro(tratarErro(err, "Erro ao emitir prescrição."));
    } finally {
      setProcessando(false);
    }
  }

  async function cancelar(prescricao: Prescricao) {
    if (processando || !validarPermissao()) return;

    if (prescricao.status === "CANCELLED") return;

    if (!window.confirm("Deseja cancelar esta prescrição?")) return;

    setProcessando(true);
    setErro("");
    setSucesso("");

    try {
      await api.prescriptions.cancel(
        prescricao.consultationId,
        prescricao.id
      );

      setSucesso("Prescrição cancelada com sucesso.");
      atualizarLista();
    } catch (err) {
      setErro(tratarErro(err, "Erro ao cancelar prescrição."));
    } finally {
      setProcessando(false);
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <div className={styles.titleIcon}>
            <FileText size={24} />
          </div>

          <div>
            <h1>Prescrições</h1>
            <p>
              Gerencie as prescrições vinculadas às suas consultas.
            </p>
          </div>
        </div>

        <button
          type="button"
          className={styles.primaryButton}
          onClick={abrirNovaPrescricao}
          title={
            consulta && !podePrescrever
              ? MENSAGEM_PERMISSAO_NEGADA
              : "Cadastrar nova prescrição"
          }
          disabled={
            !consulta ||
            !podePrescrever ||
            consultaCancelada ||
            loadingConsultas ||
            loadingPrescricoes ||
            processando ||
            modalAberto
          }
        >
          <Plus size={18} />
          Nova prescrição
        </button>
      </header>

      {erro && (
        <div role="alert" className={styles.erro}>
          {erro}
        </div>
      )}

      {sucesso && (
        <div role="status" className={styles.sucesso}>
          {sucesso}
        </div>
      )}

      <section className={styles.consultaCard}>
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
              setPrescricoes([]);
              setSucesso("");
              setErro("");
              setEditando(undefined);

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
                {new Date(c.scheduledAt).toLocaleString("pt-BR")}
                {c.status === "CANCELLED" ? " (Cancelada)" : ""}
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

      {consulta && !podePrescrever && (
        <div className={styles.aviso} role="alert">
          <ShieldAlert size={22} aria-hidden="true" />

          <div>
            <strong>Permissão negada</strong>

            <p>{MENSAGEM_PERMISSAO_NEGADA}</p>

            <p>
              Para cadastrar aconselhamentos e exercícios,
              utilize o menu Orientações.
            </p>
          </div>
        </div>
      )}

      {consultaCancelada && (
        <div className={styles.aviso} role="alert">
          <ShieldAlert size={22} aria-hidden="true" />

          <div>
            <strong>Consulta cancelada</strong>

            <p>
              Não é possível cadastrar, editar ou emitir
              prescrições para uma consulta cancelada.
            </p>
          </div>
        </div>
      )}

      <section className={styles.listagem}>
        <div className={styles.listagemHeader}>
          <h2>Prescrições da consulta</h2>
          <span>{prescricoes.length} registro(s)</span>
        </div>

        {loadingConsultas || loadingPrescricoes ? (
          <div className={styles.empty}>
            Carregando...
          </div>
        ) : prescricoes.length === 0 ? (
          <div className={styles.empty}>
            <FileText size={42} strokeWidth={1.3} />

            <h3>Nenhuma prescrição encontrada</h3>

            <p>
              {erro
                ? "Não foi possível carregar os registros."
                : "Não há prescrições cadastradas para a consulta selecionada."}
            </p>
          </div>
        ) : (
          prescricoes.map((prescricao) => (
            <article
              key={prescricao.id}
              className={styles.prescricaoCard}
            >
              <div className={styles.prescricaoHeader}>
                <div>
                  <h3>
                    {PRESCRICAO_TIPO_LABELS[prescricao.type]}
                    {" "}#{prescricao.id}
                  </h3>

                  <span>
                    Criada em{" "}
                    {new Date(
                      prescricao.createdAt
                    ).toLocaleString("pt-BR")}
                  </span>
                </div>

                <span
                  className={`${styles.badge} ${
                    styles[prescricao.status]
                  }`}
                >
                  {PRESCRICAO_STATUS_LABELS[prescricao.status]}
                </span>
              </div>

              {prescricao.items.map((item) => (
                <details
                  key={item.id}
                  className={styles.medicamento}
                >
                  <summary>{item.medicationName}</summary>

                  <p>
                    Princípio ativo: {item.activeIngredient || "—"}
                  </p>

                  <p>
                    Concentração: {item.concentration || "—"}
                  </p>

                  <p>
                    Forma farmacêutica:{" "}
                    {item.pharmaceuticalForm || "—"}
                  </p>

                  <p>Dosagem: {item.dose}</p>
                  <p>Via: {item.route}</p>
                  <p>Frequência: {item.frequency}</p>
                  <p>Duração: {item.duration}</p>
                  <p>Quantidade: {item.quantity}</p>
                  <p>Instruções: {item.instructions || "—"}</p>
                </details>
              ))}

              {prescricao.instructions && (
                <p>Orientações: {prescricao.instructions}</p>
              )}

              {prescricao.recommendations && (
                <p>Recomendações: {prescricao.recommendations}</p>
              )}

              {prescricao.followUpInstructions && (
                <p>
                  Acompanhamento:{" "}
                  {prescricao.followUpInstructions}
                </p>
              )}

              {podePrescrever && prescricao.type === "MEDICATION" && (
                <div className={styles.actions}>
                  {!consultaCancelada &&
                    prescricao.status === "DRAFT" && (
                      <>
                        <button
                          type="button"
                          className={styles.secondaryButton}
                          disabled={
                            processando ||
                            loadingPrescricoes ||
                            modalAberto
                          }
                          onClick={() => abrirEdicao(prescricao)}
                        >
                          <Pencil size={16} />
                          Editar
                        </button>

                        <button
                          type="button"
                          className={styles.primaryButton}
                          disabled={
                            processando ||
                            loadingPrescricoes ||
                            modalAberto
                          }
                          onClick={() => emitir(prescricao)}
                        >
                          <Send size={16} />
                          Emitir
                        </button>
                      </>
                    )}

                  {prescricao.status !== "CANCELLED" && (
                    <button
                      type="button"
                      className={styles.dangerButton}
                      disabled={
                        processando ||
                        loadingPrescricoes ||
                        modalAberto
                      }
                      onClick={() => cancelar(prescricao)}
                    >
                      <Ban size={16} />
                      Cancelar
                    </button>
                  )}
                </div>
              )}
            </article>
          ))
        )}
      </section>

      {modalAberto &&
        consulta &&
        podePrescrever &&
        !consultaCancelada && (
          <PrescricaoFormModal
            consulta={consulta}
            prescricao={editando}
            modo="MEDICAMENTOS"
            onClose={fecharModal}
            onSave={handleSave}
          />
        )}
    </div>
  );
}