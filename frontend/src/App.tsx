import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Login } from "./pages/Login/Login";
import { RegistroHumor } from "./pages/RegistroHumor/RegistroHumor";
import { Consultas } from "./pages/Consultas/Consultas";
import { Prescricoes } from "./pages/Prescricoes/Prescricoes";
import { Perfil } from "./pages/Perfil/Perfil";
import { PatientLayout } from "./layouts/PatientLayout/PatientLayout";
import { RecepcaoLayout } from "./layouts/RecepcaoLayout/RecepcaoLayout";
import { PacientesList } from "./pages/Recepcao/Pacientes/PacientesList";
import {
  TriagemPage,
  AgendaPage,
  ProfissionaisPage,
  AuditoriaPage,
} from "./pages/Recepcao/Placeholders/RecepcaoPlaceholders";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        <Route element={<PatientLayout />}>
          <Route path="/diario" element={<RegistroHumor />} />
          <Route path="/consultas" element={<Consultas />} />
          <Route path="/prescricoes" element={<Prescricoes />} />
          <Route path="/perfil" element={<Perfil />} />
        </Route>

        <Route path="/recepcao" element={<RecepcaoLayout />}>
          <Route index element={<Navigate to="/recepcao/pacientes" replace />} />
          <Route path="pacientes" element={<PacientesList />} />
          <Route path="triagem" element={<TriagemPage />} />
          <Route path="agenda" element={<AgendaPage />} />
          <Route path="profissionais" element={<ProfissionaisPage />} />
          <Route path="auditoria" element={<AuditoriaPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
