const crypto = require("node:crypto");
const bcrypt = require("bcryptjs");
const { parseCookies } = require("./http");

const SESSION_COOKIE = "ielts_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizePassword(value) {
  return String(value || "").replace(/\u00A0/g, " ").trim();
}

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    const error = new Error("Session secret is missing.");
    error.code = "server_misconfigured";
    throw error;
  }
  return secret;
}

function encodeBase64Url(value) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function decodeBase64Url(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  return Buffer.from(`${normalized}${padding}`, "base64").toString("utf8");
}

function signTokenPayload(payload) {
  return crypto.createHmac("sha256", getSessionSecret()).update(payload).digest("hex");
}

function safeCompare(left, right) {
  const leftBuffer = Buffer.from(String(left || ""));
  const rightBuffer = Buffer.from(String(right || ""));
  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }
  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function createSessionToken(userId) {
  const payload = encodeBase64Url(
    JSON.stringify({
      userId,
      exp: Date.now() + SESSION_TTL_SECONDS * 1000,
    })
  );
  const signature = signTokenPayload(payload);
  return `${payload}.${signature}`;
}

function verifySessionToken(token) {
  if (!token) {
    return null;
  }

  const [payload, signature] = String(token).split(".");
  if (!payload || !signature) {
    return null;
  }

  const expected = signTokenPayload(payload);
  if (!safeCompare(signature, expected)) {
    return null;
  }

  try {
    const decoded = JSON.parse(decodeBase64Url(payload));
    if (!decoded.userId || !decoded.exp || decoded.exp < Date.now()) {
      return null;
    }
    return decoded.userId;
  } catch (error) {
    return null;
  }
}

function isSecureRequest(req) {
  return req.headers["x-forwarded-proto"] === "https";
}

function setSessionCookie(req, res, userId) {
  const token = createSessionToken(userId);
  const parts = [
    `${SESSION_COOKIE}=${encodeURIComponent(token)}`,
    `Max-Age=${SESSION_TTL_SECONDS}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
  ];
  if (isSecureRequest(req)) {
    parts.push("Secure");
  }
  res.setHeader("Set-Cookie", parts.join("; "));
}

function clearSessionCookie(req, res) {
  const parts = [
    `${SESSION_COOKIE}=`,
    "Max-Age=0",
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
  ];
  if (isSecureRequest(req)) {
    parts.push("Secure");
  }
  res.setHeader("Set-Cookie", parts.join("; "));
}

function getSessionUserId(req) {
  const cookies = parseCookies(req);
  return verifySessionToken(cookies[SESSION_COOKIE]);
}

async function hashPassword(password) {
  return bcrypt.hash(normalizePassword(password), 12);
}

async function verifyPassword(password, passwordHash) {
  return bcrypt.compare(normalizePassword(password), String(passwordHash || ""));
}

module.exports = {
  clearSessionCookie,
  getSessionUserId,
  hashPassword,
  normalizeEmail,
  normalizePassword,
  setSessionCookie,
  verifyPassword,
};
