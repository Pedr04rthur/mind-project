import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { DataProviders } from "./contexts/DataProviders";
import { RequirePerfil } from "./components/RouteGuards/RouteGuards";

import { Login } from "./pages/Login/Login";
import { SelecionarPerfil } from "./pages/SelecionarPerfil/SelecionarPerfil";

import { RegistroHumor } from "./pages/RegistroHumor/RegistroHumor";
import { Consultas } from "./pages/Consultas/Consultas";
import { Prescricoes } from "./pages/Prescricoes/Prescricoes";
import { Perfil } from "./pages/Perfil/Perfil";
import { PatientLayout } from "./layouts/PatientLayout/PatientLayout";

import { RecepcaoLayout } from "./layouts/RecepcaoLayout/RecepcaoLayout";
import { PacientesList } from "./pages/Recepcao/Pacientes/PacientesList";
import { PacienteDetail } from "./pages/Recepcao/Pacientes/PacienteDetail";
import { ProfissionaisList } from "./pages/Recepcao/Profissionais/ProfissionaisList";
import { ProfissionalDetail } from "./pages/Recepcao/Profissionais/ProfissionalDetail";
import { TriagemList } from "./pages/Recepcao/Triagem/TriagemList";
import {
  AgendaPage,
  AuditoriaPage,
} from "./pages/Recepcao/Placeholders/RecepcaoPlaceholders";

import { ProfissionalLayout } from "./layouts/ProfissionalLayout/ProfissionalLayout";
import { PacientesClinicos } from "./pages/Profissional/Pacientes/PacientesClinicos";
import { MeuPerfil } from "./pages/Profissional/Perfil/MeuPerfil";
import {
  ConsultasClinicasPage,
  PrescricoesClinicasPage,
  ProntuariosPage,
} from "./pages/Profissional/Placeholders/ProfissionalPlaceholders";

function App() {
  return (
    <AuthProvider>
      <DataProviders>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/selecionar-perfil" element={<SelecionarPerfil />} />

            {/* ---------- Paciente ---------- */}
            <Route element={<RequirePerfil permitidos={["PACIENTE"]} />}>
              <Route element={<PatientLayout />}>
                <Route path="/diario" element={<RegistroHumor />} />
                <Route path="/consultas" element={<Consultas />} />
                <Route path="/prescricoes" element={<Prescricoes />} />
                <Route path="/perfil" element={<Perfil />} />
              </Route>
            </Route>

            {/* ---------- Recepção ---------- */}
            <Route element={<RequirePerfil permitidos={["RECEPCAO"]} />}>
              <Route path="/recepcao" element={<RecepcaoLayout />}>
                <Route
                  index
                  element={<Navigate to="/recepcao/pacientes" replace />}
                />
                <Route path="pacientes" element={<PacientesList />} />
                <Route path="pacientes/:cpf" element={<PacienteDetail />} />
                <Route path="profissionais" element={<ProfissionaisList />} />
                <Route
                  path="profissionais/:cpf"
                  element={<ProfissionalDetail />}
                />
                <Route path="triagem" element={<TriagemList />} />
                <Route path="agenda" element={<AgendaPage />} />
                <Route path="auditoria" element={<AuditoriaPage />} />
              </Route>
            </Route>

            {/* ---------- Profissional ---------- */}
            <Route element={<RequirePerfil permitidos={["PROFISSIONAL"]} />}>
              <Route path="/profissional" element={<ProfissionalLayout />}>
                <Route
                  index
                  element={<Navigate to="/profissional/pacientes" replace />}
                />
                <Route path="pacientes" element={<PacientesClinicos />} />
                <Route path="consultas" element={<ConsultasClinicasPage />} />
                <Route
                  path="prescricoes"
                  element={<PrescricoesClinicasPage />}
                />
                <Route path="prontuarios" element={<ProntuariosPage />} />
                <Route path="perfil" element={<MeuPerfil />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </DataProviders>
    </AuthProvider>
  );
}

export default App;
