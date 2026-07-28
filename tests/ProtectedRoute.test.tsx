import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, createMemoryRouter, RouterProvider } from "react-router-dom";

vi.mock("../src/features/auth/AuthContext", () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from "../src/features/auth/AuthContext";
import { ProtectedRoute } from "../src/routes/ProtectedRoute";

const mockUseAuth = vi.mocked(useAuth) as ReturnType<typeof vi.fn>;

describe("ProtectedRoute", () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it("shows spinner when loading is true", () => {
    mockUseAuth.mockReturnValue({ user: null, loading: true, error: null });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Private Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(document.querySelector(".animate-spin")).toBeTruthy();
  });

  it("renders children when user is authenticated", () => {
    mockUseAuth.mockReturnValue({ user: { uid: "1", email: "a@b.com" }, loading: false, error: null });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Private Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText("Private Content")).toBeTruthy();
  });

  it("redirects to login when user is null", () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false, error: null });

    const router = createMemoryRouter([
      {
        path: "/",
        element: (
          <ProtectedRoute>
            <div>Private Content</div>
          </ProtectedRoute>
        ),
      },
      {
        path: "/login",
        element: <div>Login Page</div>,
      },
    ]);

    render(<RouterProvider router={router} />);

    expect(screen.queryByText("Private Content")).toBeNull();
    expect(screen.getByText("Login Page")).toBeTruthy();
  });
});
