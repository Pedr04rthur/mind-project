import { FileText } from "lucide-react";
import { PagePlaceholder } from "../../components/PagePlaceholder/PagePlaceholder";

export function Prescricoes() {
  return (
    <PagePlaceholder
      title="Prescrições"
      subtitle="Consulte as prescrições e orientações emitidas pelos seus profissionais."
      icon={<FileText size={22} strokeWidth={2} />}
    />
  );
}
