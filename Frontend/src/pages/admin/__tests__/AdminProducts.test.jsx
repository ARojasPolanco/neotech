import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import AdminProducts from "../AdminProducts.jsx";
import api from "../../../config/api.js";

vi.mock("../../../config/api.js", () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

const initialProduct = {
  id: "p1",
  name: "Auriculares",
  description: "Bluetooth",
  price: 1000,
  isActive: true,
};

const searchedProduct = {
  id: "p2",
  name: "Mouse Gamer",
  description: "RGB",
  price: 2000,
  isActive: true,
};

describe("AdminProducts", () => {
  it("busca productos por nombre contra la API", async () => {
    const user = userEvent.setup();

    api.get
      .mockResolvedValueOnce({ data: [initialProduct] })
      .mockResolvedValueOnce({ data: [searchedProduct] });

    render(
      <MemoryRouter>
        <AdminProducts />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Auriculares")).toBeInTheDocument();
    expect(api.get).toHaveBeenCalledWith("/products", { params: {} });

    await user.type(
      screen.getByLabelText("Buscar productos por nombre"),
      "mouse",
    );

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith("/products", {
        params: { search: "mouse" },
      });
    });

    expect(await screen.findByText("Mouse Gamer")).toBeInTheDocument();
  });
});
