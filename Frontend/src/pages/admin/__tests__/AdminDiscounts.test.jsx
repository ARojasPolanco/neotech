import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import AdminDiscounts from "../AdminDiscounts.jsx";
import api from "../../../config/api.js";

vi.mock("../../../config/api.js", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

const code = {
  id: "c1",
  code: "NEO-TEST",
  discountPercent: "10.00",
  maxUses: 1,
  uses: 0,
  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  isActive: true,
};

const product = {
  id: "p1",
  name: "Auriculares Demo",
  price: 1000,
  imageUrl: null,
  discountActive: false,
  discountPercent: null,
};

function mockLoad() {
  api.get.mockImplementation((url) => {
    if (url === "/admin/discount-codes") {
      return Promise.resolve({ data: [code] });
    }
    if (url === "/admin/discount-campaigns") {
      return Promise.resolve({ data: [] });
    }
    if (url === "/products") {
      return Promise.resolve({ data: [product] });
    }
    return Promise.resolve({ data: [] });
  });
}

function renderPage() {
  return render(
    <MemoryRouter>
      <AdminDiscounts />
    </MemoryRouter>,
  );
}

describe("AdminDiscounts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLoad();
  });

  it("muestra los códigos y permite cambiar a campañas", async () => {
    const user = userEvent.setup();
    renderPage();

    expect(await screen.findByText("NEO-TEST")).toBeInTheDocument();
    expect(screen.getByText("Activo")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Campañas/ }));

    expect(screen.getByText("Nueva campaña")).toBeInTheDocument();
    expect(screen.getByText("Auriculares Demo")).toBeInTheDocument();
  });

  it("usa el modal de la app y no el confirm del navegador al aplicar una campaña", async () => {
    const confirmSpy = vi.spyOn(window, "confirm");
    const user = userEvent.setup();
    renderPage();

    await screen.findByText("NEO-TEST");
    await user.click(screen.getByRole("button", { name: /Campañas/ }));
    await user.type(screen.getByRole("textbox"), "Campaña Demo");
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: "Aplicar campaña" }));

    expect(
      screen.getByText(/Esto reemplaza los descuentos individuales/),
    ).toBeInTheDocument();
    expect(confirmSpy).not.toHaveBeenCalled();
    expect(api.post).not.toHaveBeenCalled();

    confirmSpy.mockRestore();
  });
});
