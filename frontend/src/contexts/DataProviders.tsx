import type { ReactNode } from "react";
import { PacientesProvider } from "./PacientesContext";
import { ProfissionaisProvider } from "./ProfissionaisContext";
import { RegistrosHumorProvider } from "./RegistrosHumorContext";
import { TriagensProvider } from "./TriagensContext";

export function DataProviders({ children }: { children: ReactNode }) {
  return (
    <PacientesProvider>
      <ProfissionaisProvider>
        <RegistrosHumorProvider>
          <TriagensProvider>{children}</TriagensProvider>
        </RegistrosHumorProvider>
      </ProfissionaisProvider>
    </PacientesProvider>
  );
}
