import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router-dom";
import Navbar from "../Navbar.jsx";
import { AuthProvider } from "../../context/AuthContext.jsx";
import { CartProvider } from "../../context/CartContext.jsx";

function LocationProbe() {
  const location = useLocation();
  return <p data-testid="location">{location.pathname + location.search}</p>;
}

function renderNavbar(initialEntries = ["/"]) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <AuthProvider>
        <CartProvider>
          <Navbar />
          <LocationProbe />
        </CartProvider>
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe("Navbar", () => {
  it("permite buscar productos desde el buscador mobile", async () => {
    const user = userEvent.setup();
    renderNavbar();

    await user.click(screen.getByRole("button", { name: "Buscar" }));

    const inputs = screen.getAllByLabelText("Buscar productos");
    const mobileInput = inputs[inputs.length - 1];

    await user.type(mobileInput, "iphone");
    await user.keyboard("{Enter}");

    expect(screen.getByTestId("location")).toHaveTextContent(
      "/products?search=iphone",
    );
  });
});
