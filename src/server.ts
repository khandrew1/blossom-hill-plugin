import { createServer as createHttpServer } from "node:http";
import { readFile } from "node:fs/promises";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { RESOURCE_MIME_TYPE, registerAppResource, registerAppTool } from "@modelcontextprotocol/ext-apps/server";
import { OpenAIExtensions, type OpenAIUiResourceMetadata, type OpenAIUiToolMetadata } from "@openai/mcp-extensions/server";
import { demoHome } from "./data/events.js";

const HOME_URI = "ui://blossom-hill/home";
const homeHtml = await readFile(new URL("./home.html", import.meta.url), "utf8");
const iconSvg = await readFile(new URL("../assets/icon.svg", import.meta.url), "utf8");
const icons = [{ src: "data:image/svg+xml," + encodeURIComponent(iconSvg), mimeType: "image/svg+xml" }];
// Each stateless HTTP request has its own MCP server and transport.
// Shared state consists only of the fictional read-only event list.
function createMcpServer() {
  const server = new McpServer({ name: "blossom-hill", title: "Blossom Hill", version: "0.1.0", icons });
  new OpenAIExtensions(server);

  registerAppResource(server, "homepage", HOME_URI, {}, async () => ({
    contents: [{
      uri: HOME_URI,
      mimeType: RESOURCE_MIME_TYPE,
      text: homeHtml,
      _meta: {
        "ui": { csp: { connectDomains: [], resourceDomains: [] } },
        "openai/ui": {
          preferredDisplayMode: "fullscreen",
          availableDisplayModes: ["fullscreen"],
        } satisfies OpenAIUiResourceMetadata,
      },
    }],
  }));

  registerAppTool(server, "blossom.home", {
    title: "Blossom Hill",
    description: "Open the Blossom Hill homepage and its one fictional upcoming café event.",
    inputSchema: {},
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    _meta: {
      ui: { resourceUri: HOME_URI, visibility: ["model", "app"] },
      "openai/ui": { entrypoints: [{ type: "global" }] } satisfies OpenAIUiToolMetadata,
    },
  }, async () => ({
    content: [{ type: "text", text: "Blossom Hill has one sample upcoming event: Blossom Hill Cafe, October 28, 2026, 6–9 PM Pacific. The 150 guests are a demo estimate." }],
    structuredContent: { events: demoHome.events },
  }));

  return server;
}

const httpServer = createHttpServer(async (request, response) => {
  const path = new URL(request.url ?? "/", "http://localhost").pathname;
  if (request.method === "GET" && path === "/") {
    response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" }).end(homeHtml);
    return;
  }
  if (request.method === "GET" && path === "/health") {
    response.writeHead(200, { "Content-Type": "application/json" }).end(JSON.stringify({ status: "ok" }));
    return;
  }
  if (path !== "/mcp") {
    response.writeHead(404).end("Not found");
    return;
  }
  if (request.method !== "POST") {
    response.writeHead(405, { Allow: "POST" }).end("This stateless MCP endpoint accepts POST requests.");
    return;
  }
  const server = createMcpServer();
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
  response.on("close", () => { void server.close(); });
  try {
    await server.connect(transport);
    await transport.handleRequest(request, response);
  } catch (error) {
    console.error("MCP request failed:", error);
    if (!response.headersSent) {
      response.writeHead(500, { "Content-Type": "application/json" }).end(JSON.stringify({
        jsonrpc: "2.0", error: { code: -32603, message: "Internal server error" }, id: null,
      }));
    }
  }
});

// Bind all interfaces for deployment; local checks explicitly use loopback.
const host = process.env.HOST ?? "0.0.0.0";
const port = Number(process.env.PORT ?? 3000);
httpServer.listen(port, host, () => {
  const address = httpServer.address();
  const boundPort = address !== null && typeof address === "object" ? address.port : port;
  console.log(`Blossom Hill HTTP ready: http://${host}:${boundPort}/mcp`);
});
