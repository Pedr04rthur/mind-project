import { useState, type FormEvent } from "react";
import { AlertCircle } from "lucide-react";
import { HumorCard } from "../../components/HumorCard/HumorCard";
import { RegistroHojeCard } from "./RegistroHojeCard";
import { useRegistrosHumor } from "../../contexts/RegistrosHumorContext";
import { useAuth } from "../../contexts/AuthContext";
import { getDataDiaAtual } from "../../utils/dates";
import type { HumorType } from "../../types/humor";
import styles from "./RegistroHumor.module.css";

const MAX_COMENTARIO = 500;

export function RegistroHumor() {
  const { usuario } = useAuth();
  const { getRegistroDoDia, registrar, removerDoDia } = useRegistrosHumor();

  const [humor, setHumor] = useState<HumorType | null>(null);
  const [comentario, setComentario] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const cpfPaciente = usuario?.cpf ?? "";
  const dataDia = getDataDiaAtual();
  const registroHoje = cpfPaciente
    ? getRegistroDoDia(cpfPaciente, dataDia)
    : undefined;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!humor || enviando || registroHoje || !cpfPaciente) return;

    setErro(null);
    setEnviando(true);

    try {
      await registrar(
        cpfPaciente,
        humor,
        comentario.trim() ? comentario.trim() : null
      );
      setHumor(null);
      setComentario("");
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Não foi possível registrar seu humor agora.";
      setErro(msg);
    } finally {
      setEnviando(false);
    }
  };

  const handleResetar = () => {
    if (!cpfPaciente) return;
    removerDoDia(cpfPaciente, dataDia);
    setHumor(null);
    setComentario("");
    setErro(null);
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
                disabled={enviando}
                onChange={(event) =>
                  setComentario(event.target.value.slice(0, MAX_COMENTARIO))
                }
              />

              <span className={styles.counter}>
                {comentario.length}/{MAX_COMENTARIO}
              </span>
            </div>

            {erro && (
              <div className={styles.errorBox} role="alert">
                <AlertCircle size={16} />
                <span>{erro}</span>
              </div>
            )}

            <button
              type="submit"
              className={styles.submitButton}
              disabled={!humor || enviando || !cpfPaciente}
            >
              {enviando ? "Enviando..." : "Registrar humor de hoje"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
