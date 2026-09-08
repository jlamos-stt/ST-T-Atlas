#!/usr/bin/env node

/**
 * WebiMcpBridge — exposes the Webi.AI SSE MCP servers through Codex STDIO.
 *
 * Codex supports STDIO MCP servers while the Kiro Webi.AI bridge currently
 * exposes legacy SSE endpoints. This adapter keeps one SSE session per Webi
 * server, merges their tool catalogs, and forwards JSON-RPC calls.
 */

const BRIDGE_VERSION = "1.0.0";
const PROTOCOL_VERSION = "2025-06-18";
const REQUEST_TIMEOUT_MS = 60_000;
const BASE_URL = process.env.WEBI_MCP_BASE_URL ?? "http://127.0.0.1:41350";

const SOURCES = [
  {
    id: "devtools",
    sseUrl: process.env.WEBI_DEVTOOLS_SSE_URL ?? `${BASE_URL}/devtools/sse`,
  },
  {
    id: "elements",
    sseUrl: process.env.WEBI_ELEMENTS_SSE_URL ?? `${BASE_URL}/elements/sse`,
  },
];

/** Emit an MCP response to Codex using the STDIO JSON-lines transport. */
function writeMessage(message) {
  process.stdout.write(`${JSON.stringify(message)}\n`);
}

/** Emit diagnostic information without corrupting the STDIO protocol. */
function writeDiagnostic(message) {
  process.stderr.write(`[webiai-mcp-bridge] ${message}\n`);
}

/** Create a JSON-RPC error response for a request that has an id. */
function writeError(id, code, message, data) {
  writeMessage({
    jsonrpc: "2.0",
    id,
    error: { code, message, ...(data === undefined ? {} : { data }) },
  });
}

/** Resolve a relative SSE endpoint against the originating server URL. */
function resolveEndpoint(sseUrl, endpoint) {
  return new URL(endpoint, sseUrl).toString();
}

/**
 * Maintains one legacy SSE session and proxies JSON-RPC requests to it.
 */
class SseMcpClient {
  constructor(source) {
    this.source = source;
    this.reader = null;
    this.endpointUrl = null;
    this.endpointPromise = null;
    this.nextRequestId = 1;
    this.pending = new Map();
    this.connectPromise = null;
  }

  /** Open the SSE stream and wait until Webi publishes its message endpoint. */
  async connect() {
    if (this.connectPromise) return this.connectPromise;
    this.connectPromise = this.openSseStream();
    try {
      await this.connectPromise;
    } catch (error) {
      this.connectPromise = null;
      throw error;
    }
  }

  /** Establish the SSE stream and parse its endpoint event. */
  async openSseStream() {
    const response = await fetch(this.source.sseUrl, {
      headers: { Accept: "text/event-stream" },
    });
    if (!response.ok || !response.body) {
      throw new Error(`${this.source.id} SSE connection failed: HTTP ${response.status}`);
    }

    this.endpointPromise = new Promise((resolve, reject) => {
      this.resolveEndpoint = resolve;
      this.rejectEndpoint = reject;
    });
    this.reader = response.body.getReader();
    void this.readSseEvents();
    await this.endpointPromise;
  }

  /** Parse SSE events and resolve pending JSON-RPC responses. */
  async readSseEvents() {
    const decoder = new TextDecoder();
    let buffer = "";
    let eventName = "message";
    let dataLines = [];

    const dispatch = () => {
      if (dataLines.length === 0) return;
      const data = dataLines.join("\n");
      dataLines = [];
      const currentEvent = eventName;
      eventName = "message";

      if (currentEvent === "endpoint") {
        this.endpointUrl = resolveEndpoint(this.source.sseUrl, data.trim());
        this.resolveEndpoint(this.endpointUrl);
        return;
      }

      try {
        const message = JSON.parse(data);
        if (message.id !== undefined && this.pending.has(message.id)) {
          const pendingRequest = this.pending.get(message.id);
          this.pending.delete(message.id);
          clearTimeout(pendingRequest.timeout);
          pendingRequest.resolve(message);
        }
      } catch (error) {
        writeDiagnostic(`Ignored non-JSON ${this.source.id} SSE event: ${error.message}`);
      }
    };

    try {
      while (true) {
        const { value, done } = await this.reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split(/\r?\n/);
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (line === "") {
            dispatch();
          } else if (line.startsWith("event:")) {
            eventName = line.slice(6).trim();
          } else if (line.startsWith("data:")) {
            dataLines.push(line.slice(5).replace(/^ /, ""));
          }
        }
      }
      dispatch();
      throw new Error(`${this.source.id} SSE stream closed`);
    } catch (error) {
      if (this.rejectEndpoint) this.rejectEndpoint(error);
      for (const pendingRequest of this.pending.values()) {
        clearTimeout(pendingRequest.timeout);
        pendingRequest.reject(error);
      }
      this.pending.clear();
    }
  }

  /** Send one JSON-RPC request through the Webi SSE session. */
  async request(method, params = {}) {
    await this.connect();
    const id = this.nextRequestId++;
    const message = { jsonrpc: "2.0", id, method, params };
    const result = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`${this.source.id} request timed out: ${method}`));
      }, REQUEST_TIMEOUT_MS);
      this.pending.set(id, { resolve, reject, timeout });
    });

    const response = await fetch(this.endpointUrl, {
      method: "POST",
      headers: {
        Accept: "application/json, text/event-stream",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });
    if (!response.ok) {
      this.pending.delete(id);
      throw new Error(`${this.source.id} request failed: HTTP ${response.status}`);
    }
    return result;
  }

  /** Send a JSON-RPC notification through the Webi SSE session. */
  async notify(method, params = {}) {
    await this.connect();
    const response = await fetch(this.endpointUrl, {
      method: "POST",
      headers: {
        Accept: "application/json, text/event-stream",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ jsonrpc: "2.0", method, params }),
    });
    if (!response.ok) {
      throw new Error(`${this.source.id} notification failed: HTTP ${response.status}`);
    }
  }
}

const clients = new Map(SOURCES.map((source) => [source.id, new SseMcpClient(source)]));
const toolRoutes = new Map();
let initialized = false;
let toolsCache = null;

/** Initialize both upstream Webi servers before exposing their tools. */
async function initializeUpstreams() {
  if (initialized) return;
  for (const client of clients.values()) {
    const response = await client.request("initialize", {
      protocolVersion: PROTOCOL_VERSION,
      capabilities: {},
      clientInfo: { name: "codex-webiai-bridge", version: BRIDGE_VERSION },
    });
    if (response.error) {
      throw new Error(`${client.source.id} initialize failed: ${response.error.message}`);
    }
    await client.notify("notifications/initialized");
  }
  initialized = true;
}

/** Load and merge the tool catalogs while preserving each tool's source. */
async function listTools() {
  if (toolsCache) return toolsCache;
  await initializeUpstreams();
  const mergedTools = [];
  for (const [sourceId, client] of clients) {
    const response = await client.request("tools/list");
    if (response.error) throw new Error(`${sourceId} tools/list failed: ${response.error.message}`);
    for (const tool of response.result?.tools ?? []) {
      const originalName = tool.name;
      let exposedName = originalName;
      if (toolRoutes.has(exposedName)) exposedName = `${sourceId}_${originalName}`;
      toolRoutes.set(exposedName, { sourceId, originalName });
      mergedTools.push({ ...tool, name: exposedName });
    }
  }
  toolsCache = mergedTools;
  return toolsCache;
}

/** Forward one tools/call request to the Webi server that owns the tool. */
async function callTool(params) {
  const route = toolRoutes.get(params?.name);
  if (!route) {
    throw new Error(`Unknown Webi tool: ${params?.name}`);
  }
  const client = clients.get(route.sourceId);
  const response = await client.request("tools/call", {
    name: route.originalName,
    arguments: params.arguments ?? {},
  });
  if (response.error) {
    return { isError: true, content: [{ type: "text", text: response.error.message }] };
  }
  return response.result ?? { content: [] };
}

/** Handle one JSON-RPC request received from Codex. */
async function handleMessage(message) {
  if (!message || message.jsonrpc !== "2.0") return;
  const id = message.id;
  if (message.method?.startsWith("notifications/")) return;

  try {
    switch (message.method) {
      case "initialize":
        writeMessage({
          jsonrpc: "2.0",
          id,
          result: {
            protocolVersion: PROTOCOL_VERSION,
            capabilities: { tools: { listChanged: false } },
            serverInfo: { name: "webiai-codex-bridge", version: BRIDGE_VERSION },
            instructions:
              "Webi.AI tools are split between development lifecycle tools and UI tools. " +
              "Use discovery before Webi devtools operations and respect tool confirmations for mutations.",
          },
        });
        return;
      case "ping":
        writeMessage({ jsonrpc: "2.0", id, result: {} });
        return;
      case "tools/list":
        writeMessage({ jsonrpc: "2.0", id, result: { tools: await listTools() } });
        return;
      case "tools/call":
        writeMessage({ jsonrpc: "2.0", id, result: await callTool(message.params) });
        return;
      default:
        writeError(id, -32601, `Method not found: ${message.method}`);
    }
  } catch (error) {
    writeError(id, -32000, error.message);
  }
}

/** Read newline-delimited JSON-RPC messages from Codex. */
let inputBuffer = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => {
  inputBuffer += chunk;
  const lines = inputBuffer.split(/\r?\n/);
  inputBuffer = lines.pop() ?? "";
  for (const line of lines) {
    if (!line.trim()) continue;
    try {
      void handleMessage(JSON.parse(line));
    } catch (error) {
      writeDiagnostic(`Invalid JSON from Codex: ${error.message}`);
    }
  }
});

process.stdin.on("end", () => {
  for (const client of clients.values()) client.reader?.cancel().catch(() => {});
});

process.on("uncaughtException", (error) => writeDiagnostic(`Unexpected error: ${error.stack ?? error.message}`));
process.on("unhandledRejection", (error) => writeDiagnostic(`Unhandled rejection: ${error?.stack ?? error}`));
