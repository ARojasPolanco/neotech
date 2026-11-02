import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ColorSelector from "../ColorSelector.jsx";

const product = {
  color: "Azul",
  colorHex: "#1e40af",
  imageUrl: null,
};

describe("ColorSelector", () => {
  it("muestra el color base cuando el producto no tiene variantes", () => {
    render(
      <ColorSelector
        product={product}
        variants={[]}
        selected={null}
        onSelect={() => {}}
        onDeselect={() => {}}
      />,
    );

    expect(screen.getByText(/Color:/)).toBeInTheDocument();
    expect(screen.getAllByText("Azul").length).toBeGreaterThan(0);
  });

  it("no renderiza nada si no hay variantes ni color base", () => {
    const { container } = render(
      <ColorSelector
        product={{}}
        variants={[]}
        selected={null}
        onSelect={() => {}}
        onDeselect={() => {}}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
