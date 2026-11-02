import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import CheckoutPage from "../CheckoutPage.jsx";
import { CartProvider } from "../../context/CartContext.jsx";
import api from "../../config/api.js";

vi.mock("../../config/api.js", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const cartItem = {
  key: "p1",
  productId: "p1",
  variantId: null,
  name: "Auriculares",
  price: 1000,
  originalPrice: 1000,
  discountActive: false,
  discountPercent: null,
  color: null,
  image: "",
  quantity: 1,
};

describe("CheckoutPage", () => {
  it("aplica un código y muestra el total con descuento", async () => {
    localStorage.setItem("cart", JSON.stringify([cartItem]));
    api.post.mockResolvedValueOnce({
      data: { code: "NEO-TEST", discountPercent: 10 },
    });

    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <CartProvider>
          <CheckoutPage />
        </CartProvider>
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText("Código de descuento"), "neo-test");
    await user.click(screen.getByRole("button", { name: "Aplicar" }));

    expect(api.post).toHaveBeenCalledWith("/discount-codes/validate", {
      code: "NEO-TEST",
    });

    await waitFor(() => {
      expect(screen.getByText(/NEO-TEST/)).toBeInTheDocument();
    });
    expect(screen.getByText("Descuento (10%)")).toBeInTheDocument();
    expect(screen.getAllByText(/\$900/).length).toBeGreaterThan(0);
  });
});
