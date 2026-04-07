const { setSessionCookie } = require("./_lib/auth");
const { allowMethods, readJson, sendError, sendJson } = require("./_lib/http");
const { buildSnapshot, registerUser } = require("./_lib/store");

module.exports = async function handler(req, res) {
  if (!allowMethods(req, res, ["POST"])) {
    return;
  }

  try {
    const body = await readJson(req);
    const nickname = String(body.nickname || "").trim();
    const email = String(body.email || "").trim();
    const password = String(body.password || "");
    const planMode = body.planMode === "manual" ? "manual" : "system";

    if (!nickname || !email || !password) {
      sendError(res, 400, "missing_fields");
      return;
    }

    const userId = await registerUser({
      nickname,
      email,
      password,
      planMode,
    });

    setSessionCookie(req, res, userId);
    const snapshot = await buildSnapshot(userId);
    sendJson(res, 200, snapshot);
  } catch (error) {
    if (error?.code === "email_exists") {
      sendError(res, 409, "email_exists");
      return;
    }
    if (error?.code === "server_misconfigured") {
      sendError(res, 500, "server_misconfigured");
      return;
    }
    sendError(res, 500, "server_error", error.message);
  }
};
