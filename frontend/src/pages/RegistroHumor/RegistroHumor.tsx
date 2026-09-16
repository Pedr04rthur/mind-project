import { useState, type FormEvent } from "react";
import { HumorCard } from "../../components/HumorCard/HumorCard";
import { RegistroHojeCard } from "./RegistroHojeCard";
import { useRegistrosHumor } from "../../contexts/RegistrosHumorContext";
import { getDataDiaAtual } from "../../utils/dates";
import type { HumorType, RegistroHumor } from "../../types/humor";
import styles from "./RegistroHumor.module.css";

const MAX_COMENTARIO = 500;

// TODO: substituir por contexto de autenticação quando o backend entrar
const PACIENTE_ATUAL_CPF = "123.456.789-00";

export function RegistroHumor() {
  const { getRegistroDoDia, upsert, removerDoDia } = useRegistrosHumor();

  const [humor, setHumor] = useState<HumorType | null>(null);
  const [comentario, setComentario] = useState("");

  const dataDia = getDataDiaAtual();
  const registroHoje = getRegistroDoDia(PACIENTE_ATUAL_CPF, dataDia);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!humor) return;

    // Guarda extra: se por algum motivo já existir registro hoje, ignora o envio
    if (registroHoje) return;

    const agora = new Date();
    const novoRegistro: RegistroHumor = {
      id: `${PACIENTE_ATUAL_CPF}-${dataDia}`,
      cpfPaciente: PACIENTE_ATUAL_CPF,
      humor,
      comentario: comentario.trim() ? comentario.trim() : null,
      criadoEm: agora.toISOString(),
      dataDia,
    };

    // TODO: substituir por POST /registros-humor
    // POST /registros-humor { humor, comentario }
    // Backend deve retornar 409 Conflict se já existir registro no dia
    console.log("[RegistroHumor] envio:", novoRegistro);

    upsert(novoRegistro);
    setHumor(null);
    setComentario("");
  };

  const handleResetar = () => {
    removerDoDia(PACIENTE_ATUAL_CPF, dataDia);
    setHumor(null);
    setComentario("");
  };

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <section className={styles.intro}>
          <span className={styles.eyebrow}>Diário de humor</span>
          <h1 className={styles.title}>
            {registroHoje
              ? "Seu check-in de hoje está feito."
              : "Como você está se sentindo hoje?"}
          </h1>
          <p className={styles.subtitle}>
            {registroHoje
              ? "Registros diários ajudam seu terapeuta a acompanhar sua evolução ao longo do tempo, mesmo entre as sessões."
              : "Seu registro diário ajuda o seu terapeuta a acompanhar a sua evolução ao longo do tempo, mesmo entre as sessões. Leva menos de um minuto."}
          </p>
        </section>

        {registroHoje ? (
          <RegistroHojeCard registro={registroHoje} onResetar={handleResetar} />
        ) : (
          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <div className={styles.cardsGroup}>
              <HumorCard
                tipo="bom"
                label="Bom"
                selected={humor === "bom"}
                onSelect={setHumor}
              />
              <HumorCard
                tipo="ruim"
                label="Ruim"
                selected={humor === "ruim"}
                onSelect={setHumor}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="comentario" className={styles.label}>
                Comentário <span className={styles.optional}>(opcional)</span>
              </label>

              <textarea
                id="comentario"
                name="comentario"
                className={styles.textarea}
                placeholder="Ex.: dormi melhor, ansiedade aumentou, me senti mais leve após a caminhada..."
                value={comentario}
                maxLength={MAX_COMENTARIO}
                rows={5}
                onChange={(event) =>
                  setComentario(event.target.value.slice(0, MAX_COMENTARIO))
                }
              />

              <span className={styles.counter}>
                {comentario.length}/{MAX_COMENTARIO}
              </span>
            </div>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={!humor}
            >
              Registrar humor de hoje
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
