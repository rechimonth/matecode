import React from "react";
import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ToastProvider } from "../../src/components/ui/Toast";

describe("Header", () => {
  let mockUseAuth: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mockUseAuth = vi.fn();
    vi.doMock("../../src/features/auth/AuthContext", () => ({
      useAuth: mockUseAuth,
    }));
  });

  it("renders username", async () => {
    mockUseAuth.mockReturnValue({
      user: { uid: "1", email: "a@b.com", displayName: "Alice" },
      loading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      loginWithGoogle: vi.fn(),
      logout: vi.fn(),
      clearError: vi.fn(),
    } as any);

    const { Header } = await import("../../src/components/Header");
    render(
      <ToastProvider>
        <Header />
      </ToastProvider>
    );

    expect(screen.getByText("Alice")).toBeTruthy();
  });

  it("renders email when displayName is missing", async () => {
    mockUseAuth.mockReturnValue({
      user: { uid: "1", email: "a@b.com", displayName: null },
      loading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      loginWithGoogle: vi.fn(),
      logout: vi.fn(),
      clearError: vi.fn(),
    } as any);

    const { Header } = await import("../../src/components/Header");
    render(
      <ToastProvider>
        <Header />
      </ToastProvider>
    );

    expect(screen.getByText("a@b.com")).toBeTruthy();
  });

  it("calls logout on button click", async () => {
    const logout = vi.fn();
    mockUseAuth.mockReturnValue({
      user: { uid: "1", email: "a@b.com", displayName: "Alice" },
      loading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      loginWithGoogle: vi.fn(),
      logout,
      clearError: vi.fn(),
    } as any);

    const { Header } = await import("../../src/components/Header");
    render(
      <ToastProvider>
        <Header />
      </ToastProvider>
    );

    const button = screen.getByRole("button", { name: /cerrar/i });
    act(() => {
      button.click();
    });
    expect(logout).toHaveBeenCalled();
  });
});
