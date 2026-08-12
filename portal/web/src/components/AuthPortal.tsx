import Link from "next/link";
import { loginAction, registerAction } from "@/app/actions";

const messages: Record<string, string> = {
  invalid_credentials: "Conta ou senha incorretas.",
  invalid_account_name: "Use de 3 a 32 letras ou números no nome da conta.",
  invalid_password: "A senha precisa ter entre 10 e 200 caracteres.",
  account_name_unavailable: "Esse nome de conta já está em uso.",
  password_mismatch: "As senhas não são iguais.",
  service_unavailable: "O serviço de contas está indisponível. Tente novamente em instantes.",
  session_expired: "Sua sessão terminou. Entre novamente.",
};

export function AuthPortal({ mode, error }: { mode: string; error?: string }) {
  const registering = mode === "cadastro";
  return (
    <main className="auth-stage">
      <div className="auth-atmosphere" aria-hidden="true" />
      <section className="auth-card" aria-labelledby="auth-title">
        <p className="kicker">Portal do jogador</p>
        <h1 id="auth-title">{registering ? "Abra sua passagem." : "Retorne ao reino."}</h1>
        <p className="auth-intro">
          {registering
            ? "Crie sua conta para preparar seus personagens e acompanhar os reinos."
            : "Entre para acessar seus personagens, o estado dos reinos e a versão mais recente."}
        </p>
        <div className="auth-tabs" role="tablist" aria-label="Acesso à conta">
          <a role="tab" aria-selected={!registering} href="/painel">Entrar</a>
          <a role="tab" aria-selected={registering} href="/painel?modo=cadastro">Criar conta</a>
        </div>
        {error && <p className="form-message form-error" role="alert">{messages[error] ?? "Não foi possível concluir a ação."}</p>}
        <form action={registering ? registerAction : loginAction} className="auth-form">
          <label>
            <span>Conta</span>
            <input name="userName" autoComplete="username" minLength={3} maxLength={32} required />
          </label>
          <label>
            <span>Senha</span>
            <input name="password" type="password" autoComplete={registering ? "new-password" : "current-password"} minLength={10} maxLength={200} required />
          </label>
          {registering && (
            <label>
              <span>Confirmar senha</span>
              <input name="passwordConfirmation" type="password" autoComplete="new-password" minLength={10} maxLength={200} required />
            </label>
          )}
          <button className="button button-primary auth-submit" type="submit">
            {registering ? "Criar conta e entrar" : "Entrar no painel"}
          </button>
        </form>
        <Link className="auth-back" href="/">← Voltar para o portal</Link>
      </section>
    </main>
  );
}
