const { setSessionCookie } = require("./_lib/auth");
const { allowMethods, readJson, sendError, sendJson } = require("./_lib/http");
const { authenticateUser, buildSnapshot } = require("./_lib/store");

module.exports = async function handler(req, res) {
  if (!allowMethods(req, res, ["POST"])) {
    return;
  }

  try {
    const body = await readJson(req);
    const email = String(body.email || "").trim();
    const password = String(body.password || "");

    if (!email || !password) {
      sendError(res, 400, "missing_fields");
      return;
    }

    const user = await authenticateUser({ email, password });
    if (!user) {
      sendError(res, 401, "invalid_credentials");
      return;
    }

    setSessionCookie(req, res, user.id);
    const snapshot = await buildSnapshot(user.id);
    sendJson(res, 200, snapshot);
  } catch (error) {
    if (error?.code === "server_misconfigured") {
      sendError(res, 500, "server_misconfigured");
      return;
    }
    sendError(res, 500, "server_error", error.message);
  }
};
