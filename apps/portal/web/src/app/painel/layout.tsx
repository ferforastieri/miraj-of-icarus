import { privatePageMetadata } from "@/lib/seo";

export const metadata = privatePageMetadata("Administração", "Painel administrativo de Miraj of Icarus.");

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
