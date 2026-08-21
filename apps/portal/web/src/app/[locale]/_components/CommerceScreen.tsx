import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { buttonStyles } from "@/components/ui/Button";
import { WaterBackdrop } from "@/components/ui/WaterBackdrop";
import { routes } from "@/i18n/routing";

type CommerceScreenProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function CommerceScreen({ eyebrow, title, description }: CommerceScreenProps) {
  const t = useTranslations("Commerce");
  return (
    <div className="miraj-page">
      <section className="miraj-page-hero px-6 pb-12 pt-52 text-center max-[700px]:px-4 max-[700px]:pt-28">
        <WaterBackdrop />
        <SiteHeader />
        <div className="w-[min(820px,100%)]">
          <p className="text-xs uppercase tracking-[.24em] text-[#a9e9c4]">{eyebrow}</p>
          <h1 className="miraj-page-heading mt-4">{title}</h1>
          <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-[#d2dfd5]">{description}</p>
          <Link className={`${buttonStyles("primary", true)} mt-9`} href={routes.community}>{t("follow")}</Link>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
