import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { buttonStyles } from "@/components/ui/Button";
import { routes } from "@/i18n/routing";

type CommerceScreenProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function CommerceScreen({ eyebrow, title, description }: CommerceScreenProps) {
  const t = useTranslations("Commerce");
  return (
    <div className="min-h-screen bg-[#041d19]">
      <section className="relative isolate grid min-h-[82svh] place-items-center overflow-hidden px-6 pb-20 pt-56 text-center max-[700px]:px-4 max-[700px]:pt-32">
        <div className="absolute inset-0 -z-20 bg-[url('/media/landing/news-frontier-v1.webp')] bg-cover bg-center" aria-hidden="true" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(3,25,21,.55),rgba(3,25,21,.96)),radial-gradient(circle_at_50%_42%,rgba(45,157,99,.15),transparent_44%)]" aria-hidden="true" />
        <SiteHeader />
        <div className="w-[min(820px,100%)]">
          <p className="text-xs uppercase tracking-[.24em] text-[#a9e9c4]">{eyebrow}</p>
          <h1 className="mt-4 font-miraj-of-icarus text-[clamp(3.2rem,7vw,6.8rem)] leading-[.84] text-[#f4f1df]">{title}</h1>
          <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-[#d2dfd5]">{description}</p>
          <Link className={`${buttonStyles("primary", true)} mt-9`} href={routes.community}>{t("follow")}</Link>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
