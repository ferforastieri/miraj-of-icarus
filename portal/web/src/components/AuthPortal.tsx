"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useLogin } from "@/api/authentication/login";
import { useRegister } from "@/api/authentication/register";
import { ApiError } from "@/api/http";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Kicker } from "@/components/ui/Kicker";
import { Turnstile } from "@/components/Turnstile";
import { routes } from "@/routes";

const messages: Record<string, string> = {
  invalid_credentials: "Conta ou senha incorretas.",
  invalid_account_name: "Use de 3 a 32 letras ou números no nome da conta.",
  invalid_password: "A senha precisa ter entre 10 e 200 caracteres.",
  account_name_unavailable: "Esse nome de conta já está em uso.",
  password_mismatch: "As senhas não são iguais.",
  service_unavailable: "O serviço de contas está indisponível. Tente novamente em instantes.",
  session_expired: "Sua sessão terminou. Entre novamente.",
  turnstile_required: "Conclua a verificação de segurança.",
  turnstile_invalid: "A verificação de segurança expirou. Tente novamente.",
  turnstile_failed: "A verificação de segurança expirou. Tente novamente.",
  rate_limited: "Muitas tentativas. Aguarde um pouco antes de tentar novamente.",
};

export function AuthPortal({ registering, initialError }: { registering: boolean; initialError?: string }) {
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
      window.location.assign(routes.client);
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.code : "service_unavailable");
      if (reason instanceof ApiError && reason.retryAfter) setRetryAfter(reason.retryAfter);
    }
  }

  const labelClass = "grid gap-2 text-xs uppercase tracking-[.1em] text-mist";
  const tabClass = "relative grid min-h-[54px] place-items-center bg-[url('/media/game-ui/jade/button-default.png')] bg-[length:100%_100%] bg-center bg-no-repeat px-5 font-miraj-of-icarus text-xs font-semibold uppercase tracking-[.055em] text-[#dce8de] [text-shadow:0_2px_2px_#041b16] focus:bg-[url('/media/game-ui/jade/button-focused.png')] focus:text-white focus:drop-shadow-[0_0_9px_rgba(40,185,111,.7)] focus-visible:bg-[url('/media/game-ui/jade/button-focused.png')]";
  return (
    <main className="relative grid min-h-[calc(100vh-142px)] place-items-center px-6 py-20 max-[620px]:px-2 max-[620px]:py-10">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(255,232,157,.12),transparent_35%)]" aria-hidden="true" />
      <section className="jade-card relative w-[min(620px,100%)] px-8 py-7 drop-shadow-[0_30px_60px_rgba(3,27,22,.48)] max-[620px]:px-2 max-[620px]:py-5" aria-labelledby="auth-title">
        <Kicker>Portal do jogador</Kicker>
        <h1 id="auth-title" className="mb-3 font-display text-[clamp(2.8rem,6vw,4.3rem)] font-medium leading-[.9]">{registering ? "Abra sua passagem." : "Retorne ao reino."}</h1>
        <p className="leading-relaxed text-mist">{registering ? "Crie sua conta para preparar seus personagens e acompanhar os reinos." : "Entre para acessar seus personagens, o estado dos reinos e a versão mais recente."}</p>
        <div className="my-6 grid grid-cols-2 gap-2" role="tablist" aria-label="Acesso à conta">
          <Link className={`${tabClass} ${!registering ? "text-white drop-shadow-[0_0_8px_rgba(40,185,111,.65)]" : ""}`} style={{ backgroundImage: `url('/media/game-ui/jade/button-${!registering ? "focused" : "default"}.png')` }} role="tab" aria-selected={!registering} href={routes.login}>Entrar</Link>
          <Link className={`${tabClass} ${registering ? "text-white drop-shadow-[0_0_8px_rgba(40,185,111,.65)]" : ""}`} style={{ backgroundImage: `url('/media/game-ui/jade/button-${registering ? "focused" : "default"}.png')` }} role="tab" aria-selected={registering} href={routes.register}>Criar conta</Link>
        </div>
        {error && <Alert className="mb-4" role="alert">
          {messages[error] ?? "Não foi possível concluir a ação."}
          {error === "rate_limited" && retryAfter ? ` Tente novamente em ${Math.ceil(retryAfter / 60)} minuto(s).` : ""}
        </Alert>}
        <form className="grid gap-4" onSubmit={submit}>
          <label className={labelClass}><span>Conta</span><Input name="userName" autoComplete="username" minLength={3} maxLength={32} required /></label>
          <label className={labelClass}><span>Senha</span><Input name="password" type="password" autoComplete={registering ? "new-password" : "current-password"} minLength={10} maxLength={200} required /></label>
          {registering && <label className={labelClass}><span>Confirmar senha</span><Input name="passwordConfirmation" type="password" autoComplete="new-password" minLength={10} maxLength={200} required /></label>}
          {registering && <Turnstile onToken={setTurnstileToken} />}
          <Button className="mt-1 w-full" variant="primary" type="submit" disabled={pending}>{pending ? "Abrindo passagem..." : registering ? "Criar conta e entrar" : "Entrar na área do cliente"}</Button>
        </form>
        <Link className="relative mt-6 block text-center text-xs text-mist" href={routes.home}>← Voltar para o portal</Link>
      </section>
    </main>
  );
}
