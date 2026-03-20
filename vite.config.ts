import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import {
  handleChallengeRequest,
  handleValidateFlagRequest,
  listScoreboard,
} from "./server/local-backend";

function json(response: { status: number; body: unknown }, res: import("node:http").ServerResponse) {
  res.statusCode = response.status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(response.body));
}

async function readJsonBody(req: import("node:http").IncomingMessage) {
  const chunks: Uint8Array[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }

  if (chunks.length === 0) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function ainjectionLocalApi(): Plugin {
  const register = (middlewares: {
    use: (route: string, handler: (req: import("node:http").IncomingMessage, res: import("node:http").ServerResponse, next: () => void) => void | Promise<void>) => void;
  }) => {
    middlewares.use("/api/ctf-challenge", async (req, res, next) => {
      if (req.method !== "POST") return next();

      try {
        const body = await readJsonBody(req);
        json(await handleChallengeRequest(body as { level: number; message: string }), res);
      } catch {
        json({ status: 400, body: { error: "Requisição inválida" } }, res);
      }
    });

    middlewares.use("/api/validate-flag", async (req, res, next) => {
      if (req.method !== "POST") return next();

      try {
        const body = await readJsonBody(req);
        json(
          handleValidateFlagRequest(
            body as { flag: string; level: number; player_name: string; solve_token: string },
          ),
          res,
        );
      } catch {
        json({ status: 400, body: { valid: false, error: "Requisição inválida" } }, res);
      }
    });

    middlewares.use("/api/scoreboard", (req, res, next) => {
      if (req.method !== "GET") return next();
      json(listScoreboard(), res);
    });
  };

  return {
    name: "ainjection-local-api",
    configureServer(server) {
      register(server.middlewares);
    },
    configurePreviewServer(server) {
      register(server.middlewares);
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 54322,
    allowedHosts: [".nip.io", "localhost"],
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), ainjectionLocalApi()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
