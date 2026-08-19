import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Reinos",
  description: "Consulte os reinos de Miraj of Icarus e conheça os sistemas planejados de clãs, guerras e territórios.",
  path: "/reinos",
});

export default function RealmsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
