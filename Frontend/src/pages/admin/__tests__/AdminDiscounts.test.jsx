import { describe, it, expect, vi } from "vitest";
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

describe("AdminDiscounts", () => {
  it("muestra los códigos y permite cambiar a campañas", async () => {
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

    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <AdminDiscounts />
      </MemoryRouter>,
    );

    expect(await screen.findByText("NEO-TEST")).toBeInTheDocument();
    expect(screen.getByText("Activo")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Campañas/ }));

    expect(screen.getByText("Nueva campaña")).toBeInTheDocument();
    expect(screen.getByText("Auriculares Demo")).toBeInTheDocument();
  });
});
