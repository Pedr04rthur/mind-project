import { Calendar, ShieldCheck } from "lucide-react";
import { PagePlaceholder } from "../../../components/PagePlaceholder/PagePlaceholder";

export function AgendaPage() {
  return (
    <PagePlaceholder
      title="Agenda"
      subtitle="Controle de fluxo da agenda clínica."
      icon={<Calendar size={22} strokeWidth={2} />}
    />
  );
}

export function AuditoriaPage() {
  return (
    <PagePlaceholder
      title="Auditoria LGPD"
      subtitle="Consulta ao log de exclusões de dados sensíveis."
      icon={<ShieldCheck size={22} strokeWidth={2} />}
    />
  );
}
