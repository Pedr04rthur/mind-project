import { Search, X } from "lucide-react";
import styles from "./SearchInput.module.css";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onClear?: () => void;
  autoFocus?: boolean;
  ariaLabel?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Buscar...",
  onClear,
  autoFocus = false,
  ariaLabel = "Campo de busca",
}: SearchInputProps) {
  const hasValue = value.length > 0;

  const handleClear = () => {
    onChange("");
    onClear?.();
  };

  return (
    <div className={styles.wrapper}>
      <Search size={18} className={styles.icon} aria-hidden="true" />
      <input
        type="text"
        className={styles.input}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoFocus={autoFocus}
        aria-label={ariaLabel}
        spellCheck={false}
        autoComplete="off"
      />
      {hasValue && (
        <button
          type="button"
          className={styles.clearButton}
          onClick={handleClear}
          aria-label="Limpar busca"
          title="Limpar"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
