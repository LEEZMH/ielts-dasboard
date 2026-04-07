function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(payload));
}

function sendError(res, statusCode, code, detail = "") {
  sendJson(res, statusCode, { error: code, detail });
}

function parseCookies(req) {
  const raw = req.headers.cookie || "";
  return raw.split(";").reduce((acc, part) => {
    const [key, ...rest] = part.trim().split("=");
    if (!key) {
      return acc;
    }
    acc[key] = decodeURIComponent(rest.join("="));
    return acc;
  }, {});
}

async function readJson(req) {
  if (req.body && typeof req.body === "object") {
    return req.body;
  }

  if (typeof req.body === "string") {
    if (!req.body) {
      return {};
    }
    return JSON.parse(req.body);
  }

  let raw = "";
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 1024 * 1024) {
      const error = new Error("Payload too large");
      error.code = "payload_too_large";
      throw error;
    }
  }

  if (!raw) {
    return {};
  }

  return JSON.parse(raw);
}

function allowMethods(req, res, methods) {
  if (methods.includes(req.method || "GET")) {
    return true;
  }
  res.setHeader("Allow", methods.join(", "));
  sendError(res, 405, "method_not_allowed");
  return false;
}

module.exports = {
  allowMethods,
  parseCookies,
  readJson,
  sendError,
  sendJson,
};
