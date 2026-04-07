const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { URL } = require("node:url");
const { allowMethods, sendJson } = require("./_lib/http");

async function handler(req, res) {
  if (!allowMethods(req, res, ["GET"])) {
    return;
  }

  sendJson(res, 200, {
    ok: true,
    env: {
      hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
      hasSupabaseUrl: Boolean(process.env.SUPABASE_URL),
      hasSupabaseAnonKey: Boolean(process.env.SUPABASE_ANON_KEY),
      hasSessionSecret: Boolean(process.env.SESSION_SECRET)
    }
  });
}

function loadEnvFile(root, filename) {
  const filePath = path.join(root, filename);
  if (!fs.existsSync(filePath)) {
    return;
  }

  const content = fs.readFileSync(filePath, "utf8");
  content.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      return;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) {
      return;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    const value = rawValue.replace(/^['"]|['"]$/g, "");

    if (key && process.env[key] == null) {
      process.env[key] = value;
    }
  });
}

function loadEnv(root) {
  loadEnvFile(root, ".env");
  loadEnvFile(root, ".env.local");
}

function contentTypeFor(filePath) {
  const ext = path.extname(filePath);
  if (ext === ".html") {
    return "text/html; charset=utf-8";
  }
  if (ext === ".css") {
    return "text/css; charset=utf-8";
  }
  if (ext === ".js") {
    return "application/javascript; charset=utf-8";
  }
  if (ext === ".json") {
    return "application/json; charset=utf-8";
  }
  if (ext === ".svg") {
    return "image/svg+xml";
  }
  return "text/plain; charset=utf-8";
}

function serveStatic(root, res, pathname) {
  if (pathname === "/favicon.ico") {
    res.writeHead(204);
    res.end();
    return;
  }

  const filePath =
    pathname === "/"
      ? path.join(root, "index.html")
      : path.join(root, path.normalize(pathname).replace(/^(\.\.[/\\])+/, ""));

  if (!filePath.startsWith(root)) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Forbidden");
    return;
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    res.writeHead(200, {
      "Content-Type": contentTypeFor(filePath),
      "Cache-Control": "no-store"
    });
    res.end(fs.readFileSync(filePath));
    return;
  }

  const indexPath = path.join(root, "index.html");
  res.writeHead(200, {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(fs.readFileSync(indexPath));
}

function createLocalDevServer() {
  const root = path.join(__dirname, "..");
  const host = process.env.HOST || "127.0.0.1";
  const port = Number(process.env.PORT || 3000);

  loadEnv(root);

  const apiHandlerPaths = {
    "/api/register": path.join(__dirname, "register.js"),
    "/api/login": path.join(__dirname, "login.js"),
    "/api/logout": path.join(__dirname, "logout.js"),
    "/api/bootstrap": path.join(__dirname, "bootstrap.js"),
    "/api/save-state": path.join(__dirname, "save-state.js")
  };

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url || "/", `http://${req.headers.host || `${host}:${port}`}`);

    if (url.pathname === "/api/health") {
      await handler(req, res);
      return;
    }

    const handlerPath = apiHandlerPaths[url.pathname];
    if (handlerPath) {
      try {
        delete require.cache[require.resolve(handlerPath)];
        const apiHandler = require(handlerPath);
        await apiHandler(req, res);
      } catch (error) {
        res.writeHead(500, {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "no-store"
        });
        res.end(
          JSON.stringify({
            error: "server_error",
            detail: error.message
          })
        );
      }
      return;
    }

    serveStatic(root, res, url.pathname);
  });

  server.listen(port, host, () => {
    console.log(`IELTS Dashboard local dev server running at http://${host}:${port}`);
  });
}

if (require.main === module) {
  createLocalDevServer();
}

module.exports = handler;
