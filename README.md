# Blossom Hill

A homepage-only Codex Plugin Extension. It shows one fictional Blossom Hill Cafe event. Click the card to reach a minimal placeholder, then use **All events** or browser Back to return.

## Run locally

Requires Node.js 22 or later.

```sh
npm ci
npm run verify
npm start
```

The homepage opens at http://127.0.0.1:3000 and Streamable HTTP MCP is served at `/mcp`. Health checks use `/health`. The standalone preview reads the sample data directly; inside Codex, the host provides that same data through the MCP tool.

## Read the code

- `src/data/events.ts`: the sample event, with the 150-person demo estimate explicitly separated from live data.
- `src/app/Home.tsx`: homepage, café card and ordinary hash navigation.
- `src/app/styles.css`: layout and the existing Blossom card's image overlays and typography.
- `src/app/main.tsx`: the MCP App bridge, initial tool result and host theme.
- `src/server.ts`: one read-only tool and one bundled UI resource.
- `.codex-plugin/plugin.json`: plugin identity and display name; `.mcp.json` connects Codex to the deployed Streamable HTTP endpoint. For local development, use `http://127.0.0.1:3000/mcp`.
- `scripts/build.mjs`: bundles the UI, image, CSS and server into `dist/`.

## SDK surfaces used

`@openai/mcp-extensions/server` enables OpenAI extensions on the MCP server. Tool metadata registers a **global entrypoint** in the sidebar. Resource metadata requests **fullscreen** display. These registrations are separate from the package manifest.

`@modelcontextprotocol/ext-apps` supplies the shared MCP App protocol. `@openai/mcp-extensions/app` enables host extensions, and its bundled stylesheet supplies native controls. The app receives its initial data through `ontoolresult` and follows host theme changes.

The SDK's current release requires MCP Apps 1.x, so this project pins `@modelcontextprotocol/ext-apps` to 1.7.5 rather than mixing it with 2.x.

There are no attendee edits, floor plans, operations, external integrations or persistence in this scaffold. Navigation is app-local; it does not start another chat or call another tool.

## Official references

- [Plugin Extensions guide](https://developers.openai.com/plugins/build/extensions)
- [Official TypeScript SDK](https://github.com/openai/mcp-extensions/blob/main/typescript/README.md)
- [Extension specification](https://github.com/openai/mcp-extensions/blob/main/docs/spec.md)
- [Bits & Bolts example](https://github.com/openai/mcp-extensions/tree/main/plugins/bits-and-bolts)

The café image and card styling are reused from the existing `$DEV/blossom` demo, which remains unchanged.


## Deployment

Deploy this repository to Manufact Demo Org with:

- Build command: `npm ci && npm run build`
- Start command: `npm start`
- Environment: use the platform-provided `PORT` (defaults to 3000). `HOST` defaults to `0.0.0.0`; set `HOST=127.0.0.1` for loopback-only local development.
- MCP endpoint: `/mcp`; health endpoint: `/health`.

The server uses stateless Streamable HTTP. It serves fictional, read-only demo data and needs no credentials. Each request creates a fresh MCP server and transport. The homepage resource embeds its image, JavaScript and CSS, so it needs no separate asset host.

To check a deployed endpoint, run `MCP_URL=https://calm-steel-fqshc.run.mcp-use.com/mcp npm test`.
