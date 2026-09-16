import { NavLink, useNavigate } from "react-router-dom";
import {
  HeartPulse,
  Users,
  ClipboardCheck,
  Calendar,
  Stethoscope,
  ShieldCheck,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import styles from "./RecepcaoSidebar.module.css";

const MENU_ITEMS = [
  { to: "/recepcao/pacientes", label: "Pacientes", icon: Users },
  { to: "/recepcao/triagem", label: "Triagem", icon: ClipboardCheck },
  { to: "/recepcao/agenda", label: "Agenda", icon: Calendar },
  { to: "/recepcao/profissionais", label: "Profissionais", icon: Stethoscope },
  { to: "/recepcao/auditoria", label: "Auditoria LGPD", icon: ShieldCheck },
];

export function RecepcaoSidebar() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""}`}>
      <div className={styles.brand}>
        <span className={styles.brandMark} aria-hidden="true">
          <HeartPulse size={20} strokeWidth={2.2} />
        </span>
        {!collapsed && (
          <div className={styles.brandText}>
            <span className={styles.brandName}>MindCare</span>
            <span className={styles.brandRole}>Recepção</span>
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

      <nav className={styles.nav} aria-label="Menu da recepção">
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
          <div className={styles.avatar}>R</div>
          {!collapsed && (
            <div className={styles.userInfo}>
              <span className={styles.userName}>Recepção</span>
              <span className={styles.userRole}>recepcao@mindcare</span>
            </div>
          )}
        </div>

        <button
          type="button"
          className={styles.logoutButton}
          onClick={() => navigate("/login")}
          title={collapsed ? "Sair" : undefined}
        >
          <LogOut size={18} strokeWidth={2} />
          {!collapsed && <span>Sair</span>}
        </button>
      </div>
    </aside>
  );
}
