const { getSessionUserId } = require("./_lib/auth");
const { allowMethods, readJson, sendError, sendJson } = require("./_lib/http");
const { buildSnapshot, saveUserState } = require("./_lib/store");

module.exports = async function handler(req, res) {
  if (!allowMethods(req, res, ["POST"])) {
    return;
  }

  try {
    const userId = getSessionUserId(req);
    if (!userId) {
      sendError(res, 401, "unauthorized");
      return;
    }

    const body = await readJson(req);
    const currentUser = body.currentUser;
    if (!currentUser || currentUser.id !== userId) {
      sendError(res, 400, "invalid_user_payload");
      return;
    }

    await saveUserState(userId, currentUser, body.sharingRequests);
    const snapshot = await buildSnapshot(userId);
    sendJson(res, 200, snapshot);
  } catch (error) {
    if (error?.code === "email_exists") {
      sendError(res, 409, "email_exists");
      return;
    }
    if (error?.code === "user_not_found") {
      sendError(res, 404, "user_not_found");
      return;
    }
    if (error?.code === "server_misconfigured") {
      sendError(res, 500, "server_misconfigured");
      return;
    }
    sendError(res, 500, "server_error", error.message);
  }
};
