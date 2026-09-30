import { App, applyDocumentTheme, applyHostStyleVariables } from "@modelcontextprotocol/ext-apps";
import { OpenAIExtensions } from "@openai/mcp-extensions/app";
import "@openai/mcp-extensions/app/styles.css";
import { createRoot } from "react-dom/client";
import { demoHome, type HomeData } from "../data/events";
import { Home } from "./Home";
import "./styles.css";

const root = createRoot(document.getElementById("root")!);
const app = new App({ name: "Blossom Hill", version: "0.1.0" });
new OpenAIExtensions(app);

function applyTheme(context: ReturnType<App["getHostContext"]>) {
  if (context?.theme) applyDocumentTheme(context.theme);
  if (context?.styles?.variables) applyHostStyleVariables(context.styles.variables);
}

// Install handlers before connecting: the host sends the initial homepage data.
app.ontoolresult = (result) => {
  if (result.isError || !Array.isArray(result.structuredContent?.events)) {
    root.render(<p className="loading" role="alert">The event list could not be loaded.</p>);
    return;
  }
  root.render(<Home data={result.structuredContent as unknown as HomeData} />);
};
app.addEventListener("hostcontextchanged", applyTheme);

if (window.parent === window) {
  // Browser preview uses the same sample data; it does not impersonate a host.
  root.render(<Home data={demoHome} />);
} else {
  root.render(<p className="loading">Gathering your upcoming events…</p>);
  try {
    await app.connect();
    applyTheme(app.getHostContext());
  } catch {
    root.render(<p className="loading" role="alert">Unable to connect to the Blossom Hill host.</p>);
  }
}
