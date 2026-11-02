import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import StartupGate from "../StartupGate.jsx";

describe("StartupGate", () => {
  it("muestra mensajes de carga mientras espera al backend", () => {
    const healthCheck = vi.fn(() => new Promise(() => {}));
    const { unmount } = render(
      <StartupGate healthCheck={healthCheck}>
        <p>App lista</p>
      </StartupGate>,
    );

    expect(
      screen.getByText("Conectando con la tienda..."),
    ).toBeInTheDocument();
    expect(screen.getByText("Cargando productos...")).toBeInTheDocument();

    unmount();
  });

  it("muestra la app cuando el health check responde", async () => {
    const healthCheck = vi.fn().mockResolvedValue();

    render(
      <StartupGate healthCheck={healthCheck}>
        <p>App lista</p>
      </StartupGate>,
    );

    expect(await screen.findByText("App lista")).toBeInTheDocument();
  });

  it("muestra el error y permite reintentar", async () => {
    const healthCheck = vi
      .fn()
      .mockRejectedValueOnce(new Error("down"))
      .mockResolvedValueOnce();

    const user = userEvent.setup();

    render(
      <StartupGate healthCheck={healthCheck} timeoutMs={0}>
        <p>App lista</p>
      </StartupGate>,
    );

    expect(
      await screen.findByText("No pudimos conectar con el servidor"),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Reintentar" }));

    expect(await screen.findByText("App lista")).toBeInTheDocument();
  });

  it("permite continuar de todos modos si falla", async () => {
    const healthCheck = vi.fn().mockRejectedValue(new Error("down"));
    const user = userEvent.setup();

    render(
      <StartupGate healthCheck={healthCheck} timeoutMs={0}>
        <p>App lista</p>
      </StartupGate>,
    );

    expect(
      await screen.findByText("No pudimos conectar con el servidor"),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Continuar de todos modos" }),
    );

    expect(screen.getByText("App lista")).toBeInTheDocument();
  });
});
