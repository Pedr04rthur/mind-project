import { AuditoriaPage } from "./pages/Recepcao/Auditoria/AuditoriaPage";
import { PacienteClinicoDetail } from "./pages/Profissional/Pacientes/PacienteClinicoDetail";
import { RelatoriosPage } from "./pages/Recepcao/Relatorios/RelatoriosPage";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { AuthProvider } from "./contexts/AuthContext";
import { DataProviders } from "./contexts/DataProviders";
import { RequirePerfil } from "./components/RouteGuards/RouteGuards";

import { Login } from "./pages/Login/Login";

// ---------- Paciente ----------

import { RegistroHumor } from "./pages/RegistroHumor/RegistroHumor";
import { HistoricoHumor } from "./pages/HistoricoHumor/HistoricoHumor";
import { Consultas } from "./pages/Consultas/Consultas";
import { Prescricoes } from "./pages/Prescricoes/Prescricoes";
import { Orientacoes } from "./pages/Orientacoes/Orientacoes";
import { Perfil } from "./pages/Perfil/Perfil";
import { PatientLayout } from "./layouts/PatientLayout/PatientLayout";

// ---------- Recepção ----------

import { RecepcaoLayout } from "./layouts/RecepcaoLayout/RecepcaoLayout";
import { PacientesList } from "./pages/Recepcao/Pacientes/PacientesList";
import { PacienteDetail } from "./pages/Recepcao/Pacientes/PacienteDetail";
import { ProfissionaisList } from "./pages/Recepcao/Profissionais/ProfissionaisList";
import { ProfissionalDetail } from "./pages/Recepcao/Profissionais/ProfissionalDetail";
import { TriagemList } from "./pages/Recepcao/Triagem/TriagemList";
import { ConsultaForm } from "./pages/Recepcao/Consultas/ConsultaForm";
import { ConsultaDetail } from "./pages/Recepcao/Consultas/ConsultaDetail";
import { ConsultasPeriodo } from "./pages/Recepcao/Consultas/ConsultasPeriodo";
import { AgendaPage } from "./pages/Recepcao/Agenda/AgendaPage";


// ---------- Profissional ----------

import { ProfissionalLayout } from "./layouts/ProfissionalLayout/ProfissionalLayout";
import { PacientesClinicos } from "./pages/Profissional/Pacientes/PacientesClinicos";
import { AlertasPage } from "./pages/Profissional/Alertas/AlertasPage";
import { MeuPerfil } from "./pages/Profissional/Perfil/MeuPerfil";

import {
  ConsultasClinicasPage,
} from "./pages/Profissional/Placeholders/ProfissionalPlaceholders";

import { PrescricoesClinicasPage } from "./pages/Profissional/Prescricoes/PrescricoesClinicasPage";

import { OrientacoesPage } from "./pages/Profissional/Orientacoes/OrientacoesPage";

function App() {
  return (
    <AuthProvider>
      <DataProviders>
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={<Navigate to="/login" replace />}
            />

            <Route
              path="/login"
              element={<Login />}
            />

            {/* ---------- Paciente ---------- */}

            <Route
              element={
                <RequirePerfil permitidos={["PACIENTE"]} />
              }
            >
              <Route element={<PatientLayout />}>
                <Route
                  path="/diario"
                  element={<RegistroHumor />}
                />

                <Route
                  path="/historico"
                  element={<HistoricoHumor />}
                />

                <Route
                  path="/consultas"
                  element={<Consultas />}
                />

                <Route
                  path="/prescricoes"
                  element={<Prescricoes />}
                />

                <Route
                  path="/orientacoes"
                  element={<Orientacoes />}
                />

                <Route
                  path="/perfil"
                  element={<Perfil />}
                />
              </Route>
            </Route>

            {/* ---------- Recepção ---------- */}

            <Route
              element={
                <RequirePerfil permitidos={["RECEPCAO"]} />
              }
            >
              <Route
                path="/recepcao"
                element={<RecepcaoLayout />}
              >
                <Route
                  index
                  element={
                    <Navigate
                      to="/recepcao/pacientes"
                      replace
                    />
                  }
                />

                <Route
                  path="pacientes"
                  element={<PacientesList />}
                />

                <Route
                  path="pacientes/:cpf"
                  element={<PacienteDetail />}
                />

                <Route
                  path="profissionais"
                  element={<ProfissionaisList />}
                />

                <Route
                  path="profissionais/:cpf"
                  element={<ProfissionalDetail />}
                />

                <Route
                  path="triagem"
                  element={<TriagemList />}
                />

                <Route
                  path="consultas"
                  element={<ConsultasPeriodo />}
                />

                <Route
                  path="consultas/nova"
                  element={<ConsultaForm />}
                />

                <Route
                  path="consultas/:id"
                  element={<ConsultaDetail />}
                />

                <Route
                  path="agenda"
                  element={<AgendaPage />}
                />

                <Route
                  path="relatorios"
                  element={<RelatoriosPage />}
                />

                <Route
                  path="auditoria"
                  element={<AuditoriaPage />}
                />
              </Route>
            </Route>

            {/* ---------- Profissional ---------- */}

            <Route
              element={
                <RequirePerfil permitidos={["PROFISSIONAL"]} />
              }
            >
              <Route
                path="/profissional"
                element={<ProfissionalLayout />}
              >
                <Route
                  index
                  element={
                    <Navigate
                      to="/profissional/pacientes"
                      replace
                    />
                  }
                />

                <Route
                  path="pacientes"
                  element={<PacientesClinicos />}
                />

                <Route
                  path="pacientes/:cpf"
                  element={<PacienteClinicoDetail />}
                />

                <Route
                  path="alertas"
                  element={<AlertasPage />}
                />

                <Route
                  path="consultas"
                  element={<ConsultasClinicasPage />}
                />

                <Route
                  path="prescricoes"
                  element={<PrescricoesClinicasPage />}
                />

                <Route
                  path="orientacoes"
                  element={<OrientacoesPage />}
                />

                

                <Route
                  path="perfil"
                  element={<MeuPerfil />}
                />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </DataProviders>
    </AuthProvider>
  );
}

export default App;