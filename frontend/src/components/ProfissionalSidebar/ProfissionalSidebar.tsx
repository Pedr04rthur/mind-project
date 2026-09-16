import { NavLink, useNavigate } from "react-router-dom";
import {
  HeartPulse,
  Users,
  CalendarCheck,
  FileText,
  ClipboardList,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import styles from "./ProfissionalSidebar.module.css";

const MENU_ITEMS = [
  { to: "/profissional/pacientes", label: "Pacientes", icon: Users },
  { to: "/profissional/consultas", label: "Consultas", icon: CalendarCheck },
  { to: "/profissional/prescricoes", label: "Prescrições", icon: FileText },
  { to: "/profissional/prontuarios", label: "Prontuários", icon: ClipboardList },
];

export function ProfissionalSidebar() {
  const navigate = useNavigate();
  const { usuario, sair } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const handleSair = () => {
    sair();
    navigate("/login");
  };

  const iniciais = (usuario?.nome ?? "P")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""}`}>
      <div className={styles.brand}>
        <span className={styles.brandMark} aria-hidden="true">
          <HeartPulse size={20} strokeWidth={2.2} />
        </span>
        {!collapsed && (
          <div className={styles.brandText}>
            <span className={styles.brandName}>MindCare</span>
            <span className={styles.brandRole}>Painel clínico</span>
          </div>
        )}
        <button
          type="button"
          className={styles.collapseButton}
          onClick={() => setCollapsed((v) => !v)}
          aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {usuario?.tipoProfissional && !collapsed && (
        <div className={styles.roleChip}>
          <ShieldCheck size={13} aria-hidden="true" />
          <span>
            {usuario.tipoProfissional === "PSIQUIATRA"
              ? "Psiquiatra"
              : "Psicólogo"}{" "}
            · {usuario.registro}
          </span>
        </div>
      )}

      <nav className={styles.nav} aria-label="Menu do profissional">
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
              }
            >
              <Icon size={18} strokeWidth={2} className={styles.navIcon} />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className={styles.footer}>
        <div className={styles.userBox}>
          <div className={styles.avatar}>{iniciais}</div>
          {!collapsed && (
            <div className={styles.userInfo}>
              <span className={styles.userName}>{usuario?.nome}</span>
              <span className={styles.userRole}>{usuario?.emailLogin}</span>
            </div>
          )}
        </div>

        <button
          type="button"
          className={styles.logoutButton}
          onClick={handleSair}
          title={collapsed ? "Sair" : undefined}
        >
          <LogOut size={18} strokeWidth={2} />
          {!collapsed && <span>Sair</span>}
        </button>
      </div>
    </aside>
  );
}
