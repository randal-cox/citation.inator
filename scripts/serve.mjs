import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { compileCitations, parseDirectives } from "../src/compiler.mjs";
import { createCrossrefResolver } from "../src/crossref.mjs";
import { identifierKey, makeCache, normalizeIdentifier, readCache } from "../src/records.mjs";

const root = new URL("../", import.meta.url);
const seedCache = readCache(JSON.parse(await readFile(new URL("dist/citations.json", root), "utf8")));
const cacheDirectory = process.env.CITATION_CACHE_DIR
  ? pathToFileURL(resolve(process.env.CITATION_CACHE_DIR) + "/")
  : new URL(".citation-cache/", root);
const filename = key => new URL(createHash("sha256").update(key).digest("hex") + ".json", cacheDirectory);
const store = {
  async get(key) {
    try {
      return JSON.parse(await readFile(filename(key), "utf8"));
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  },
  async set(key, value) {
    await mkdir(cacheDirectory, { recursive: true, mode: 0o700 });
    const temporary = new URL(randomUUID() + ".tmp", cacheDirectory);
    try {
      await writeFile(temporary, JSON.stringify(value, null, 2) + "\n", { mode: 0o600, flag: "wx" });
      await rename(temporary, filename(key));
    } finally {
      await rm(temporary, { force: true });
    }
  }
};
const live = createCrossrefResolver({ store, mailto: process.env.CROSSREF_MAILTO || "" });
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

function fromInput(input) {
  const value = input.trim();
  if (!value.startsWith("{")) return normalizeIdentifier(value);
  const tokens = parseDirectives(value);
  if (tokens.length !== 1 || tokens[0].type !== "citation" || tokens[0].items.length !== 1) return null;
  return tokens[0].items[0].identifier;
}

async function resolution(url) {
  const input = url.searchParams.get("identifier") || "";
  const mode = url.searchParams.get("mode") || "live";
  const identifier = input.length <= 2048 && fromInput(input);
  if (!identifier || !["live", "offline", "partial", "slow"].includes(mode)) {
    return { mode, state: "error", message: "Enter a valid identifier or a single citation directive.", record: null, ageSeconds: null };
  }
  const key = identifierKey(identifier);
  const seed = identifier.scheme === "local" ? seedCache.byId.get(identifier.value) : seedCache.byIdentifier.get(key);
  let data;
  if (mode === "live") {
    if (identifier.scheme === "local" && seed) {
      data = { record: seed, state: "cached", message: "Showing a curated local record.", freshness: "unknown", ageSeconds: null };
    } else data = await live.resolve(key, { seed, force: url.searchParams.get("force") === "true" });
  } else if (mode === "slow") {
    await delay(2200);
    data = { state: seed ? "cached" : "unresolved", record: seed ?? null, message: seed ? "Slow response finished. Showing editorial metadata." : "This identifier has no editorial cache entry.", freshness: "unknown", ageSeconds: null };
  } else if (identifier.scheme !== "doi") {
    data = { record: seed ?? null, state: "error", message: "Choose a DOI to simulate a Crossref refresh.", freshness: "unknown", ageSeconds: null };
  } else {
    const simulatedTime = Math.max(Date.now(), (Date.parse(seed?.retrievedAt) || 0) + 48 * 60 * 60 * 1000);
    const simulated = createCrossrefResolver({
      now: () => simulatedTime,
      fetch: async () => mode === "offline"
        ? new Response("Synthetic provider outage", { status: 503 })
        : Response.json({ message: { DOI: identifier.value, title: [seed?.title || "Synthetic partial DOI record"] } })
    });
    data = await simulated.resolve(key, { seed, force: true });
    if (data.attempt) data.attempt = { ...data.attempt, simulated: true };
    if (mode === "partial" && !seed) {
      // This example title is synthetic. Keep it out of the reader's evidence.
      data = { ...data, record: null, message: "Crossref supplied partial metadata in the simulation. No editorial record is cached.", freshness: "unknown", ageSeconds: null };
    }
  }
  if (data.record && !data.record.abstract && seed?.abstract) {
    data.record = { ...data.record, abstract: seed.abstract };
  }
  const use = identifier.scheme === "local" ? identifier.value : key;
  const escaped = use.replace(/[\\{};|"]/g, "\\$&");
  const compiled = compileCitations(`Inspect the current citation {citation ${escaped}}.\n\n{citation evidence} · {citation credit}\n\n{citation endnote}`, makeCache(data.record ? [data.record] : []), { namespace: "live" });
  return { ...data, mode, ...compiled };
}

const types = new Map([
  [".html", "text/html; charset=utf-8"], [".css", "text/css; charset=utf-8"], [".mjs", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"], [".md", "text/plain; charset=utf-8"], [".txt", "text/plain; charset=utf-8"]
]);
const csp = "default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'";
const files = /^\/(?:dist|demos\/(?:static|dynamic|christopher-drop-in))\/[\w.-]+\.(html|css|mjs|json|md|txt)$/;
const directories = /^\/demos\/(?:static|dynamic|christopher-drop-in)\/?$/;
const server = createServer(async (request, response) => {
  const send = (status, type, content) => {
    response.writeHead(status, { "Content-Type": type, "Content-Security-Policy": csp, "X-Content-Type-Options": "nosniff", "Referrer-Policy": "no-referrer", "Cache-Control": "no-store" });
    response.end(content);
  };
  const plain = types.get(".txt");
  try {
    const origin = `http://127.0.0.1:${server.address().port}`;
    if (![`127.0.0.1:${server.address().port}`, `localhost:${server.address().port}`].includes(request.headers.host)) return send(400, plain, "Use the loopback demo address.");
    if (request.method !== "GET") return send(405, plain, "GET only.");
    const url = new URL(request.url, origin);
    if (url.pathname === "/") {
      response.writeHead(302, { Location: "/demos/static/" }).end();
      return;
    }
    if (url.pathname === "/demos/dynamic/resolve") {
      if (request.headers["sec-fetch-site"] && !["same-origin", "none"].includes(request.headers["sec-fetch-site"])) {
        return send(403, plain, "Use the resolution form on this demo.");
      }
      const result = await resolution(url);
      return send(200, types.get(".json"), JSON.stringify(result));
    }
    let { pathname } = url;
    if (directories.test(pathname)) {
      if (!pathname.endsWith("/")) {
        response.writeHead(302, { Location: pathname + "/" }).end();
        return;
      }
      pathname += "index.html";
    }
    const match = files.exec(pathname);
    if (!match) return send(404, plain, "Page not found.");
    const file = await readFile(new URL("." + pathname, root));
    return send(200, types.get("." + match[1]), file);
  } catch (error) {
    if (error.code === "ENOENT") return send(404, plain, "Page not found. Run npm run build first.");
    console.error(error);
    return send(500, plain, "Resolution or cache error.");
  }
});

const port = Number(process.env.CITATION_PORT || 4187);
server.listen(port, "127.0.0.1", () => {
  console.log(`citation.inator on http://127.0.0.1:${server.address().port}/`);
});
