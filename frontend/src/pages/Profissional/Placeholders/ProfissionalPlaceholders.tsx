import { FileText } from "lucide-react";
import { PagePlaceholder } from "../../../components/PagePlaceholder/PagePlaceholder";
import { ConsultasUsuario } from "../../../components/ConsultasUsuario/ConsultasUsuario";

export function ConsultasClinicasPage() {
  return <ConsultasUsuario perfil="PROFISSIONAL" />;
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
