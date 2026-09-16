import { CalendarCheck, FileText, ClipboardList } from "lucide-react";
import { PagePlaceholder } from "../../../components/PagePlaceholder/PagePlaceholder";

export function ConsultasClinicasPage() {
  return (
    <PagePlaceholder
      title="Consultas"
      subtitle="Sua agenda clínica e as sessões conduzidas."
      icon={<CalendarCheck size={22} strokeWidth={2} />}
    />
  );
}

export function PrescricoesClinicasPage() {
  return (
    <PagePlaceholder
      title="Prescrições"
      subtitle="Prescrições emitidas e orientações terapêuticas."
      icon={<FileText size={22} strokeWidth={2} />}
    />
  );
}

export function ProntuariosPage() {
  return (
    <PagePlaceholder
      title="Prontuários"
      subtitle="Registros clínicos das sessões realizadas."
      icon={<ClipboardList size={22} strokeWidth={2} />}
    />
  );
}
