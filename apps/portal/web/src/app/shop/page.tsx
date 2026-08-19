import { CommercePage } from "@/components/CommercePage";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Shop",
  description: "A loja de itens cosméticos e serviços de conta de Miraj of Icarus está em preparação.",
  path: "/shop",
  index: false,
});

export default function ShopPage() {
  return <CommercePage eyebrow="Mercado dos reinos" title="A loja ainda está sendo preparada." description="Itens cosméticos e serviços de conta só serão apresentados quando suas regras e formas de aquisição estiverem definidas." />;
}
