import { User } from "lucide-react";
import { PagePlaceholder } from "../../components/PagePlaceholder/PagePlaceholder";

export function Perfil() {
  return (
    <PagePlaceholder
      title="Perfil"
      subtitle="Gerencie seus dados pessoais e preferências da conta."
      icon={<User size={22} strokeWidth={2} />}
    />
  );
}
