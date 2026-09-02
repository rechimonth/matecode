import { describe, it, expect, vi, beforeEach } from "vitest";

const firestoreGet = vi.fn();
const sesSend = vi.fn();
const verifyIdToken = vi.fn();

vi.mock("firebase-admin/app", () => ({
  cert: vi.fn((value: unknown) => value),
  getApp: vi.fn(() => ({})),
  getApps: vi.fn(() => [{ name: "[DEFAULT]" }]),
  initializeApp: vi.fn(() => ({})),
}));
vi.mock("firebase-admin/auth", () => ({
  getAuth: vi.fn(() => ({ verifyIdToken })),
}));
vi.mock("firebase-admin/firestore", () => ({
  getFirestore: vi.fn(() => ({ collection: vi.fn(() => ({ where: vi.fn(() => ({ get: firestoreGet })) })) })),
}));
vi.mock("@aws-sdk/client-ses", () => ({
  SESClient: vi.fn(() => ({ send: sesSend })),
  SendEmailCommand: vi.fn((input: unknown) => input),
}));

import handler, { escapeHtml, getBearerToken } from "../../api/send-summary";

const makeResponse = () => ({
  status: vi.fn().mockReturnThis(),
  json: vi.fn().mockReturnThis(),
  setHeader: vi.fn(),
  end: vi.fn(),
});

const makeRequest = (body: unknown, headers: Record<string, string> = {}, method = "POST") => ({
  method,
  headers: {
    authorization: "Bearer valid-token",
    origin: "http://localhost:5173",
    ...headers,
  },
  body,
  [Symbol.asyncIterator]: async function* () {},
});

describe("send-summary security", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ALLOWED_ORIGINS = "http://localhost:5173";
    process.env.SES_FROM_EMAIL = "sender@example.com";
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY = JSON.stringify({
      project_id: "project",
      client_email: "firebase-admin@example.com",
      private_key: "-----BEGIN PRIVATE KEY-----\\nkey\\n-----END PRIVATE KEY-----\\n",
    });
    verifyIdToken.mockResolvedValue({ uid: "verified-user", email: "verified@example.com" });
    firestoreGet.mockResolvedValue({ docs: [] });
    sesSend.mockResolvedValue({});
  });

  it("extracts only valid Bearer tokens", () => {
    expect(getBearerToken("Bearer abc123")).toBe("abc123");
    expect(getBearerToken("bearer abc123")).toBe("abc123");
    expect(getBearerToken("Basic abc123")).toBeNull();
    expect(getBearerToken("Bearer")).toBeNull();
  });

  it("escapes HTML-sensitive input", () => {
    expect(escapeHtml(`<script>alert(1)</script> & " onload='x'`)).toBe(
      "&lt;script&gt;alert(1)&lt;/script&gt; &amp; &quot; onload=&#39;x&#39;"
    );
  });

  it("returns 401 without an authorization token", async () => {
    const res = makeResponse();
    await handler(makeRequest({}, { authorization: "" }), res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("returns 401 for an invalid token", async () => {
    verifyIdToken.mockRejectedValue(new Error("invalid"));
    const res = makeResponse();
    await handler(makeRequest({}), res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("rejects accounts without a valid verified email", async () => {
    verifyIdToken.mockResolvedValue({ uid: "verified-user" });
    const res = makeResponse();
    await handler(makeRequest({}), res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("uses verified UID and ignores client identity fields", async () => {
    const res = makeResponse();
    await handler(makeRequest({ userId: "attacker", email: "attacker@example.com", name: "Test" }), res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("returns 400 for invalid JSON", async () => {
    const res = makeResponse();
    await handler(makeRequest("not-json"), res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 405 for unsupported methods", async () => {
    const res = makeResponse();
    await handler(makeRequest({}, {}, "GET"), res);
    expect(res.status).toHaveBeenCalledWith(405);
  });

  it("blocks disallowed origins", async () => {
    const res = makeResponse();
    await handler(makeRequest({}, { origin: "https://evil.example.com" }), res);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it("answers OPTIONS preflight", async () => {
    const res = makeResponse();
    await handler(makeRequest({}, {}, "OPTIONS"), res);
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.end).toHaveBeenCalled();
  });

  it("returns 500 when Firestore fails without exposing internal details", async () => {
    firestoreGet.mockRejectedValue(new Error("database-secret-detail"));
    const res = makeResponse();
    await handler(makeRequest({}), res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Failed to send email" });
    expect(JSON.stringify(res.json.mock.calls)).not.toContain("database-secret-detail");
  });

  it("enforces the local rate limit", async () => {
    for (let i = 0; i < 10; i += 1) {
      const res = makeResponse();
      await handler(makeRequest({ name: `Test ${i}` }), res);
    }
    const res = makeResponse();
    await handler(makeRequest({ name: "Over limit" }), res);
    expect(res.status).toHaveBeenCalledWith(429);
  });
});
