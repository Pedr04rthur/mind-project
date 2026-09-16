import { Outlet } from "react-router-dom";
import { RecepcaoSidebar } from "../../components/RecepcaoSidebar/RecepcaoSidebar";
import { PacientesProvider } from "../../contexts/PacientesContext";
import { ProfissionaisProvider } from "../../contexts/ProfissionaisContext";
import styles from "./RecepcaoLayout.module.css";

export function RecepcaoLayout() {
  return (
    <PacientesProvider>
      <ProfissionaisProvider>
        <div className={styles.wrapper}>
          <RecepcaoSidebar />
          <main className={styles.main}>
            <Outlet />
          </main>
        </div>
      </ProfissionaisProvider>
    </PacientesProvider>
  );
}
