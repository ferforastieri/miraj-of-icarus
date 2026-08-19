import { AuthPage } from "@/components/AuthPage";
import { privatePageMetadata } from "@/lib/seo";

export const metadata = privatePageMetadata("Entrar", "Acesse sua conta de Miraj of Icarus.");

export default function LoginPage() {
  return <AuthPage registering={false} />;
}
