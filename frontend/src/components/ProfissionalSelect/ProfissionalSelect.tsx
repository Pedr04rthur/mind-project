import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Check,
  ChevronDown,
  Search,
  Stethoscope,
  X,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

import { useProfissionais } from "../../contexts/ProfissionaisContext";
import { normalizeText } from "../../utils/search";
import styles from "./ProfissionalSelect.module.css";

interface ProfissionalSelectProps {
  value: number | null;
  onChange: (id: number) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  id?: string;
}

export function ProfissionalSelect({
  value,
  onChange,
  label = "Profissional",
  placeholder = "Buscar por nome ou especialidade",
  disabled = false,
  required = false,
  error,
  id = "profissional-select",
}: ProfissionalSelectProps) {
  const {
    backendProfissionais,
    loadingBackend,
    erroBackend,
    refreshBackend,
  } = useProfissionais();

  const [open, setOpen] = useState(false);
  const [busca, setBusca] = useState("");
  const [highlighted, setHighlighted] = useState(0);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const listboxId = `${id}-listbox`;

  const selecionado = useMemo(
    () =>
      backendProfissionais.find((p) => p.id === value),
    [backendProfissionais, value]
  );

  const filtrados = useMemo(() => {
    const termo = normalizeText(busca);

    if (!termo) return backendProfissionais;

    return backendProfissionais.filter(
      (p) =>
        normalizeText(p.name ?? "").includes(termo) ||
        normalizeText(p.specialty ?? "").includes(termo)
    );
  }, [backendProfissionais, busca]);

  useEffect(() => {
    if (!open) return;

    const handler = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);

    return () =>
      document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    setHighlighted(0);
  }, [busca]);

  function abrirLista() {
    if (disabled) return;

    setOpen(true);

    if (
      backendProfissionais.length === 0 &&
      !loadingBackend
    ) {
      void refreshBackend();
    }
  }

  function handleSelect(id: number) {
    onChange(id);
    setBusca("");
    setOpen(false);
    inputRef.current?.blur();
  }

  function handleClear() {
    onChange(0);
    setBusca("");
    setOpen(false);
  }

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (event.key === "ArrowDown") {
      event.preventDefault();

      if (!open) {
        abrirLista();
        return;
      }

      setHighlighted((h) =>
        Math.max(
          0,
          Math.min(h + 1, filtrados.length - 1)
        )
      );
    } else if (event.key === "ArrowUp") {
      event.preventDefault();

      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (event.key === "Enter" && open) {
      event.preventDefault();

      if (filtrados[highlighted]) {
        handleSelect(filtrados[highlighted].id);
      }
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  }

  const displayValue = selecionado
    ? `${selecionado.name} · ${selecionado.specialty}`
    : busca;

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
          {required && (
            <span className={styles.required}> *</span>
          )}
        </label>
      )}

      <div
        className={`${styles.inputWrapper} ${
          error ? styles.inputError : ""
        } ${disabled ? styles.inputDisabled : ""}`}
      >
        <Stethoscope
          size={16}
          className={styles.inputIcon}
          aria-hidden="true"
        />

        <input
          ref={inputRef}
          id={id}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-autocomplete="list"
          className={styles.input}
          value={displayValue}
          placeholder={placeholder}
          disabled={disabled}
          onChange={(e) => {
            setBusca(e.target.value);

            if (!open) abrirLista();
            if (selecionado) onChange(0);
          }}
          onFocus={abrirLista}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          spellCheck={false}
        />

        {selecionado ? (
          <button
            type="button"
            className={styles.clearButton}
            onClick={handleClear}
            aria-label="Limpar"
            disabled={disabled}
            tabIndex={-1}
          >
            <X size={14} />
          </button>
        ) : (
          <button
            type="button"
            className={styles.toggleButton}
            onClick={() => {
              if (open) {
                setOpen(false);
              } else {
                abrirLista();
              }
            }}
            aria-label={open ? "Fechar" : "Abrir"}
            tabIndex={-1}
            disabled={disabled}
          >
            <ChevronDown
              size={16}
              className={
                open
                  ? styles.chevronOpen
                  : styles.chevron
              }
            />
          </button>
        )}
      </div>

      {error && (
        <span className={styles.errorMessage}>
          {error}
        </span>
      )}

      {open && !disabled && (
        <div
          className={styles.dropdown}
          role="listbox"
          id={listboxId}
        >
          {loadingBackend ? (
            <div className={styles.emptyHint}>
              <RefreshCw size={15} />
              <span>Carregando profissionais...</span>
            </div>
          ) : erroBackend ? (
            <div className={styles.feedback}>
              <div className={styles.feedbackError}>
                <AlertCircle size={16} />
                <span>{erroBackend}</span>
              </div>

              <button
                type="button"
                className={styles.retryButton}
                onClick={() => void refreshBackend()}
              >
                <RefreshCw size={14} />
                Tentar novamente
              </button>
            </div>
          ) : filtrados.length === 0 ? (
            <div className={styles.feedback}>
              <div className={styles.emptyHint}>
                <Search size={14} />

                <span>
                  {busca
                    ? `Nada para "${busca}".`
                    : "Nenhum profissional cadastrado no banco."}
                </span>
              </div>

              {!busca && (
                <button
                  type="button"
                  className={styles.retryButton}
                  onClick={() => void refreshBackend()}
                >
                  <RefreshCw size={14} />
                  Atualizar profissionais
                </button>
              )}
            </div>
          ) : (
            <ul className={styles.list}>
              {filtrados.map((p, index) => {
                const isHighlighted =
                  index === highlighted;

                const isSelected = p.id === value;

                return (
                  <li
                    key={p.id}
                    role="option"
                    aria-selected={isSelected}
                    className={`${styles.option} ${
                      isHighlighted
                        ? styles.optionHighlighted
                        : ""
                    }`}
                    onMouseEnter={() =>
                      setHighlighted(index)
                    }
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelect(p.id);
                    }}
                  >
                    <div
                      className={styles.optionAvatar}
                      aria-hidden="true"
                    >
                      <Stethoscope
                        size={16}
                        strokeWidth={2.2}
                      />
                    </div>

                    <div className={styles.optionInfo}>
                      <span className={styles.optionName}>
                        {p.name}
                      </span>

                      <span className={styles.optionMeta}>
                        {p.specialty}
                      </span>
                    </div>

                    {isSelected && (
                      <Check
                        size={14}
                        className={styles.checkIcon}
                      />
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
