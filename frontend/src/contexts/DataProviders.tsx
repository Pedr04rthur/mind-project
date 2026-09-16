import type { ReactNode } from "react";
import { PacientesProvider } from "./PacientesContext";
import { ProfissionaisProvider } from "./ProfissionaisContext";
import { RegistrosHumorProvider } from "./RegistrosHumorContext";

/**
 * Agrupa os providers de dados de domínio (pacientes, profissionais,
 * registros de humor) em um único wrapper para ser montado próximo à
 * raiz da aplicação. Assim, todos os perfis (paciente, profissional,
 * recepção) compartilham o mesmo estado.
 */
export function DataProviders({ children }: { children: ReactNode }) {
  return (
    <PacientesProvider>
      <ProfissionaisProvider>
        <RegistrosHumorProvider>
          {children}
        </RegistrosHumorProvider>
      </ProfissionaisProvider>
    </PacientesProvider>
  );
}
