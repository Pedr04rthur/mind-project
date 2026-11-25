import { useState, type FormEvent } from "react";

import { X, Plus, Trash2, Save } from "lucide-react";

import {
  criarItemVazio,
  type Prescricao,
  type PrescricaoRequest,
  type PrescricaoItemRequest,
  type PrescricaoTipo,
} from "../../../types/prescricao";

import {
  api,
  ApiError,
  type AppointmentDetailsApi,
} from "../../../services/api";

import {
  TipoPrescricaoCombobox,
} from "../../../components/TipoPrescricaoCombobox/TipoPrescricaoCombobox";

import styles from "./PrescricaoFormModal.module.css";

interface Props {
  consulta: AppointmentDetailsApi;
  prescricao?: Prescricao;
  onClose: () => void;
  onSave: () => void;
  modo?: "MEDICAMENTOS" | "ORIENTACOES" | "TODOS";
}

const CAMPOS: {
  key: keyof PrescricaoItemRequest;
  label: string;
  required: boolean;
  maxLength: number;
}[] = [
  { key: "medicationName", label: "Medicamento", required: true, maxLength: 200 },
  { key: "activeIngredient", label: "Princípio ativo", required: false, maxLength: 200 },
  { key: "concentration", label: "Concentração", required: false, maxLength: 100 },
  { key: "pharmaceuticalForm", label: "Forma farmacêutica", required: false, maxLength: 100 },
  { key: "dose", label: "Dosagem", required: true, maxLength: 300 },
  { key: "route", label: "Via de administração", required: true, maxLength: 100 },
  { key: "frequency", label: "Frequência", required: true, maxLength: 300 },
  { key: "duration", label: "Duração", required: true, maxLength: 200 },
  { key: "quantity", label: "Quantidade", required: true, maxLength: 100 },
  { key: "instructions", label: "Instruções", required: false, maxLength: 1000 },
];

export function PrescricaoFormModal({
  consulta,
  prescricao,
  onClose,
  onSave,
  modo = "MEDICAMENTOS",
}: Props) {

  const especialidade = consulta.professional.specialty
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

  const possuiCRM =
    especialidade === "psiquiatria" ||
    especialidade === "psiquiatria clinica";

  const tiposPermitidos: PrescricaoTipo[] =
    modo === "MEDICAMENTOS"
      ? ["MEDICATION", "EXAM"]
      : modo === "ORIENTACOES"
        ? ["COUNSELING", "EXERCISE", "THERAPEUTIC"]
        : ["MEDICATION", "EXAM", "COUNSELING", "EXERCISE", "THERAPEUTIC"];

  const [tipo, setTipo] = useState<PrescricaoTipo | "">(
    prescricao?.type ?? ""
  );

  const [dados, setDados] = useState<PrescricaoRequest>({
    items: prescricao
      ? prescricao.items.map(({ id: _id, ...item }) => ({
          ...item,
          activeIngredient: item.activeIngredient ?? "",
          concentration: item.concentration ?? "",
          pharmaceuticalForm: item.pharmaceuticalForm ?? "",
          instructions: item.instructions ?? "",
        }))
      : [criarItemVazio()],

    instructions: prescricao?.instructions ?? "",
    recommendations: prescricao?.recommendations ?? "",
    followUpInstructions: prescricao?.followUpInstructions ?? "",
  });

  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  function alterarTipo(novoTipo: PrescricaoTipo | "") {
    if (prescricao) return;

    setTipo(novoTipo);
    setErro("");

    setDados({
      items: novoTipo === "MEDICATION" ? [criarItemVazio()] : [],
      instructions: "",
      recommendations: "",
      followUpInstructions: "",
    });
  }

  function atualizarItem(
    index: number,
    campo: keyof PrescricaoItemRequest,
    valor: string
  ) {
    setDados((anterior) => ({
      ...anterior,
      items: anterior.items.map((item, i) =>
        i === index ? { ...item, [campo]: valor } : item
      ),
    }));
  }

  function adicionarItem() {
    setDados((anterior) => ({
      ...anterior,
      items: [...anterior.items, criarItemVazio()],
    }));
  }

  function removerItem(index: number) {
    setDados((anterior) => ({
      ...anterior,
      items: anterior.items.filter((_, i) => i !== index),
    }));
  }

  function atualizarCampo(
    campo: "instructions" | "recommendations" | "followUpInstructions",
    valor: string
  ) {
    setDados((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (salvando) return;

    setErro("");

    if (!tipo) {
      setErro("Selecione o tipo de prescrição.");
      return;
    }

    if (!tiposPermitidos.includes(tipo)) {
      setErro("Tipo de prescrição indisponível nesta tela.");
      return;
    }

    if (tipo === "MEDICATION" && !possuiCRM) {
      setErro("Permissão negada. A prescrição medicamentosa exige CRM.");
      return;
    }

    if (tipo === "EXAM") {
      setErro("A solicitação de exames ainda não está habilitada.");
      return;
    }

    if (consulta.status === "CANCELLED") {
      setErro("Não é possível alterar uma consulta cancelada.");
      return;
    }

    if (tipo === "MEDICATION") {
      const invalido = dados.items.some((item) =>
        CAMPOS.some(
          (campo) => campo.required && !item[campo.key].trim()
        )
      );

      if (!dados.items.length || invalido) {
        setErro("Preencha todos os campos obrigatórios.");
        return;
      }
    }

    if (tipo === "COUNSELING" && !dados.instructions.trim()) {
      setErro("Descreva o aconselhamento.");
      return;
    }

    if (
      tipo === "EXERCISE" &&
      (
        !dados.recommendations.trim() ||
        !dados.followUpInstructions.trim()
      )
    ) {
      setErro("Informe o exercício e sua frequência ou duração.");
      return;
    }

    if (
      tipo === "THERAPEUTIC" &&
      !dados.instructions.trim() &&
      !dados.recommendations.trim() &&
      !dados.followUpInstructions.trim()
    ) {
      setErro("Informe pelo menos uma orientação.");
      return;
    }

    const payload: PrescricaoRequest = {
      type: tipo,
      items: tipo === "MEDICATION" ? dados.items : [],
      instructions: dados.instructions.trim(),
      recommendations: dados.recommendations.trim(),
      followUpInstructions: dados.followUpInstructions.trim(),
    };

    setSalvando(true);

    try {
      if (prescricao) {
        await api.prescriptions.update(
          consulta.id,
          prescricao.id,
          payload
        );
      } else {
        await api.prescriptions.create(
          consulta.id,
          payload
        );
      }

      onSave();
    } catch (err) {
      setErro(
        err instanceof ApiError && err.status === 403
          ? "Permissão negada para este tipo de prescrição."
          : err instanceof Error
            ? err.message
            : "Não foi possível salvar a prescrição."
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className={styles.overlay}>
      <section
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="prescricao-title"
      >
        <header className={styles.header}>
          <div>
            <h2 id="prescricao-title">
              {prescricao ? "Editar prescrição" : "Nova prescrição"}
            </h2>

            <p>Registro clínico vinculado à consulta.</p>
          </div>

          <button
            type="button"
            className={styles.iconButton}
            onClick={onClose}
            disabled={salvando}
            aria-label="Fechar"
          >
            <X size={22} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.content}>

            <div className={styles.consultaInfo}>
              <div>
                <span>Paciente</span>
                <strong>{consulta.patient.name}</strong>
              </div>

              <div>
                <span>Profissional</span>
                <strong>{consulta.professional.name}</strong>
              </div>

              <div>
                <span>Consulta</span>
                <strong>
                  {new Date(consulta.scheduledAt).toLocaleString("pt-BR")}
                </strong>
              </div>
            </div>

            <TipoPrescricaoCombobox
              value={tipo}
              onChange={alterarTipo}
              possuiCRM={possuiCRM}
              permiteExames={false}
              tiposPermitidos={tiposPermitidos}
              disabled={salvando || Boolean(prescricao)}
            />

            {tipo === "MEDICATION" && (
              <>
                {dados.items.map((item, index) => (
                  <div key={index} className={styles.medicamento}>
                    <div className={styles.medicamentoHeader}>
                      <h3>Medicamento {index + 1}</h3>

                      {dados.items.length > 1 && (
                        <button
                          type="button"
                          className={styles.removeButton}
                          onClick={() => removerItem(index)}
                          disabled={salvando}
                          aria-label={`Remover medicamento ${index + 1}`}
                        >
                          <Trash2 size={17} />
                        </button>
                      )}
                    </div>

                    <div className={styles.grid}>
                      {CAMPOS.map((campo) => (
                        <label key={campo.key} className={styles.field}>
                          <span>
                            {campo.label}
                            {campo.required && " *"}
                          </span>

                          <input
                            value={item[campo.key]}
                            required={campo.required}
                            maxLength={campo.maxLength}
                            disabled={salvando}
                            onChange={(e) =>
                              atualizarItem(
                                index,
                                campo.key,
                                e.target.value
                              )
                            }
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  className={styles.addButton}
                  onClick={adicionarItem}
                  disabled={salvando}
                >
                  <Plus size={18} />
                  Adicionar medicamento
                </button>
              </>
            )}

            {tipo && tipo !== "EXAM" && (
              <div className={styles.orientacoes}>
                <h3>
                  {tipo === "MEDICATION"
                    ? "Orientações complementares"
                    : tipo === "COUNSELING"
                      ? "Aconselhamento"
                      : tipo === "EXERCISE"
                        ? "Exercício terapêutico"
                        : "Orientação terapêutica"}
                </h3>

                <label className={styles.field}>
                  <span>
                    {tipo === "COUNSELING"
                      ? "Descrição do aconselhamento *"
                      : "Orientações gerais"}
                  </span>

                  <textarea
                    rows={4}
                    maxLength={3000}
                    required={tipo === "COUNSELING"}
                    disabled={salvando}
                    value={dados.instructions}
                    onChange={(e) =>
                      atualizarCampo("instructions", e.target.value)
                    }
                  />
                </label>

                <label className={styles.field}>
                  <span>
                    {tipo === "EXERCISE"
                      ? "Descrição do exercício *"
                      : "Recomendações"}
                  </span>

                  <textarea
                    rows={4}
                    maxLength={3000}
                    required={tipo === "EXERCISE"}
                    disabled={salvando}
                    value={dados.recommendations}
                    onChange={(e) =>
                      atualizarCampo("recommendations", e.target.value)
                    }
                  />
                </label>

                <label className={styles.field}>
                  <span>
                    {tipo === "EXERCISE"
                      ? "Frequência, duração e acompanhamento *"
                      : "Orientações de acompanhamento"}
                  </span>

                  <textarea
                    rows={4}
                    maxLength={3000}
                    required={tipo === "EXERCISE"}
                    disabled={salvando}
                    value={dados.followUpInstructions}
                    onChange={(e) =>
                      atualizarCampo(
                        "followUpInstructions",
                        e.target.value
                      )
                    }
                  />
                </label>
              </div>
            )}

            {erro && (
              <div role="alert" className={styles.erro}>
                {erro}
              </div>
            )}
          </div>

          <footer className={styles.footer}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
              disabled={salvando}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className={styles.saveButton}
              disabled={salvando || !tipo || tipo === "EXAM"}
            >
              <Save size={17} />

              {salvando ? "Salvando..." : "Salvar rascunho"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}