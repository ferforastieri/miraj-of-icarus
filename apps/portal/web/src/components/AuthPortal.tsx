"use client";

import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { useLogin } from "@/api/authentication/login";
import { useRegister } from "@/api/authentication/register";
import { ApiError } from "@/api/http";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Kicker } from "@/components/ui/Kicker";
import { Turnstile } from "@/components/Turnstile";
import { routes } from "@/routes";

export function AuthPortal({ registering, initialError }: { registering: boolean; initialError?: string }) {
  const t = useTranslations("Auth");
  const router = useRouter();
  const login = useLogin();
  const register = useRegister();
  const [error, setError] = useState(initialError);
  const [retryAfter, setRetryAfter] = useState<number>();
  const [turnstileToken, setTurnstileToken] = useState("");
  const pending = login.isPending || register.isPending;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const userName = String(form.get("userName") ?? "").trim();
    const password = String(form.get("password") ?? "");
    if (registering && password !== String(form.get("passwordConfirmation") ?? "")) {
      setError("password_mismatch");
      return;
    }
    setError(undefined);
    setRetryAfter(undefined);
    try {
      if (registering && !turnstileToken) {
        setError("turnstile_required");
        return;
      }
      if (registering) await register.mutateAsync({ userName, password, turnstileToken });
      else await login.mutateAsync({ userName, password });
      router.push(routes.client);
      router.refresh();
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.code : "service_unavailable");
      if (reason instanceof ApiError && reason.retryAfter) setRetryAfter(reason.retryAfter);
    }
  }

  const labelClass = "grid gap-2 text-xs uppercase tracking-[.1em] text-mist";
  const tabClass = "miraj-button relative grid min-h-[54px] place-items-center px-5 font-miraj-of-icarus text-xs font-semibold uppercase tracking-[.055em] text-[#dce8de] [text-shadow:0_2px_2px_#041b16] hover:text-white hover:drop-shadow-[0_0_9px_rgba(40,185,111,.7)] focus-visible:text-white focus-visible:drop-shadow-[0_0_9px_rgba(40,185,111,.7)]";
  return (
    <main className="relative grid min-h-screen place-items-center px-6 pb-20 pt-52 max-[700px]:pt-32 max-[620px]:px-3 max-[620px]:pb-12">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(255,232,157,.12),transparent_35%)]" aria-hidden="true" />
      <section className="auth-panel relative w-[min(620px,100%)] px-[clamp(34px,8vw,74px)] pb-[clamp(48px,8vw,78px)] pt-[clamp(62px,10vw,94px)] drop-shadow-[0_30px_60px_rgba(3,27,22,.48)]" aria-labelledby="auth-title">
        <Kicker>{t("playerPortal")}</Kicker>
        <h1 id="auth-title" className="mb-3 font-display text-[clamp(2.8rem,6vw,4.3rem)] font-medium leading-[.9]">{t(registering ? "registerTitle" : "loginTitle")}</h1>
        <p className="leading-relaxed text-mist">{t(registering ? "registerDescription" : "loginDescription")}</p>
        <div className="my-6 grid grid-cols-2 gap-2" role="tablist" aria-label={t("accessAria")}>
          <Link className={`${tabClass} ${!registering ? "text-ancient-gold" : ""}`} role="tab" aria-selected={!registering} href={routes.login}>{t("login")}</Link>
          <Link className={`${tabClass} ${registering ? "text-ancient-gold" : ""}`} role="tab" aria-selected={registering} href={routes.register}>{t("register")}</Link>
        </div>
        {error && <Alert className="mb-4" role="alert">
          {t.has(`errors.${error}`) ? t(`errors.${error}`) : t("errors.fallback")}
          {error === "rate_limited" && retryAfter ? ` ${t("retryAfter", { minutes: Math.ceil(retryAfter / 60) })}` : ""}
        </Alert>}
        <form className="grid gap-4" onSubmit={submit}>
          <label className={labelClass}><span>{t("account")}</span><Input name="userName" autoComplete="username" minLength={3} maxLength={32} required /></label>
          <label className={labelClass}><span>{t("password")}</span><Input name="password" type="password" autoComplete={registering ? "new-password" : "current-password"} minLength={10} maxLength={200} required /></label>
          {registering && <label className={labelClass}><span>{t("confirmPassword")}</span><Input name="passwordConfirmation" type="password" autoComplete="new-password" minLength={10} maxLength={200} required /></label>}
          {registering && <Turnstile onToken={setTurnstileToken} />}
          <Button className="mt-1 w-full" variant="primary" type="submit" disabled={pending}>{t(pending ? "opening" : registering ? "registerSubmit" : "loginSubmit")}</Button>
        </form>
        <Link className="relative mt-6 block text-center text-xs text-mist" href={routes.home}>← {t("back")}</Link>
      </section>
    </main>
  );
}
