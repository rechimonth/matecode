import React from "react";
import { render, screen, act, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ToastProvider } from "../../src/components/ui/Toast";

describe("LinkPasswordForm", () => {
  let mockUseAuth: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mockUseAuth = vi.fn();
    vi.doMock("../../src/features/auth/AuthContext", () => ({
      useAuth: mockUseAuth,
    }));
  });

  it("renders form fields and button", async () => {
    mockUseAuth.mockReturnValue({
      user: { uid: "1", email: "a@b.com", displayName: "A" },
      loading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      loginWithGoogle: vi.fn(),
      logout: vi.fn(),
      linkPassword: vi.fn(),
      clearError: vi.fn(),
    } as any);

    const { LinkPasswordForm } = await import("../../src/components/LinkPasswordForm");
    render(
      <ToastProvider>
        <LinkPasswordForm onCancel={() => {}} />
      </ToastProvider>
    );

    expect(screen.getByRole("heading", { name: /vincular contrasena/i })).toBeDefined();
    expect(screen.getByPlaceholderText("Minimo 6 caracteres")).toBeDefined();
    expect(screen.getByPlaceholderText("Repeti tu contrasena")).toBeDefined();
    expect(screen.getByRole("button", { name: /vincular contrasena/i })).toBeDefined();
  });

  it("shows validation error when passwords do not match", async () => {
    mockUseAuth.mockReturnValue({
      user: { uid: "1", email: "a@b.com", displayName: "A" },
      loading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      loginWithGoogle: vi.fn(),
      logout: vi.fn(),
      linkPassword: vi.fn(),
      clearError: vi.fn(),
    } as any);

    const { LinkPasswordForm } = await import("../../src/components/LinkPasswordForm");
    render(
      <ToastProvider>
        <LinkPasswordForm onCancel={() => {}} />
      </ToastProvider>
    );

    const passwordInput = screen.getByPlaceholderText("Minimo 6 caracteres");
    const confirmInput = screen.getByPlaceholderText("Repeti tu contrasena");

    await act(async () => {
      fireEvent.change(passwordInput, { target: { value: "123456" } });
      fireEvent.change(confirmInput, { target: { value: "654321" } });
    });

    await act(async () => {
      screen.getByRole("button", { name: /vincular contrasena/i }).click();
    });

    expect(screen.getByText("Las contrasenas no coinciden")).toBeDefined();
  });

  it("calls linkPassword and onCancel on successful submit", async () => {
    const linkPassword = vi.fn().mockResolvedValue(undefined);
    const onCancel = vi.fn();

    mockUseAuth.mockReturnValue({
      user: { uid: "1", email: "a@b.com", displayName: "A" },
      loading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      loginWithGoogle: vi.fn(),
      logout: vi.fn(),
      linkPassword,
      clearError: vi.fn(),
    } as any);

    const { LinkPasswordForm } = await import("../../src/components/LinkPasswordForm");
    render(
      <ToastProvider>
        <LinkPasswordForm onCancel={onCancel} />
      </ToastProvider>
    );

    const passwordInput = screen.getByPlaceholderText("Minimo 6 caracteres");
    const confirmInput = screen.getByPlaceholderText("Repeti tu contrasena");

    await act(async () => {
      fireEvent.change(passwordInput, { target: { value: "123456" } });
      fireEvent.change(confirmInput, { target: { value: "123456" } });
    });

    await act(async () => {
      screen.getByRole("button", { name: /vincular contrasena/i }).click();
    });

    expect(linkPassword).toHaveBeenCalled();
    expect(onCancel).toHaveBeenCalled();
  });
});
