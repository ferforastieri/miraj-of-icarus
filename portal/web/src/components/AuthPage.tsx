"use client";

import { useAccount } from "@/api/authentication/get-account";
import { AuthPortal } from "@/components/AuthPortal";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { routes } from "@/routes";
import { useEffect } from "react";

export function AuthPage({ registering }: { registering: boolean }) {
  const account = useAccount();
  useEffect(() => {
    if (account.data) window.location.replace(routes.client);
  }, [account.data]);
  return (
    <div className="min-h-screen overflow-hidden bg-[linear-gradient(90deg,rgba(4,31,26,.82),rgba(4,31,26,.25),rgba(4,31,26,.68)),url('/media/portal-hero-v3.png')] bg-cover bg-center bg-fixed">
      <SiteHeader />
      {account.isLoading || account.data
        ? <main className="grid min-h-[60vh] place-items-center text-sm uppercase tracking-[.16em] text-mist">Abrindo a passagem...</main>
        : <AuthPortal registering={registering} initialError={account.isError ? "service_unavailable" : undefined} />}
      <SiteFooter />
    </div>
  );
}
