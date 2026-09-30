// Exercise the built HTTP server, rather than duplicating its registration logic.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createInterface } from "node:readline";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

let serverProcess;
let url = process.env.MCP_URL;
if (!url) {
  serverProcess = spawn(process.execPath, ["dist/server.js"], {
    env: { ...process.env, PORT: "0", HOST: "127.0.0.1" }, stdio: ["ignore", "pipe", "inherit"],
  });
  const lines = createInterface({ input: serverProcess.stdout });
  url = await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("HTTP server startup timed out")), 10000);
    lines.on("line", (line) => {
      if (line.startsWith("Blossom Hill HTTP ready: ")) {
        clearTimeout(timeout);
        resolve(line.slice("Blossom Hill HTTP ready: ".length));
      }
    });
    serverProcess.on("exit", (code) => reject(new Error(`HTTP server exited: ${code}`)));
  });
  lines.close();
}

const client = new Client({ name: "blossom-hill-check", version: "0.1.0" });
try {
  const health = await fetch(new URL("/health", url));
  assert.equal(health.status, 200);
  // Hosted platforms may provide their own health payload.
  if (serverProcess) assert.deepEqual(await health.json(), { status: "ok" });
  assert.equal((await fetch(url)).status, 405);
  await client.connect(new StreamableHTTPClientTransport(new URL(url)));
  const { tools } = await client.listTools();
  assert.equal(tools.length, 1);
  const home = tools[0];
  assert.equal(home.name, "blossom.home");
  assert.deepEqual(home._meta["openai/ui"].entrypoints, [{ type: "global" }]);
  assert.equal(home.annotations.readOnlyHint, true);

  const first = await client.callTool({ name: home.name, arguments: {} });
  const second = await client.callTool({ name: home.name, arguments: {} });
  assert.deepEqual(first.structuredContent, second.structuredContent);
  assert.equal(first.structuredContent.events.length, 1);
  assert.equal(first.structuredContent.events[0].name, "Blossom Hill Cafe");

  const result = await client.readResource({ uri: home._meta.ui.resourceUri });
  const resource = result.contents[0];
  assert.equal(resource.mimeType, "text/html;profile=mcp-app");
  assert.equal(resource._meta["openai/ui"].preferredDisplayMode, "fullscreen");
  assert.ok(resource.text.includes("data:image/png;base64,"));
  assert.ok(resource.text.includes("Blossom Hill"));
  console.log("HTTP health, MCP handshake, sidebar metadata, fullscreen resource, sample data and repeated calls passed.");
} finally {
  await client.close();
  serverProcess?.kill("SIGTERM");
}
