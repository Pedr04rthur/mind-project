import { Outlet } from "react-router-dom";
import { ProfissionalSidebar } from "../../components/ProfissionalSidebar/ProfissionalSidebar";
import styles from "./ProfissionalLayout.module.css";

export function ProfissionalLayout() {
  return (
    <div className={styles.wrapper}>
      <ProfissionalSidebar />
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
