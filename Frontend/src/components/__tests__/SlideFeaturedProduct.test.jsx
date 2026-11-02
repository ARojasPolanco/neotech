import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import SlideFeaturedProduct from "../SlideFeaturedProduct.jsx";

const baseProduct = {
  id: "p1",
  name: "Parlante Demo",
  imageUrl: null,
  price: 20000,
  discountActive: false,
  discountPercent: null,
  discountedPrice: null,
};

function renderSlide(product) {
  return render(
    <MemoryRouter>
      <SlideFeaturedProduct product={product} />
    </MemoryRouter>,
  );
}

describe("SlideFeaturedProduct", () => {
  it("muestra el precio normal y no un descuento cuando no hay oferta activa", () => {
    renderSlide(baseProduct);

    expect(screen.getByText("$20.000")).toBeInTheDocument();
    expect(screen.queryByText("$0")).not.toBeInTheDocument();
    expect(screen.queryByText(/0% OFF/)).not.toBeInTheDocument();
  });

  it("muestra el descuento cuando está activo", () => {
    renderSlide({
      ...baseProduct,
      discountActive: true,
      discountPercent: 25,
      discountedPrice: 15000,
    });

    expect(screen.getByText("25% OFF")).toBeInTheDocument();
    expect(screen.getByText("$15.000")).toBeInTheDocument();
    expect(screen.getByText("$20.000")).toBeInTheDocument();
  });
});
