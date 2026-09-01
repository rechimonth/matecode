import { describe, it, expect, vi, beforeEach } from "vitest";

const { verifyIdToken, firestoreGet, where, collection, sesSend } = vi.hoisted(() => ({
  verifyIdToken: vi.fn(),
  firestoreGet: vi.fn(),
  where: vi.fn(),
  collection: vi.fn(),
  sesSend: vi.fn().mockResolvedValue({}),
}));

vi.mock("@aws-sdk/client-ses", () => ({
  SESClient: vi.fn().mockImplementation(() => ({ send: sesSend })),
  SendEmailCommand: vi.fn().mockImplementation((input) => input),
}));

vi.mock("firebase-admin/app", () => ({
  getApps: vi.fn(() => []),
  getApp: vi.fn(),
  initializeApp: vi.fn(() => ({})),
  cert: vi.fn((serviceAccount) => serviceAccount),
}));

vi.mock("firebase-admin/auth", () => ({
  getAuth: vi.fn(() => ({ verifyIdToken })),
}));

vi.mock("firebase-admin/firestore", () => ({
  getFirestore: vi.fn(() => ({ collection })),
}));

import handler, { escapeHtml, getBearerToken } from "../../api/send-summary";

const makeResponse = () => {
  const response = {
    status: vi.fn(),
    json: vi.fn(),
    setHeader: vi.fn(),
    end: vi.fn(),
  };
  response.status.mockReturnValue(response);
  response.json.mockReturnValue(response);
  response.setHeader.mockReturnValue(response);
  return response;
};

const makeRequest = (body: unknown, headers: Record<string, string> = {}, method = "POST") => ({
  method,
  headers,
  body,
});

describe("send-summary security", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY = JSON.stringify({
      project_id: "test-project",
      client_email: "firebase@test-project.iam.gserviceaccount.com",
      private_key: "-----BEGIN PRIVATE KEY-----\\nTEST\\n-----END PRIVATE KEY-----\\n",
    });
    process.env.SES_FROM_EMAIL = "noreply@example.com";
    process.env.ALLOWED_ORIGINS = "http://localhost:5173";
    where.mockReturnValue({ get: firestoreGet });
    collection.mockReturnValue({ where });
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
    expect(escapeHtml(`<script>alert(1)</script> & \" onload='x'`)).toBe(
      "&lt;script&gt;alert(1)&lt;/script&gt; &amp; &quot; onload=&#39;x&#39;"
    );
  });

  it("returns 401 without an authorization token", async () => {
    const res = makeResponse();
    await handler(makeRequest({}, { origin: "http://localhost:5173" }), res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Authentication required" });
    expect(verifyIdToken).not.toHaveBeenCalled();
  });

  it("returns 401 when the Firebase token is invalid", async () => {
    verifyIdToken.mockRejectedValue(new Error("invalid token"));
    const res = makeResponse();
    await handler(makeRequest({}, { origin: "http://localhost:5173", authorization: "Bearer invalid" }), res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid or expired authentication token" });
  });

  it("returns 400 when the verified account has no valid email", async () => {
    verifyIdToken.mockResolvedValue({ uid: "verified-user" });
    const res = makeResponse();
    await handler(makeRequest({}, { origin: "http://localhost:5173", authorization: "Bearer valid" }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Authenticated account has no valid email" });
  });

  it("uses verified UID instead of body.userId and ignores client email", async () => {
    verifyIdToken.mockResolvedValue({ uid: "verified-user", email: "user@example.com" });
    const res = makeResponse();
    await handler(makeRequest({ userId: "attacker-user", email: "attacker@example.com", name: "<img>" }, {
      origin: "http://localhost:5173",
      authorization: "Bearer valid",
      "x-forwarded-for": "127.0.0.10",
    }), res);

    expect(where).toHaveBeenCalledWith("userId", "==", "verified-user");
    expect(where).not.toHaveBeenCalledWith("userId", "==", "attacker-user");
    expect(sesSend).toHaveBeenCalledWith(expect.objectContaining({
      Destination: { ToAddresses: ["user@example.com"] },
      Message: expect.objectContaining({
        Body: expect.objectContaining({ Html: expect.objectContaining({ Data: expect.not.stringContaining("<img>") }) }),
      }),
    }));
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("returns 400 for invalid JSON", async () => {
    verifyIdToken.mockResolvedValue({ uid: "verified-user", email: "user@example.com" });
    const res = makeResponse();
    await handler(makeRequest("{bad", { origin: "http://localhost:5173", authorization: "Bearer valid" }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid JSON" });
  });

  it("returns 405 for unsupported methods", async () => {
    const res = makeResponse();
    await handler(makeRequest({}, { origin: "http://localhost:5173" }, "GET"), res);
    expect(res.status).toHaveBeenCalledWith(405);
  });

  it("rejects disallowed origins", async () => {
    const res = makeResponse();
    await handler(makeRequest({}, { origin: "https://evil.example" }), res);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(verifyIdToken).not.toHaveBeenCalled();
  });

  it("handles browser preflight", async () => {
    const res = makeResponse();
    await handler(makeRequest({}, { origin: "http://localhost:5173" }, "OPTIONS"), res);
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.end).toHaveBeenCalled();
    expect(res.setHeader).toHaveBeenCalledWith("Access-Control-Allow-Headers", "Authorization, Content-Type");
  });

  it("returns 500 when Firestore fails without exposing internal details", async () => {
    verifyIdToken.mockResolvedValue({ uid: "verified-user", email: "user@example.com" });
    firestoreGet.mockRejectedValue(new Error("database-secret-detail"));
    const res = makeResponse();
    await handler(makeRequest({}, { origin: "http://localhost:5173", authorization: "Bearer valid", "x-forwarded-for": "127.0.0.11" }), res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Failed to fetch tasks" });
  });

  it("enforces the local IP rate limit", async () => {
    const responses = Array.from({ length: 11 }, makeResponse);
    for (const res of responses) {
      await handler(makeRequest({}, { origin: "http://localhost:5173", "x-forwarded-for": "127.0.0.12" }), res);
    }
    expect(responses[9].status).toHaveBeenCalledWith(401);
    expect(responses[10].status).toHaveBeenCalledWith(429);
  });
});
