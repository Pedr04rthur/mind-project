import { Outlet } from "react-router-dom";
import { Header } from "../../components/Header/Header";
import styles from "./PatientLayout.module.css";

export function PatientLayout() {
  return (
    <div className={styles.wrapper}>
      <Header />
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
