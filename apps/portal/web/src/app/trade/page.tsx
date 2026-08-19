import { CommercePage } from "@/components/CommercePage";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Trade",
  description: "O sistema de trocas e economia entre personagens de Miraj of Icarus está em preparação.",
  path: "/trade",
  index: false,
});

export default function TradePage() {
  return <CommercePage eyebrow="Trocas entre aventureiros" title="O salão de comércio abrirá em breve." description="O sistema de negociação será apresentado junto das regras de economia, segurança e circulação de itens entre personagens." />;
}
