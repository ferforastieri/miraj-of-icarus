import { privatePageMetadata } from "@/lib/seo";

export const metadata = privatePageMetadata("Minha conta", "Gerencie sua conta e seus personagens de Miraj of Icarus.");

export default function ClientLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
