import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import CartPage from "../CartPage.jsx";
import { CartProvider } from "../../context/CartContext.jsx";

const discountedItem = {
  key: "p1-v1",
  productId: "p1",
  variantId: "v1",
  name: "Auriculares",
  price: 800,
  originalPrice: 1000,
  discountActive: true,
  discountPercent: 20,
  color: "Negro",
  image: "",
  quantity: 1,
};

describe("CartPage", () => {
  it("muestra el precio original tachado y el porcentaje de descuento", () => {
    localStorage.setItem("cart", JSON.stringify([discountedItem]));

    render(
      <MemoryRouter>
        <CartProvider>
          <CartPage />
        </CartProvider>
      </MemoryRouter>,
    );

    expect(screen.getAllByText("$800").length).toBeGreaterThan(0);
    expect(screen.getByText("$1.000")).toBeInTheDocument();
    expect(screen.getByText("20% OFF")).toBeInTheDocument();
    expect(screen.getByLabelText("Código de descuento")).toBeInTheDocument();
  });
});
