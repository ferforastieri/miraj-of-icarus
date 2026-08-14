import { expect, test } from "@playwright/test";

test("landing apresenta o portal, as classes, o prestígio e o estado seguro de release", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /O céu não é o limite/i })).toBeVisible();

  if ((page.viewportSize()?.width ?? 0) <= 700) {
    await page.getByText("Menu", { exact: true }).click();
  }

  await expect(page.getByRole("link", { name: "Entrar", exact: true }).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: /Um reino acima das nuvens/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Escolha seu caminho/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Escolha seu caminho. Conquiste seu prestígio." })).toBeVisible();
  await expect(page.getByTestId("prestige-evolution")).toBeVisible();
  await expect(page.getByText("Release em preparação")).toBeVisible();
  await expect(page.locator("body")).toHaveCSS("background-color", "rgb(6, 31, 32)");
});

test("cada uma das oito classes possui uma página própria", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#classes a")).toHaveCount(8);
  await page.locator('#classes a[href="/classes/guerreiro"]').click();
  await expect(page).toHaveURL(/\/classes\/guerreiro$/);
  await expect(page.getByRole("heading", { name: "Guerreiro", exact: true })).toBeVisible();
  await expect(page.getByText("Bronze", { exact: true })).toBeVisible();
  await expect(page.getByText("Prata", { exact: true })).toBeVisible();
  await expect(page.getByText("Ouro", { exact: true })).toBeVisible();
  await expect(page.getByText("Jade", { exact: true })).toBeVisible();
  await expect(page.getByText("Fernandium", { exact: true })).toBeVisible();
  await expect(page.getByText("Miriamita", { exact: true })).toBeVisible();
  await expect(page.getByText(/Nível 110 · A transcendência/)).toBeVisible();
});

test("insígnia registra o nível e mantém o material conquistado entre dois marcos", async ({ page }) => {
  await page.goto("/");
  const evolution = page.getByTestId("prestige-evolution");
  await evolution.getByLabel("Escolher nível").fill("55");
  const badge = evolution.locator('[data-level="55"]');
  await expect(badge).toBeVisible();
  await expect(badge.locator('img[src*="/topaz/"]')).toBeVisible();
  await expect(badge.locator('img[src*="/amethyst/"]')).toHaveCount(0);
  await expect(badge.getByText("55", { exact: true })).toBeVisible();
});

test("a classe escolhida controla a insígnia exibida no prestígio", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Exibir a evolução de Arqueiro" }).click();
  await expect(page.getByRole("heading", { name: "Arqueiro", exact: true })).toBeVisible();
  const evolution = page.getByTestId("prestige-evolution");
  await evolution.getByLabel("Escolher nível").fill("50");
  await expect(evolution.locator('img[src*="/topaz/archer-selected.png"]')).toBeVisible();
});

test("a evolução encerra em Miriamita sem reiniciar automaticamente", async ({ page }) => {
  await page.goto("/");
  const evolution = page.getByTestId("prestige-evolution");
  await evolution.getByLabel("Escolher nível").fill("109");
  await evolution.getByRole("button", { name: "Reproduzir evolução" }).click();
  await expect(evolution.locator('[data-level="110"]')).toBeVisible();
  await expect(evolution.getByRole("button", { name: "Evolução concluída" })).toBeDisabled();
  await page.waitForTimeout(450);
  await expect(evolution.locator('[data-level="110"]')).toBeVisible();
});

test("botões usam focused somente enquanto o ponteiro está sobre eles", async ({ page }) => {
  await page.goto("/");
  test.skip(!await page.evaluate(() => matchMedia("(hover: hover) and (pointer: fine)").matches),
    "dispositivos de toque não possuem hover");
  const login = page.getByRole("link", { name: "Entrar", exact: true }).first();
  await expect(login).toHaveCSS("background-image", /button-default\.png/);
  await login.hover();
  await expect(login).toHaveCSS("background-image", /button-focused\.png/);
  await login.evaluate(element => element.addEventListener("click", event => event.preventDefault(), { once: true }));
  await login.click();
  await page.mouse.move(10, 500);
  await expect(login).toHaveCSS("background-image", /button-default\.png/);
});

test("cadastro público valida os campos", async ({ page }) => {
  await page.goto("/criar-conta");
  await expect(page.getByRole("navigation", { name: "Navegação principal" })).toBeVisible();
  await expect(page.getByText("Uma reconstrução independente em andamento")).toBeVisible();
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
  await page.getByText("Arqueiro", { exact: true }).click();
  await expect(page.getByRole("radio", { name: "Arqueiro" })).toBeChecked();
  await page.getByRole("button", { name: "Criar personagem" }).click();
  await expect(page.getByRole("heading", { name: character })).toBeVisible();
  await expect(page.getByText(/Arqueiro · Nível 1/)).toBeVisible();

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
  await expect(page.getByTestId("prestige-evolution").locator('[data-level="110"]')).toBeVisible();
});
