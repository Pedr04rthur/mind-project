import { useState, type FormEvent } from "react";
import { HumorCard, type HumorType } from "../../components/HumorCard/HumorCard";
import styles from "./RegistroHumor.module.css";

const MAX_COMENTARIO = 500;

export function RegistroHumor() {
  const [humor, setHumor] = useState<HumorType | null>(null);
  const [comentario, setComentario] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!humor) return;

    const registro = {
      humor,
      comentario: comentario.trim() ? comentario.trim() : null,
      data: new Date().toISOString(),
    };

    // TODO: substituir por POST para a API do backend
    console.log("[RegistroHumor] envio:", registro);

    setHumor(null);
    setComentario("");
  };

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <section className={styles.intro}>
          <span className={styles.eyebrow}>Diario de humor</span>
          <h1 className={styles.title}>Como voce esta se sentindo hoje?</h1>
          <p className={styles.subtitle}>
            Seu registro diario ajuda o seu terapeuta a acompanhar a sua
            evolucao ao longo do tempo, mesmo entre as sessoes. Leva menos de
            um minuto.
          </p>
        </section>

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
              Comentario <span className={styles.optional}>(opcional)</span>
            </label>

            <textarea
              id="comentario"
              name="comentario"
              className={styles.textarea}
              placeholder="Ex.: dormi melhor, ansiedade aumentou, me senti mais leve apos a caminhada..."
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
      </div>
    </main>
  );
}
