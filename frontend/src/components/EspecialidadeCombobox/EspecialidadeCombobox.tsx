import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { ChevronDown, Check, Sparkles } from "lucide-react";
import { ESPECIALIDADES } from "../../data/especialidades";
import { normalizeText } from "../../utils/search";
import type { TipoProfissional } from "../../types/profissional";
import styles from "./EspecialidadeCombobox.module.css";

interface EspecialidadeComboboxProps {
  value: string;
  onChange: (value: string) => void;
  tipo: TipoProfissional;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
}

export function EspecialidadeCombobox({
  value,
  onChange,
  tipo,
  placeholder = "Selecione ou digite uma especialidade",
  disabled = false,
  id,
}: EspecialidadeComboboxProps) {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = "especialidade-listbox";

  const suggestions = ESPECIALIDADES[tipo];

  const filtered = useMemo(() => {
    const termo = normalizeText(value);
    if (!termo) return suggestions;
    return suggestions.filter((s) => normalizeText(s).includes(termo));
  }, [value, suggestions]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  useEffect(() => {
    setHighlighted(0);
  }, [value, tipo]);

  const handleSelect = (especialidade: string) => {
    onChange(especialidade);
    setOpen(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      setHighlighted((h) => Math.min(h + 1, filtered.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (event.key === "Enter") {
      if (open && filtered[highlighted]) {
        event.preventDefault();
        handleSelect(filtered[highlighted]);
      }
    } else if (event.key === "Escape") {
      setOpen(false);
    } else if (event.key === "Tab") {
      setOpen(false);
    }
  };

  const showEmpty = open && filtered.length === 0;

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <div className={styles.inputWrapper}>
        <input
          ref={inputRef}
          id={id}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={
            open && filtered[highlighted]
              ? `esp-opt-${highlighted}`
              : undefined
          }
          className={styles.input}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            if (!open) setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          spellCheck={false}
        />
        <button
          type="button"
          className={styles.toggleButton}
          onClick={() => {
            setOpen((v) => !v);
            inputRef.current?.focus();
          }}
          aria-label={open ? "Fechar lista de especialidades" : "Abrir lista de especialidades"}
          tabIndex={-1}
          disabled={disabled}
        >
          <ChevronDown
            size={16}
            className={open ? styles.chevronOpen : styles.chevron}
          />
        </button>
      </div>

      {open && !disabled && (
        <ul id={listboxId} role="listbox" className={styles.dropdown}>
          {showEmpty ? (
            <li className={styles.emptyHint}>
              <Sparkles size={14} />
              <span>
                Nenhuma sugestão. Sua digitação será salva como especialidade.
              </span>
            </li>
          ) : (
            filtered.map((especialidade, index) => {
              const isHighlighted = index === highlighted;
              const isSelected = especialidade === value;
              return (
                <li
                  key={especialidade}
                  id={`esp-opt-${index}`}
                  role="option"
                  aria-selected={isSelected}
                  className={`${styles.option} ${
                    isHighlighted ? styles.optionHighlighted : ""
                  }`}
                  onMouseEnter={() => setHighlighted(index)}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelect(especialidade);
                  }}
                >
                  <span className={styles.optionLabel}>{especialidade}</span>
                  {isSelected && <Check size={14} className={styles.checkIcon} />}
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}
