import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import BackgroundVideo from "../BackgroundVideo.jsx";

function mockReducedMotion(reduced) {
  window.matchMedia = vi.fn().mockImplementation((query) => ({
    matches: query.includes("prefers-reduced-motion") ? reduced : false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

describe("BackgroundVideo", () => {
  it("no renderiza si está deshabilitado o sin URL", () => {
    const { container } = render(
      <BackgroundVideo enabled={false} src="/demo/video.mp4" />,
    );
    expect(container).toBeEmptyDOMElement();

    const { container: empty } = render(
      <BackgroundVideo enabled src={null} />,
    );
    expect(empty).toBeEmptyDOMElement();
  });

  it("renderiza el video muteado, en loop y con autoplay", () => {
    mockReducedMotion(false);
    render(<BackgroundVideo enabled src="/demo/video.mp4" />);

    const video = screen.getByTestId("background-video");
    expect(video).toHaveAttribute("src", "/demo/video.mp4");
    expect(video).toHaveAttribute("loop");
    expect(video.muted).toBe(true);
    expect(video.autoplay).toBe(true);
    expect(video.controls).toBe(false);
  });

  it("respeta prefers-reduced-motion", async () => {
    mockReducedMotion(true);
    render(<BackgroundVideo enabled src="/demo/video.mp4" />);

    const video = screen.getByTestId("background-video");
    await waitFor(() => {
      expect(video.controls).toBe(true);
    });
    expect(video.autoplay).toBe(false);
  });
});
