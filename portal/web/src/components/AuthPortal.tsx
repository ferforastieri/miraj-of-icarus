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
import { routes } from "@/routes";

const messages: Record<string, string> = {
  invalid_credentials: "Conta ou senha incorretas.",
  invalid_account_name: "Use de 3 a 32 letras ou números no nome da conta.",
  invalid_password: "A senha precisa ter entre 10 e 200 caracteres.",
  account_name_unavailable: "Esse nome de conta já está em uso.",
  password_mismatch: "As senhas não são iguais.",
  service_unavailable: "O serviço de contas está indisponível. Tente novamente em instantes.",
  session_expired: "Sua sessão terminou. Entre novamente.",
};

export function AuthPortal({ mode, initialError }: { mode: string; initialError?: string }) {
  const registering = mode === "cadastro";
  const login = useLogin();
  const register = useRegister();
  const [error, setError] = useState(initialError);
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
    try {
      await (registering ? register : login).mutateAsync({ userName, password });
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.code : "service_unavailable");
    }
  }

  const labelClass = "grid gap-2 text-xs uppercase tracking-[.1em] text-mist";
  const tabClass = "relative grid min-h-[54px] place-items-center bg-[url('/media/game-ui/buttons/default.png')] bg-[length:100%_100%] bg-center bg-no-repeat px-5 font-masicarus text-xs font-semibold uppercase tracking-[.055em] text-[#cbd8dc] [text-shadow:0_2px_2px_#02070b] hover:bg-[url('/media/game-ui/buttons/focused.png')]";
  const activeTabClass = "bg-[url('/media/game-ui/buttons/focused.png')] text-white drop-shadow-[0_0_8px_rgba(30,139,255,.65)]";
  return (
    <main className="relative grid min-h-[calc(100vh-142px)] place-items-center bg-[linear-gradient(90deg,rgba(7,30,50,.82),rgba(7,30,50,.3),rgba(7,30,50,.7)),url('/media/portal-hero-v3.png')] bg-cover bg-center px-6 py-20 max-[620px]:px-4">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(255,232,157,.12),transparent_35%)]" aria-hidden="true" />
      <section className="relative w-[min(500px,100%)] bg-[linear-gradient(145deg,rgba(35,70,90,.96),rgba(7,29,45,.97))] p-10 shadow-[inset_0_0_0_1px_#607c89,inset_0_0_0_4px_#112b39,0_30px_90px_rgba(5,28,46,.46)] [clip-path:polygon(18px_0,calc(100%-18px)_0,100%_18px,100%_calc(100%-18px),calc(100%-18px)_100%,18px_100%,0_calc(100%-18px),0_18px)] before:pointer-events-none before:absolute before:left-1/2 before:top-0 before:h-1 before:w-28 before:-translate-x-1/2 before:bg-frost before:shadow-[0_0_18px_rgba(112,217,234,.65)] max-[620px]:p-6" aria-labelledby="auth-title">
        <Kicker>Portal do jogador</Kicker>
        <h1 id="auth-title" className="mb-3 font-display text-[clamp(2.8rem,6vw,4.3rem)] font-medium leading-[.9]">{registering ? "Abra sua passagem." : "Retorne ao reino."}</h1>
        <p className="leading-relaxed text-mist">{registering ? "Crie sua conta para preparar seus personagens e acompanhar os reinos." : "Entre para acessar seus personagens, o estado dos reinos e a versão mais recente."}</p>
        <div className="my-6 grid grid-cols-2 gap-2" role="tablist" aria-label="Acesso à conta">
          <Link className={`${tabClass} ${!registering ? activeTabClass : ""}`} role="tab" aria-selected={!registering} href={routes.panel}>Entrar</Link>
          <Link className={`${tabClass} ${registering ? activeTabClass : ""}`} role="tab" aria-selected={registering} href={`${routes.panel}?modo=cadastro`}>Criar conta</Link>
        </div>
        {error && <Alert className="mb-4" role="alert">{messages[error] ?? "Não foi possível concluir a ação."}</Alert>}
        <form className="grid gap-4" onSubmit={submit}>
          <label className={labelClass}><span>Conta</span><Input name="userName" autoComplete="username" minLength={3} maxLength={32} required /></label>
          <label className={labelClass}><span>Senha</span><Input name="password" type="password" autoComplete={registering ? "new-password" : "current-password"} minLength={10} maxLength={200} required /></label>
          {registering && <label className={labelClass}><span>Confirmar senha</span><Input name="passwordConfirmation" type="password" autoComplete="new-password" minLength={10} maxLength={200} required /></label>}
          <Button className="mt-1 w-full" variant="primary" type="submit" disabled={pending}>{pending ? "Abrindo passagem..." : registering ? "Criar conta e entrar" : "Entrar no painel"}</Button>
        </form>
        <Link className="relative mt-6 block text-center text-xs text-mist" href={routes.home}>← Voltar para o portal</Link>
      </section>
    </main>
  );
}
