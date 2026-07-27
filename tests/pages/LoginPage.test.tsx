import React from "react";
import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";

const mockLogin = vi.fn();
const mockLoginWithGoogle = vi.fn();

vi.mock("../../src/features/auth/AuthContext", () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    error: null,
    login: mockLogin,
    loginWithGoogle: mockLoginWithGoogle,
    register: vi.fn(),
    logout: vi.fn(),
    clearError: vi.fn(),
  }),
}));

import { LoginPage } from "../../src/pages/LoginPage";

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLogin.mockClear();
    mockLoginWithGoogle.mockClear();
  });

  it("renders login form", () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    expect(screen.getByText("Iniciar Sesión")).toBeTruthy();
    const emailInput = document.querySelector('input[type="email"]');
    const passwordInput = document.querySelector('input[type="password"]');
    expect(emailInput).toBeTruthy();
    expect(passwordInput).toBeTruthy();
  });

  it("shows error on empty submit", async () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    act(() => {
      screen.getByText("Entrar").click();
    });
    expect(await screen.findByText("Email y contraseña son requeridos")).toBeTruthy();
  });

  it("calls login on valid submit", async () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
    const passwordInput = document.querySelector('input[type="password"]') as HTMLInputElement;

    await userEvent.type(emailInput, "a@b.com");
    await userEvent.type(passwordInput, "123");
    await userEvent.click(screen.getByText("Entrar"));

    expect(mockLogin).toHaveBeenCalledWith("a@b.com", "123");
  });

  it("calls loginWithGoogle on google button click", async () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    act(() => {
      screen.getByText("Google").click();
    });
    expect(mockLoginWithGoogle).toHaveBeenCalled();
  });
});
