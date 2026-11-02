import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import OrderItemsSummary from "../OrderItemsSummary.jsx";

const item = {
  id: "item-1",
  productName: "Auriculares Bluetooth",
  color: "Negro",
  quantity: 2,
  subtotal: 1600,
  imageUrl: "https://example.com/auriculares.png",
};

describe("OrderItemsSummary", () => {
  it("muestra imagen, color, cantidad, subtotal y total", () => {
    render(<OrderItemsSummary items={[item]} total={1600} />);

    expect(screen.getByAltText("Auriculares Bluetooth")).toHaveAttribute(
      "src",
      "https://example.com/auriculares.png",
    );
    expect(screen.getByText(/Negro/)).toBeInTheDocument();
    expect(screen.getAllByText("$1.600").length).toBeGreaterThan(0);
  });

  it("usa el logo como fallback cuando el item no tiene imagen", () => {
    render(
      <OrderItemsSummary items={[{ ...item, imageUrl: null }]} total={1600} />,
    );

    expect(screen.getByTestId("product-placeholder")).toBeInTheDocument();
  });

  it("muestra subtotal, descuento y total final", () => {
    render(
      <OrderItemsSummary
        items={[item]}
        total={1440}
        subtotal={1600}
        discountCode="NEO-TEST"
        discountPercent={10}
        discountAmount={160}
      />,
    );

    expect(screen.getByText(/NEO-TEST/)).toBeInTheDocument();
    expect(screen.getByText("-$160")).toBeInTheDocument();
    expect(screen.getByText("$1.440")).toBeInTheDocument();
  });
});
