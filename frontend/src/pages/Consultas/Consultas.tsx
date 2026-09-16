import { Calendar } from "lucide-react";
import { PagePlaceholder } from "../../components/PagePlaceholder/PagePlaceholder";

export function Consultas() {
  return (
    <PagePlaceholder
      title="Consultas"
      subtitle="Acompanhe suas consultas agendadas e o histórico de atendimentos."
      icon={<Calendar size={22} strokeWidth={2} />}
    />
  );
}
