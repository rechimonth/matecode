import React from "react";
import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";

const mockRegister = vi.fn();
const mockLoginWithGoogle = vi.fn();

vi.mock("../../src/features/auth/AuthContext", () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    error: null,
    login: vi.fn(),
    loginWithGoogle: mockLoginWithGoogle,
    register: mockRegister,
    logout: vi.fn(),
    clearError: vi.fn(),
  }),
}));

import { RegisterPage } from "../../src/pages/RegisterPage";

describe("RegisterPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRegister.mockClear();
    mockLoginWithGoogle.mockClear();
  });

  it("renders register form", () => {
    render(
      <BrowserRouter>
        <RegisterPage />
      </BrowserRouter>
    );

    expect(screen.getByRole("heading", { name: "Registrarse" })).toBeTruthy();
    const emailInput = document.querySelector('input[type="email"]');
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    expect(emailInput).toBeTruthy();
    expect(passwordInputs.length).toBe(2);
  });

  it("shows error when passwords do not match", async () => {
    render(
      <BrowserRouter>
        <RegisterPage />
      </BrowserRouter>
    );

    const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
    const passwordInputs = document.querySelectorAll('input[type="password"]') as NodeListOf<HTMLInputElement>;

    await userEvent.type(emailInput, "a@b.com");
    await userEvent.type(passwordInputs[0], "123");
    await userEvent.type(passwordInputs[1], "456");
    await userEvent.click(screen.getByRole("button", { name: "Registrarse" }));

    expect(await screen.findByText("Las contraseñas no coinciden")).toBeTruthy();
  });

  it("calls register on valid submit", async () => {
    render(
      <BrowserRouter>
        <RegisterPage />
      </BrowserRouter>
    );

    const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
    const passwordInputs = document.querySelectorAll('input[type="password"]') as NodeListOf<HTMLInputElement>;

    await userEvent.type(emailInput, "a@b.com");
    await userEvent.type(passwordInputs[0], "123");
    await userEvent.type(passwordInputs[1], "123");
    await userEvent.click(screen.getByRole("button", { name: "Registrarse" }));

    expect(mockRegister).toHaveBeenCalledWith("a@b.com", "123");
  });

  it("calls loginWithGoogle on google button click", async () => {
    render(
      <BrowserRouter>
        <RegisterPage />
      </BrowserRouter>
    );

    screen.getByText("Google").click();
    expect(mockLoginWithGoogle).toHaveBeenCalled();
  });
});
