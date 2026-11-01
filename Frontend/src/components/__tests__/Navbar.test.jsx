import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router-dom";
import Navbar from "../Navbar.jsx";
import { AuthProvider } from "../../context/AuthContext.jsx";
import { CartProvider } from "../../context/CartContext.jsx";
import { ThemeProvider } from "../../context/ThemeContext.jsx";

function LocationProbe() {
  const location = useLocation();
  return <p data-testid="location">{location.pathname + location.search}</p>;
}

function renderNavbar(initialEntries = ["/"]) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <LocationProbe />
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </MemoryRouter>,
  );
}

describe("Navbar", () => {
  it("permite buscar productos desde el buscador mobile", async () => {
    const user = userEvent.setup();
    renderNavbar();

    expect(screen.getByAltText("Neo Tech")).toHaveAttribute(
      "src",
      "/logo_light_cropped.png",
    );

    await user.click(screen.getByRole("button", { name: "Buscar" }));

    const inputs = screen.getAllByLabelText("Buscar productos");
    const mobileInput = inputs[inputs.length - 1];

    await user.type(mobileInput, "iphone");
    await user.keyboard("{Enter}");

    expect(screen.getByTestId("location")).toHaveTextContent(
      "/products?search=iphone",
    );
  });

  it("activa el modo oscuro y lo persiste", async () => {
    const user = userEvent.setup();
    renderNavbar();

    await user.click(
      screen.getAllByRole("button", { name: "Activar modo oscuro" })[0],
    );

    await waitFor(() => {
      expect(document.documentElement.classList.contains("dark")).toBe(true);
    });
    expect(localStorage.getItem("theme")).toBe("dark");
  });
});
