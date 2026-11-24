import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Menu, X, LogOut } from "lucide-react";

import { useAuth } from "../../contexts/AuthContext";
import mindguy from "../../assets/images/mindguy.png";

import styles from "./Header.module.css";

const NAV_ITEMS = [
  { to: "/diario", label: "Diário" },
  { to: "/historico", label: "Histórico" },
  { to: "/consultas", label: "Consultas" },
  { to: "/prescricoes", label: "Prescrições" },
  { to: "/orientacoes", label: "Orientações" },
  { to: "/perfil", label: "Perfil" },
];

export function Header() {
  const navigate = useNavigate();
  const { sair } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const [saindo, setSaindo] = useState(false);

  const handleLogout = async () => {
    if (saindo) return;

    setSaindo(true);

    try {
      await sair();
    } finally {
      setMenuOpen(false);
      navigate("/login", { replace: true });
      setSaindo(false);
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <NavLink
          to="/diario"
          className={styles.brand}
          aria-label="MindCare — início"
        >
          <img
            src={mindguy}
            alt="MindCare"
            className={styles.brandMark}
          />

          <span className={styles.brandName}>
            MindCare
          </span>
        </NavLink>

        <nav
          className={styles.nav}
          aria-label="Navegação principal"
        >
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `${styles.navItem} ${
                  isActive
                    ? styles.navItemActive
                    : ""
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.logoutButton}
            onClick={handleLogout}
            disabled={saindo}
            aria-label="Sair da conta"
            title="Sair da conta"
          >
            <LogOut size={18} strokeWidth={2} />

            <span>
              {saindo ? "Saindo..." : "Sair"}
            </span>
          </button>

          <button
            type="button"
            className={styles.menuToggle}
            aria-label={
              menuOpen ? "Fechar menu" : "Abrir menu"
            }
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen
              ? <X size={22} />
              : <Menu size={22} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div
          id="mobile-menu"
          className={styles.mobileMenu}
        >
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `${styles.mobileNavItem} ${
                  isActive
                    ? styles.mobileNavItemActive
                    : ""
                }`
              }
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  );
}