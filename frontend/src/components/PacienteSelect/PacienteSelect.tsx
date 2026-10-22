import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search, User, X } from "lucide-react";
import { usePacientes } from "../../contexts/PacientesContext";
import { normalizeText } from "../../utils/search";
import styles from "./PacienteSelect.module.css";

interface PacienteSelectProps {
  value: string;
  onChange: (cpf: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  id?: string;
}

export function PacienteSelect({
  value,
  onChange,
  label = "Paciente",
  placeholder = "Buscar paciente por nome ou CPF",
  disabled = false,
  required = false,
  error,
  id = "paciente-select",
}: PacienteSelectProps) {
  const { pacientes, loading } = usePacientes();
  const [open, setOpen] = useState(false);
  const [busca, setBusca] = useState("");
  const [highlighted, setHighlighted] = useState(0);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = `${id}-listbox`;

  const selecionado = useMemo(
    () => pacientes.find((p) => p.cpf === value),
    [pacientes, value]
  );

  const filtrados = useMemo(() => {
    const termo = normalizeText(busca);
    if (!termo) return pacientes;
    return pacientes.filter(
      (p) =>
        normalizeText(p.nome).includes(termo) ||
        p.cpf.replace(/\D/g, "").includes(busca.replace(/\D/g, ""))
    );
  }, [pacientes, busca]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  useEffect(() => {
    setHighlighted(0);
  }, [busca]);

  const handleSelect = (cpf: string) => {
    onChange(cpf);
    setBusca("");
    setOpen(false);
    inputRef.current?.blur();
  };

  const handleClear = () => {
    onChange("");
    setBusca("");
    setOpen(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      setHighlighted((h) => Math.min(h + 1, filtrados.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (event.key === "Enter") {
      if (open && filtrados[highlighted]) {
        event.preventDefault();
        handleSelect(filtrados[highlighted].cpf);
      }
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  };

  const displayValue = selecionado
    ? `${selecionado.nome} · ${selecionado.cpf}`
    : busca;

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
          {required && <span className={styles.required}> *</span>}
        </label>
      )}

      <div
        className={`${styles.inputWrapper} ${
          error ? styles.inputError : ""
        } ${disabled ? styles.inputDisabled : ""}`}
      >
        <User size={16} className={styles.inputIcon} aria-hidden="true" />

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
            if (!open) setOpen(true);
            if (selecionado) onChange("");
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          spellCheck={false}
        />

        {selecionado ? (
          <button
            type="button"
            className={styles.clearButton}
            onClick={handleClear}
            aria-label="Limpar seleção"
            tabIndex={-1}
          >
            <X size={14} />
          </button>
        ) : (
          <button
            type="button"
            className={styles.toggleButton}
            onClick={() => {
              setOpen((v) => !v);
              inputRef.current?.focus();
            }}
            aria-label={open ? "Fechar lista" : "Abrir lista"}
            tabIndex={-1}
            disabled={disabled}
          >
            <ChevronDown
              size={16}
              className={open ? styles.chevronOpen : styles.chevron}
            />
          </button>
        )}
      </div>

      {error && <span className={styles.errorMessage}>{error}</span>}

      {open && !disabled && (
        <div className={styles.dropdown} role="listbox" id={listboxId}>
          {loading && pacientes.length === 0 ? (
            <div className={styles.emptyHint}>Carregando pacientes...</div>
          ) : filtrados.length === 0 ? (
            <div className={styles.emptyHint}>
              <Search size={14} />
              <span>
                {busca
                  ? `Nenhum paciente encontrado para "${busca}".`
                  : "Nenhum paciente cadastrado."}
              </span>
            </div>
          ) : (
            <ul className={styles.list}>
              {filtrados.map((p, index) => {
                const isHighlighted = index === highlighted;
                const isSelected = p.cpf === value;
                return (
                  <li
                    key={p.cpf}
                    role="option"
                    aria-selected={isSelected}
                    className={`${styles.option} ${
                      isHighlighted ? styles.optionHighlighted : ""
                    }`}
                    onMouseEnter={() => setHighlighted(index)}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelect(p.cpf);
                    }}
                  >
                    <div className={styles.optionAvatar} aria-hidden="true">
                      {p.nome
                        .split(" ")
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((n) => n[0]?.toUpperCase())
                        .join("")}
                    </div>
                    <div className={styles.optionInfo}>
                      <span className={styles.optionName}>{p.nome}</span>
                      <span className={styles.optionMeta}>CPF {p.cpf}</span>
                    </div>
                    {isSelected && (
                      <Check size={14} className={styles.checkIcon} />
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
