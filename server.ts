import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;
  app.use(express.json());

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      root: pathToFileURL(process.cwd()).href,
      configFile: pathToFileURL(path.resolve(process.cwd(), 'vite.config.ts')).href,
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (e, r) => r.sendFile(path.join(__dirname, "dist", "index.html")));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running - http://localhost:${PORT}`);
  });
}
startServer();
