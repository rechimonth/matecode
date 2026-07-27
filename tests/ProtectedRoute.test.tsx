import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { ProtectedRoute } from "../src/routes/ProtectedRoute";

vi.mock("../src/features/auth/AuthContext", () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from "../src/features/auth/AuthContext";

const mockedUseAuth = useAuth as unknown as ReturnType<typeof vi.fn>;

describe("ProtectedRoute", () => {
  it("shows spinner when loading is true", () => {
    mockedUseAuth.mockReturnValue({ user: null, loading: true, error: null });

    render(
      <BrowserRouter>
        <ProtectedRoute>
          <div>Private Content</div>
        </ProtectedRoute>
      </BrowserRouter>
    );

    expect(screen.getByRole("status")).toBeTruthy();
  });

  it("redirects to login when user is null", () => {
    mockedUseAuth.mockReturnValue({ user: null, loading: false, error: null });

    render(
      <BrowserRouter>
        <ProtectedRoute>
          <div>Private Content</div>
        </ProtectedRoute>
      </BrowserRouter>
    );

    expect(screen.queryByText("Private Content")).toBeNull();
  });

  it("renders children when user is authenticated", () => {
    mockedUseAuth.mockReturnValue({ user: { uid: "1", email: "a@b.com" }, loading: false, error: null });

    render(
      <BrowserRouter>
        <ProtectedRoute>
          <div>Private Content</div>
        </ProtectedRoute>
      </BrowserRouter>
    );

    expect(screen.getByText("Private Content")).toBeTruthy();
  });
});
