const { getSessionUserId } = require("./_lib/auth");
const { allowMethods, sendError, sendJson } = require("./_lib/http");
const { buildSnapshot } = require("./_lib/store");

module.exports = async function handler(req, res) {
  if (!allowMethods(req, res, ["GET"])) {
    return;
  }

  try {
    const userId = getSessionUserId(req);
    const snapshot = await buildSnapshot(userId);
    sendJson(res, 200, snapshot);
  } catch (error) {
    if (error?.code === "server_misconfigured") {
      sendError(res, 500, "server_misconfigured");
      return;
    }
    sendError(res, 500, "server_error", error.message);
  }
};
