import { AuthPage } from "@/components/AuthPage";
import { privatePageMetadata } from "@/lib/seo";

export const metadata = privatePageMetadata("Criar conta", "Crie sua conta de Miraj of Icarus.");

export default function RegisterPage() {
  return <AuthPage registering />;
}
