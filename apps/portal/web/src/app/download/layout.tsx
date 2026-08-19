import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Download",
  description: "Baixe o launcher oficial de Miraj of Icarus para Windows e prepare sua entrada nos reinos.",
  path: "/download",
});

export default function DownloadLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
