import { expect, test } from "@playwright/test";

test("landing apresenta o mundo e o estado seguro de release", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /A passagem está aberta/i })).toBeVisible();
  await expect(page.getByRole("link", { name: "Entrar", exact: true }).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: /Um mundo antigo/i })).toBeVisible();
  await expect(page.getByText("Release em preparação")).toBeVisible();
  await expect(page.locator("body")).toHaveCSS("background-color", "rgb(6, 31, 32)");
});

test("cadastro público valida os campos", async ({ page }) => {
  await page.goto("/criar-conta");
  await expect(page.getByRole("heading", { name: "Abra sua passagem." })).toBeVisible();
  await expect(page.getByRole("button", { name: "Criar conta e entrar" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Conta" })).toHaveAttribute("minlength", "3");
  await expect(page.getByLabel("Senha", { exact: true })).toHaveAttribute("minlength", "10");
  await expect(page.getByLabel("Verificação de segurança")).toBeVisible();
});

test("cadastro encaminha Turnstile e IP real para a API", async ({ request }) => {
  const suffix = `${Date.now()}${Math.floor(Math.random() * 10000)}`;
  const response = await request.post("/api/auth/register", {
    data: {
      userName: `Conta${suffix}`.slice(0, 32),
      password: "uma senha de teste segura",
      turnstileToken: "development-bypass",
    },
    headers: { "cf-connecting-ip": "198.51.100.44" },
  });
  expect(response.status()).toBe(201);
});

test("cadastro mantém sessão, renova token e gerencia o ciclo do personagem", async ({ page, context }) => {
  const suffix = `${Date.now()}${Math.floor(Math.random() * 10000)}`;
  const account = `Conta${suffix}`.slice(0, 32);
  const character = `Heroi${suffix}`.slice(0, 24);

  await page.goto("/criar-conta");
  await page.getByRole("textbox", { name: "Conta" }).fill(account);
  await page.getByLabel("Senha", { exact: true }).fill("uma senha de teste segura");
  await page.getByLabel("Confirmar senha").fill("uma senha de teste segura");
  await page.getByRole("button", { name: "Criar conta e entrar" }).click();
  await expect(page.getByRole("heading", { name: new RegExp(account) })).toBeVisible();

  await page.getByLabel("Nome").fill(character);
  await page.getByText("Naturalista", { exact: true }).click();
  await expect(page.getByRole("radio", { name: "Naturalista" })).toBeChecked();
  await page.getByRole("button", { name: "Criar personagem" }).click();
  await expect(page.getByRole("heading", { name: character })).toBeVisible();
  await expect(page.getByText(/Naturalista · Nível 1/)).toBeVisible();

  await page.getByText("Agendar exclusão").click();
  await page.getByLabel(new RegExp(`Digite ${character}`)).fill(character);
  await page.getByRole("button", { name: "Excluir em 7 dias" }).click();
  await expect(page.getByText(/Bloqueado\. Exclusão em/)).toBeVisible();
  await page.getByRole("button", { name: "Cancelar exclusão" }).click();
  await expect(page.getByText(/Bloqueado\. Exclusão em/)).toHaveCount(0);

  await context.clearCookies({ name: "miraj_of_icarus_access" });
  await page.goto("/cliente");
  await expect(page.getByRole("heading", { name: new RegExp(account) })).toBeVisible();
  const cookies = await context.cookies();
  expect(cookies.some(cookie => cookie.name === "miraj_of_icarus_access" && cookie.httpOnly)).toBeTruthy();
  expect(cookies.some(cookie => cookie.name === "miraj_of_icarus_refresh" && cookie.httpOnly)).toBeTruthy();

  await page.getByRole("button", { name: "Sair da conta" }).click();
  await expect(page.getByRole("heading", { name: "Retorne ao reino." })).toBeVisible();
  expect((await context.cookies()).some(cookie => cookie.name.startsWith("miraj_of_icarus_"))).toBeFalsy();
});

test("movimento reduzido desativa a chegada cinematográfica", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const duration = await page.getByTestId("hero-image").evaluate(
    (element) => Number.parseFloat(getComputedStyle(element).animationDuration),
  );
  expect(duration).toBeLessThan(.001);
});
