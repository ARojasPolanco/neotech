import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ProductCard from "../ProductCard.jsx";

const baseProduct = {
  id: "product-1",
  name: "Auriculares Bluetooth",
  description: "Sonido de calidad",
  price: 1000,
  imageUrl: null,
  discountActive: false,
  ProductVariants: [],
};

function renderCard(product) {
  return render(
    <MemoryRouter>
      <ProductCard product={product} />
    </MemoryRouter>,
  );
}

describe("ProductCard", () => {
  it("muestra el cartel de última unidad cuando el stock total es 1", () => {
    renderCard({
      ...baseProduct,
      ProductVariants: [
        { id: "v1", color: "Negro", colorHex: "#000000", stock: 1, imageUrl: null },
      ],
    });

    expect(screen.getByText("Última unidad")).toBeInTheDocument();
  });

  it("no muestra el cartel cuando el stock total es mayor a 1", () => {
    renderCard({
      ...baseProduct,
      ProductVariants: [
        { id: "v1", color: "Negro", colorHex: "#000000", stock: 2, imageUrl: null },
      ],
    });

    expect(screen.queryByText("Última unidad")).not.toBeInTheDocument();
  });

  it("usa el logo local como placeholder cuando no hay imagen", () => {
    renderCard(baseProduct);

    const placeholder = screen.getByTestId("product-placeholder");
    expect(placeholder).toBeInTheDocument();
    expect(placeholder.querySelector("img")).toHaveAttribute(
      "src",
      "/logo_light_cropped.png",
    );
  });
});
