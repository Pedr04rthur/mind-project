import type { ReactNode } from "react";
import { PacientesProvider } from "./PacientesContext";
import { ProfissionaisProvider } from "./ProfissionaisContext";
import { RegistrosHumorProvider } from "./RegistrosHumorContext";
import { TriagensProvider } from "./TriagensContext";
import { ConsultasProvider } from "./ConsultasContext";
import { AlertasReconhecidosProvider } from "./AlertasReconhecidosContext";

export function DataProviders({ children }: { children: ReactNode }) {
  return (
    <PacientesProvider>
      <ProfissionaisProvider>
        <RegistrosHumorProvider>
          <TriagensProvider>
            <ConsultasProvider>
              <AlertasReconhecidosProvider>{children}</AlertasReconhecidosProvider>
            </ConsultasProvider>
          </TriagensProvider>
        </RegistrosHumorProvider>
      </ProfissionaisProvider>
    </PacientesProvider>
  );
}
