import type { ReactNode } from "react";
import styles from "./PagePlaceholder.module.css";

interface PagePlaceholderProps {
  title: string;
  subtitle: string;
  icon: ReactNode;
}

export function PagePlaceholder({ title, subtitle, icon }: PagePlaceholderProps) {
  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <div className={styles.icon}>{icon}</div>
        <div>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>
      </header>

      <div className={styles.emptyState}>
        <p>Em construção.</p>
      </div>
    </section>
  );
}
