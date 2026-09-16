import { Outlet } from "react-router-dom";
import { RecepcaoSidebar } from "../../components/RecepcaoSidebar/RecepcaoSidebar";
import styles from "./RecepcaoLayout.module.css";

export function RecepcaoLayout() {
  return (
    <div className={styles.wrapper}>
      <RecepcaoSidebar />
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
