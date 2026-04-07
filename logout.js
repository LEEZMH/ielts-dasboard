const { clearSessionCookie } = require("./_lib/auth");
const { allowMethods, sendJson } = require("./_lib/http");

module.exports = async function handler(req, res) {
  if (!allowMethods(req, res, ["POST"])) {
    return;
  }

  clearSessionCookie(req, res);
  sendJson(res, 200, {
    currentUserId: null,
    users: [],
    sharingRequests: [],
  });
};
