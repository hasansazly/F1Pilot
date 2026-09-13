import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("critical journey, persistence, approvals and accessible responsive interface", async ({
  page,
}) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Explore fictional demo" }).click();
  await expect(
    page.getByRole("heading", { name: "A clearer day, Maya." }),
  ).toBeVisible();
  await page.screenshot({
    animations: "disabled",
    path: "docs/screenshots/today-desktop.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Documents", exact: true }).click();
  await page.getByRole("button", { name: "Use sample I-20" }).click();
  const modal = page.getByRole("dialog");
  await expect(
    modal.getByRole("heading", { name: "Review extracted facts" }),
  ).toBeVisible();
  await modal.getByRole("button", { name: "Page 1 · line 7" }).click();
  await expect(modal.locator(".highlighted")).toContainText("Program end:");
  while (
    await modal
      .getByRole("button", { name: "Confirm fact", exact: true })
      .count()
  ) {
    await modal
      .getByRole("button", { name: "Confirm fact", exact: true })
      .first()
      .click();
    await expect(page.getByRole("status")).toContainText("Fact confirmed");
  }
  await modal.getByRole("button", { name: "Close dialog" }).click();
  await page.getByRole("button", { name: "Timeline", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Illustrative OPT filing window opens" }),
  ).toBeVisible();
  await page.reload();
  await page
    .getByRole("button", { name: "Today", exact: false })
    .first()
    .click();
  await page.getByRole("button", { name: "Review next step" }).first().click();
  await expect(
    page
      .getByRole("dialog")
      .getByRole("heading", { name: "Supporting evidence" }),
  ).toBeVisible();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Prepare a DSO email", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Approve draft for download" })
    .click();
  await page.getByRole("button", { name: "Activity", exact: true }).click();
  await expect(
    page.getByText("Email draft approved", { exact: true }).first(),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Download draft" }).first(),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Today", exact: false })
    .first()
    .click();
  const accessibility = await new AxeBuilder({ page }).analyze();
  expect(accessibility.violations).toEqual([]);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    animations: "disabled",
    path: "docs/screenshots/today-mobile.png",
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Toggle navigation" }).click();
  await page.getByRole("button", { name: "Documents", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Your evidence library" }),
  ).toBeVisible();
});
test("server isolation, upload validation, export, and deletion", async ({
  browser,
}) => {
  const first = await browser.newContext();
  const second = await browser.newContext();
  const origin = "http://127.0.0.1:3000";
  const a = first.request,
    b = second.request;
  expect((await a.get("/api/workspace")).status()).toBe(401);
  for (const request of [a, b])
    expect(
      (
        await request.post("/api/auth", {
          headers: { origin },
          data: { mode: "demo" },
        })
      ).ok(),
    ).toBe(true);
  const wa = (await (await a.get("/api/workspace")).json()).workspace;
  const id = wa.artifacts[0].id;
  expect((await b.get(`/api/documents?id=${id}`)).status()).toBe(404);
  expect(
    (
      await b.post("/api/workspace", {
        headers: { origin },
        data: { op: "confirm", id: wa.facts[0].id, value: "hijack" },
      })
    ).status(),
  ).toBe(400);
  expect(
    (
      await a.post("/api/workspace", {
        headers: { origin: "https://attacker.example" },
        data: { op: "run" },
      })
    ).status(),
  ).toBe(400);
  const draft = (
    await (
      await a.post("/api/workspace", {
        headers: { origin },
        data: { op: "prepare", topic: "My dates" },
      })
    ).json()
  ).result;
  expect((await a.get(`/api/export?action=${draft.id}`)).status()).toBe(403);
  const exported = await (await a.get("/api/export")).json();
  expect(exported.workspace.facts[0].quote).toBeTruthy();
  expect(exported.workspace.artifacts[0].text).toContain("FICTIONAL");
  const upload = await a.post("/api/documents", {
    headers: { origin },
    multipart: {
      category: "I-20",
      file: {
        name: "fixture.txt",
        mimeType: "text/plain",
        buffer: Buffer.from("Program end: 2027-05-15"),
      },
    },
  });
  expect(upload.ok()).toBe(true);
  const uploaded = await upload.json();
  expect(
    uploaded.workspace.facts.some(
      (f: { artifactId: string }) => f.artifactId === uploaded.result.id,
    ),
  ).toBe(true);
  expect(
    (
      await a.post("/api/documents", {
        headers: { origin },
        multipart: {
          file: {
            name: "bad.html",
            mimeType: "text/html",
            buffer: Buffer.from("<script>alert(1)</script>"),
          },
        },
      })
    ).status(),
  ).toBe(400);
  await a.post("/api/workspace", {
    headers: { origin },
    data: { op: "deleteDocument", id },
  });
  expect((await a.get(`/api/documents?id=${id}`)).status()).toBe(404);
  await a.post("/api/workspace", {
    headers: { origin },
    data: { op: "deleteAccount", confirmation: "DELETE" },
  });
  expect((await a.get("/api/workspace")).status()).toBe(401);
  expect((await b.get("/api/workspace")).status()).toBe(200);
  await first.close();
  await second.close();
});
test("new account, manual inbox review and cancellation", async ({ page }) => {
  await page.goto("/login");
  await page
    .getByRole("button", { name: "Create account", exact: true })
    .click();
  await page.getByLabel("Your name").fill("Test Student");
  await page.getByLabel("Email address").fill(`test-${Date.now()}@example.com`);
  await page
    .getByLabel("Password", { exact: true })
    .fill("Fictional-pass-2026!");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Create my workspace" }).click();
  await expect(
    page.getByRole("heading", { name: "A clearer day, Test." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Inbox", exact: true }).click();
  await page.getByLabel("Subject", { exact: true }).fill("DSO workshop");
  await page
    .getByLabel("Original message")
    .fill("Please bring your I-20 to a workshop on 2027-01-15.");
  await page.getByRole("button", { name: "Import for review" }).click();
  await page
    .getByRole("button", { name: "Approve timeline additions" })
    .click();
  await page.getByRole("button", { name: "Timeline", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "DSO workshop" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Requirements", exact: true }).click();
  await page.getByRole("button", { name: "Prepare a DSO question" }).click();
  await page
    .getByRole("button", { name: "Cancel action", exact: true })
    .click();
  await page.getByRole("button", { name: "Activity", exact: true }).click();
  await expect(
    page.getByText("Email draft cancelled", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await page.goto("/workspace");
  await expect(page).toHaveURL(/login/);
});

test("real PDF extraction, manual evidence, and public responsive review", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    animations: "disabled",
    path: "docs/screenshots/landing-desktop.png",
    fullPage: true,
  });
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    animations: "disabled",
    path: "docs/screenshots/landing-mobile.png",
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/login");
  await page.getByRole("button", { name: "Explore fictional demo" }).click();
  await expect(
    page.getByRole("heading", { name: "A clearer day, Maya." }),
  ).toBeVisible();
  const pdfPage = await page.context().newPage();
  await pdfPage.setContent(
    "<h1>FICTIONAL I-20 TEST</h1><p>Student name: Test Student</p><p>Institution: Fictional University</p><p>Degree: Computer Science</p><p>Program start: 2025-08-01</p><p>Program end: 2027-05-15</p>",
  );
  const pdf = await pdfPage.pdf();
  await pdfPage.close();
  const response = await page.request.post("/api/documents", {
    headers: { origin: "http://127.0.0.1:3000" },
    multipart: {
      category: "I-20",
      file: {
        name: "fictional-i20.pdf",
        mimeType: "application/pdf",
        buffer: pdf,
      },
    },
  });
  expect(response.ok(), await response.text()).toBe(true);
  const data = await response.json();
  expect(
    data.workspace.facts.filter(
      (f: { artifactId: string }) => f.artifactId === data.result.id,
    ).length,
  ).toBe(5);
  const manual = await page.request.post("/api/workspace", {
    headers: { origin: "http://127.0.0.1:3000" },
    data: {
      op: "proposeFact",
      artifactId: data.result.id,
      key: "degree",
      value: "Computer Science",
      page: 1,
      line: 4,
    },
  });
  expect(manual.ok()).toBe(true);
  const invalid = await page.request.post("/api/workspace", {
    headers: { origin: "http://127.0.0.1:3000" },
    data: {
      op: "proposeFact",
      artifactId: data.result.id,
      key: "degree",
      value: "invented",
      page: 100,
      line: 1,
    },
  });
  expect(invalid.status()).toBe(400);
  await page.reload();
  for (const name of [
    "Evidence Map",
    "Timeline",
    "Documents",
    "Employment",
    "Travel",
    "Data and Privacy",
    "Settings",
  ]) {
    await page.getByRole("button", { name, exact: true }).click();
    await expect(
      page.getByRole("heading", { name, exact: true }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
  await page.getByRole("button", { name: "Documents", exact: true }).click();
  await page.getByRole("button", { name: /fictional-i20.pdf/ }).click();
  await expect(
    page
      .getByRole("dialog")
      .getByRole("heading", { name: "Review extracted facts" }),
  ).toBeVisible();
  await page.screenshot({
    animations: "disabled",
    path: "docs/screenshots/document-review.png",
    fullPage: true,
  });
});
