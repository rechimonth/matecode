import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("firebase/auth", () => ({
  getAuth: vi.fn(() => ({})),
  GoogleAuthProvider: vi.fn(() => ({} as any)),
  signInWithEmailAndPassword: vi.fn(() => Promise.resolve({ user: { uid: "test-uid", email: "test@example.com" } })),
  createUserWithEmailAndPassword: vi.fn(() => Promise.resolve({ user: { uid: "test-uid", email: "test@example.com" } })),
  signInWithPopup: vi.fn(() => Promise.resolve({ user: { uid: "test-uid", email: "test@example.com" } })),
  signOut: vi.fn(() => Promise.resolve()),
}));

import * as firebaseAuth from "firebase/auth";
import {
  login,
  register,
  loginWithGoogle,
  logout,
} from "../../src/services/auth";

const mockedSignInWithEmailAndPassword = vi.mocked(firebaseAuth.signInWithEmailAndPassword) as unknown as ReturnType<typeof vi.fn>;
const mockedCreateUserWithEmailAndPassword = vi.mocked(firebaseAuth.createUserWithEmailAndPassword) as unknown as ReturnType<typeof vi.fn>;
const mockedSignInWithPopup = vi.mocked(firebaseAuth.signInWithPopup) as unknown as ReturnType<typeof vi.fn>;
const mockedSignOut = vi.mocked(firebaseAuth.signOut) as unknown as ReturnType<typeof vi.fn>;

describe("services/auth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("login calls signInWithEmailAndPassword", async () => {
    mockedSignInWithEmailAndPassword.mockResolvedValue({ user: { uid: "1", email: "a@b.com" } });

    await login("a@b.com", "123");

    expect(mockedSignInWithEmailAndPassword).toHaveBeenCalled();
  });

  it("register calls createUserWithEmailAndPassword", async () => {
    mockedCreateUserWithEmailAndPassword.mockResolvedValue({ user: { uid: "1", email: "a@b.com" } });

    await register("a@b.com", "123");

    expect(mockedCreateUserWithEmailAndPassword).toHaveBeenCalled();
  });

  it("loginWithGoogle calls signInWithPopup", async () => {
    mockedSignInWithPopup.mockResolvedValue({ user: { uid: "1", email: "a@b.com" } });

    await loginWithGoogle();

    expect(mockedSignInWithPopup).toHaveBeenCalled();
  });

  it("logout calls signOut", async () => {
    mockedSignOut.mockResolvedValue(undefined);

    await logout();

    expect(mockedSignOut).toHaveBeenCalled();
  });
});
