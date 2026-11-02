import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import AdminSettings from "../AdminSettings.jsx";
import api from "../../../config/api.js";

vi.mock("../../../config/api.js", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

const settings = {
  videoUrl: "https://example.com/video.mp4",
  videoEnabled: true,
  logoUrl: null,
};

describe("AdminSettings", () => {
  it("carga el video y permite deshabilitarlo", async () => {
    api.get.mockResolvedValueOnce({ data: settings });
    api.patch.mockResolvedValueOnce({
      data: { ...settings, videoEnabled: false },
    });

    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <AdminSettings />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Video de fondo")).toBeInTheDocument();

    const toggle = screen.getByLabelText("Video habilitado");
    expect(toggle).toBeChecked();

    await user.click(toggle);

    await waitFor(() => {
      expect(api.patch).toHaveBeenCalledWith("/admin/settings", {
        videoEnabled: false,
      });
    });
  });
});
