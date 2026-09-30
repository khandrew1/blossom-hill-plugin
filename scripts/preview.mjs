import { createServer } from "node:http";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../dist/home.html", import.meta.url));
const port = Number(process.env.PORT || 3217);
createServer((request, response) => {
  if (request.url !== "/") {
    response.writeHead(404).end("Not found");
    return;
  }
  response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" }).end(html);
}).listen(port, "127.0.0.1", () => {
  console.log(`Blossom Hill preview: http://127.0.0.1:${port}`);
});

