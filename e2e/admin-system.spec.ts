import { execFileSync } from "node:child_process"
import fs from "node:fs"
import path from "node:path"
import { expect, test } from "@playwright/test"

const API_BASE_URL = process.env.E2E_API_BASE_URL || "http://127.0.0.1:8000"

type RegisterResponse = {
  user?: {
    id?: string
    email?: string
  }
  session?: {
    access_token?: string
  }
}

type LoginResponse = {
  user?: {
    id?: string
    email?: string
  }
  session?: {
    access_token?: string
  }
}

type OrderCreateResponse = {
  order?: {
    id?: string
  }
}

type EnvMap = Record<string, string>

function uniqueSuffix() {
  const random = Math.random().toString(36).slice(2, 8)
  return `${Date.now()}-${random}`
}

function loadBackendEnv(backendDir: string): EnvMap {
  const envPath = path.resolve(backendDir, ".env")
  if (!fs.existsSync(envPath)) {
    return {}
  }
  const raw = fs.readFileSync(envPath, "utf-8")
  const result: EnvMap = {}
  for (const line of raw.split(/\r?\n/g)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const idx = trimmed.indexOf("=")
    if (idx <= 0) continue
    const key = trimmed.slice(0, idx).trim()
    const value = trimmed.slice(idx + 1).trim()
    result[key] = value
  }
  return result
}

function seedAdmin(uid: string, email: string) {
  const backendDir = path.resolve(process.cwd(), "backend")
  const backendEnv = loadBackendEnv(backendDir)
  const venvPython = path.resolve(
    backendDir,
    ".venv",
    "Scripts",
    "python.exe"
  )
  const pythonCommand = fs.existsSync(venvPython) ? venvPython : "python"

  execFileSync(
    pythonCommand,
    [
      "-m",
      "scripts.seed_admin_user",
      "--uid",
      uid,
      "--email",
      email,
      "--role",
      "admin",
      "--display-name",
      "E2E Admin",
      "--set-claim",
    ],
    {
      cwd: backendDir,
      stdio: "pipe",
      encoding: "utf-8",
      env: {
        ...process.env,
        ...backendEnv,
        ...(backendEnv.FIREBASE_CREDENTIALS_PATH
          ? {
              FIREBASE_CREDENTIALS_PATH: path.resolve(
                backendDir,
                backendEnv.FIREBASE_CREDENTIALS_PATH
              ),
            }
          : {}),
      },
    }
  )
}

test.describe("Admin System", () => {
  test("login, dashboard, orders update, and product CRUD", async ({
    request,
    page,
  }) => {
    const id = uniqueSuffix()
    const email = `admin-e2e-${id}@example.com`
    const password = `Admin!${id}`
    const productTitle = `Produk E2E ${id}`
    const editedTitle = `${productTitle} Edited`

    const registerResponse = await request.post(`${API_BASE_URL}/auth/register`, {
      data: {
        email,
        password,
        name: "Admin E2E",
      },
    })
    expect(registerResponse.ok()).toBeTruthy()
    const registerBody = (await registerResponse.json()) as RegisterResponse
    const uid = registerBody.user?.id
    expect(uid).toBeTruthy()
    seedAdmin(uid as string, email)

    const loginResponse = await request.post(`${API_BASE_URL}/auth/login`, {
      data: { email, password },
    })
    expect(loginResponse.ok()).toBeTruthy()
    const loginBody = (await loginResponse.json()) as LoginResponse
    const accessToken = loginBody.session?.access_token
    expect(accessToken).toBeTruthy()

    const createOrderResponse = await request.post(`${API_BASE_URL}/orders`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      data: {
        address: {
          label: "E2E",
          recipient_name: "Admin E2E",
          city: "Bandung",
        },
        shipping_option: {
          id: "standar",
          price: 15000,
        },
        items: [{ product_id: "e2e", qty: 1 }],
        subtotal: 250000,
        shipping_fee: 15000,
        payment_method: { id: "transfer" },
      },
    })
    expect(createOrderResponse.ok()).toBeTruthy()
    const createOrderBody =
      (await createOrderResponse.json()) as OrderCreateResponse
    const orderId = createOrderBody.order?.id
    expect(orderId).toBeTruthy()

    await page.goto("/admin")

    await page.getByLabel("Email").fill(email)
    await page.getByLabel("Password").fill(password)
    await page.getByRole("button", { name: "Login Admin" }).click()

    await expect(page.getByText("Admin Control Center")).toBeVisible()
    await expect(page.getByText("Total Orders")).toBeVisible()
    await expect(page.getByText("Revenue Summary")).toBeVisible()

    await page.getByRole("link", { name: "Orders" }).click()
    const orderRow = page.locator("tr").filter({ hasText: orderId as string })
    await expect(orderRow).toBeVisible()
    await orderRow.getByRole("combobox").selectOption("diproses")
    await orderRow.getByRole("button", { name: "Save" }).click()
    await expect(
      page.getByText(`Status order ${orderId} berhasil diperbarui.`)
    ).toBeVisible()
    await orderRow
      .getByRole("button", { name: `Update shipment ${orderId}` })
      .click()

    const shipmentPanel = page.getByRole("dialog")
    await expect(shipmentPanel).toBeVisible()
    await shipmentPanel.getByLabel("Carrier").fill("JNE")
    await shipmentPanel.getByLabel("Nomor Resi").fill(`RESI-${id}`)
    await shipmentPanel.getByLabel("ETA").fill("2-3 hari")
    await shipmentPanel
      .getByRole("button", { name: "Simpan Shipment" })
      .click()
    await expect(
      page.getByText(`Shipment order ${orderId} berhasil diperbarui.`)
    ).toBeVisible()

    await page.getByRole("link", { name: "Products" }).click()
    await page.getByLabel("Nama Produk").fill(productTitle)
    await page.getByLabel("Harga (IDR)").fill("123456")
    await page.getByLabel("Satuan Harga").fill("unit")
    await page.getByLabel("URL Gambar").fill("https://example.com/e2e.jpg")
    await page.getByLabel("Deskripsi").fill("Produk otomatis dari Playwright.")
    await page.getByRole("button", { name: "Tambah Produk" }).click()
    await expect(page.getByText("Produk berhasil ditambahkan.")).toBeVisible()

    const productRow = page.locator("tr").filter({ hasText: productTitle })
    await expect(productRow).toBeVisible()
    await productRow.getByRole("button", { name: "Edit" }).click()

    await page.getByLabel("Nama Produk").fill(editedTitle)
    await page.getByRole("button", { name: "Simpan Perubahan" }).click()
    await expect(page.getByText("Produk berhasil diperbarui.")).toBeVisible()
    await expect(page.locator("tr").filter({ hasText: editedTitle })).toBeVisible()

    page.once("dialog", async (dialog) => dialog.accept())
    await page
      .locator("tr")
      .filter({ hasText: editedTitle })
      .getByRole("button", { name: "Hapus" })
      .click()
    await expect(page.getByText("Produk berhasil dihapus.")).toBeVisible()
  })
})
