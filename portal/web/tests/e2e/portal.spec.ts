import { expect, test } from "@playwright/test";

test("landing apresenta o mundo e o estado seguro de release", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /A passagem está aberta/i })).toBeVisible();
  await expect(page.getByRole("link", { name: "Acessar painel" })).toBeVisible();
  await expect(page.getByRole("heading", { name: /O mundo que você lembra/i })).toBeVisible();
  await expect(page.getByText("Release em preparação")).toBeVisible();
  await expect(page.locator("body")).toHaveCSS("background-color", "rgb(7, 11, 16)");
});

test("painel visitante alterna para cadastro e valida os campos", async ({ page }) => {
  await page.goto("/painel?modo=cadastro");
  await expect(page.getByRole("heading", { name: "Abra sua passagem." })).toBeVisible();
  await expect(page.getByRole("button", { name: "Criar conta e entrar" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Conta" })).toHaveAttribute("minlength", "3");
  await expect(page.getByLabel("Senha", { exact: true })).toHaveAttribute("minlength", "10");
});

test("movimento reduzido desativa a chegada cinematográfica", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const duration = await page.locator(".hero-image").evaluate(
    (element) => Number.parseFloat(getComputedStyle(element).animationDuration),
  );
  expect(duration).toBeLessThan(.001);
});
