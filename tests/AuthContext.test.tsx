import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";

vi.mock("firebase/auth", () => ({
  getAuth: vi.fn(() => ({})),
  GoogleAuthProvider: vi.fn(() => ({} as any)),
  onAuthStateChanged: vi.fn((_auth: unknown, cb: (user: unknown) => void) => {
    cb(null);
    return () => {};
  }),
  signInWithEmailAndPassword: vi.fn(() => Promise.resolve({ user: { uid: "test-uid", email: "test@example.com" } })),
  createUserWithEmailAndPassword: vi.fn(() => Promise.resolve({ user: { uid: "test-uid", email: "test@example.com" } })),
  signInWithPopup: vi.fn(() => Promise.resolve({ user: { uid: "test-uid", email: "test@example.com" } })),
  signOut: vi.fn(() => Promise.resolve()),
}));

import * as firebaseAuth from "firebase/auth";
import { AuthProvider, useAuth } from "../src/features/auth/AuthContext";

const mockedOnAuthStateChanged = vi.mocked(firebaseAuth.onAuthStateChanged) as unknown as ReturnType<typeof vi.fn>;
const mockedLogin = vi.mocked(firebaseAuth.signInWithEmailAndPassword) as unknown as ReturnType<typeof vi.fn>;
const mockedRegister = vi.mocked(firebaseAuth.createUserWithEmailAndPassword) as unknown as ReturnType<typeof vi.fn>;
const mockedLoginWithGoogle = vi.mocked(firebaseAuth.signInWithPopup) as unknown as ReturnType<typeof vi.fn>;
const mockedLogout = vi.mocked(firebaseAuth.signOut) as unknown as ReturnType<typeof vi.fn>;

const TestConsumer = () => {
  const auth = useAuth();
  return (
    <div>
      <span data-testid="loading">{auth.loading ? "loading" : "ready"}</span>
      <span data-testid="user">{auth.user?.email || "no-user"}</span>
      <span data-testid="error">{auth.error || "no-error"}</span>
      <button onClick={() => auth.login("a@b.com", "123")}>login</button>
      <button onClick={() => auth.register("a@b.com", "123")}>register</button>
      <button onClick={auth.loginWithGoogle}>google</button>
      <button onClick={auth.logout}>logout</button>
      <button onClick={auth.clearError}>clear</button>
    </div>
  );
};

describe("AuthContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("starts loading and becomes ready after onAuthStateChanged", async () => {
    let resolveAuth: (user: { email: string } | null) => void;
    mockedOnAuthStateChanged.mockImplementation((_auth: unknown, cb: (user: { email: string } | null) => void) => {
      resolveAuth = cb;
      return () => {};
    });

    render(<AuthProvider><TestConsumer /></AuthProvider>);

    expect(screen.getByTestId("loading").textContent).toBe("loading");

    await act(async () => {
      resolveAuth!(null);
    });

    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("ready"));
  });

  it("login success", async () => {
    mockedLogin.mockResolvedValue({ user: { uid: "1", email: "a@b.com" } });
    mockedOnAuthStateChanged.mockImplementation((_auth: unknown, cb: (user: { email: string } | null) => void) => {
      cb(null);
      return () => {};
    });

    render(<AuthProvider><TestConsumer /></AuthProvider>);

    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("ready"));
    await act(async () => screen.getByText("login").click());
    expect(mockedLogin).toHaveBeenCalled();
  });

  it("login error sets error message", async () => {
    mockedLogin.mockRejectedValue(new Error("bad-cred"));
    mockedOnAuthStateChanged.mockImplementation((_auth: unknown, cb: (user: { email: string } | null) => void) => {
      cb(null);
      return () => {};
    });

    render(<AuthProvider><TestConsumer /></AuthProvider>);

    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("ready"));
    await act(async () => screen.getByText("login").click());
    expect(screen.getByTestId("error").textContent).toBe("bad-cred");
  });

  it("register success", async () => {
    mockedRegister.mockResolvedValue({ user: { uid: "1", email: "a@b.com" } });
    mockedOnAuthStateChanged.mockImplementation((_auth: unknown, cb: (user: { email: string } | null) => void) => {
      cb(null);
      return () => {};
    });

    render(<AuthProvider><TestConsumer /></AuthProvider>);

    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("ready"));
    await act(async () => screen.getByText("register").click());
    expect(mockedRegister).toHaveBeenCalled();
  });

  it("register error sets error message", async () => {
    mockedRegister.mockRejectedValue(new Error("email-in-use"));
    mockedOnAuthStateChanged.mockImplementation((_auth: unknown, cb: (user: { email: string } | null) => void) => {
      cb(null);
      return () => {};
    });

    render(<AuthProvider><TestConsumer /></AuthProvider>);

    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("ready"));
    await act(async () => screen.getByText("register").click());
    expect(screen.getByTestId("error").textContent).toBe("email-in-use");
  });

  it("google login success", async () => {
    mockedLoginWithGoogle.mockResolvedValue({ user: { uid: "1", email: "a@b.com" } });
    mockedOnAuthStateChanged.mockImplementation((_auth: unknown, cb: (user: { email: string } | null) => void) => {
      cb(null);
      return () => {};
    });

    render(<AuthProvider><TestConsumer /></AuthProvider>);

    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("ready"));
    await act(async () => screen.getByText("google").click());
    expect(mockedLoginWithGoogle).toHaveBeenCalled();
  });

  it("google login error sets error message", async () => {
    mockedLoginWithGoogle.mockRejectedValue(new Error("google-error"));
    mockedOnAuthStateChanged.mockImplementation((_auth: unknown, cb: (user: { email: string } | null) => void) => {
      cb(null);
      return () => {};
    });

    render(<AuthProvider><TestConsumer /></AuthProvider>);

    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("ready"));
    await act(async () => screen.getByText("google").click());
    expect(screen.getByTestId("error").textContent).toBe("google-error");
  });

  it("logout success", async () => {
    mockedLogout.mockResolvedValue(undefined);
    mockedOnAuthStateChanged.mockImplementation((_auth: unknown, cb: (user: { email: string } | null) => void) => {
      cb(null);
      return () => {};
    });

    render(<AuthProvider><TestConsumer /></AuthProvider>);

    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("ready"));
    await act(async () => screen.getByText("logout").click());
    expect(mockedLogout).toHaveBeenCalled();
  });

  it("logout error sets error message", async () => {
    mockedLogout.mockRejectedValue(new Error("logout-fail"));
    mockedOnAuthStateChanged.mockImplementation((_auth: unknown, cb: (user: { email: string } | null) => void) => {
      cb(null);
      return () => {};
    });

    render(<AuthProvider><TestConsumer /></AuthProvider>);

    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("ready"));
    await act(async () => screen.getByText("logout").click());
    expect(screen.getByTestId("error").textContent).toBe("logout-fail");
  });

  it("clearError clears error", async () => {
    mockedLogin.mockRejectedValue(new Error("bad-cred"));
    mockedOnAuthStateChanged.mockImplementation((_auth: unknown, cb: (user: { email: string } | null) => void) => {
      cb(null);
      return () => {};
    });

    render(<AuthProvider><TestConsumer /></AuthProvider>);

    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("ready"));
    await act(async () => screen.getByText("login").click());
    expect(screen.getByTestId("error").textContent).toBe("bad-cred");
    await act(async () => screen.getByText("clear").click());
    expect(screen.getByTestId("error").textContent).toBe("no-error");
  });
});
