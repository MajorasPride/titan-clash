#!/usr/bin/env node
// Titan Clash MCP server: lets an AI agent (Claude, etc.) pilot a titan.
// The game (titan-clash.html) connects to this server over a WebSocket (default ws://localhost:8765).
// The agent is the COMMANDER: it reads the battle and gives orders. The titan's reflexes do the aiming, blocking and combos.
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { WebSocketServer } from "ws";
import { z } from "zod";

const PORT = Number(process.env.TITAN_CLASH_PORT || 8765);
const log = (...a) => console.error("[titan-clash-mcp]", ...a); // stdout is reserved for MCP

const ORDERS = {
  PRESS: "Close in and combo (aggressive melee)",
  ZONE: "Keep distance and shoot / use specials",
  COOL: "Guns are hot: cool off in melee or wade into a river",
  PARRY: "Wait for their attack and parry it, then punish",
  FLANK: "Circle behind them (good vs a rival who blocks a lot; tail/back hits)",
  HEAL: "Go grab a health pickup",
  CORE: "Go grab the glowing Titan Core (unlocks the super)",
  EVADE: "Get away from the disaster (tornado, lava, cracks)",
  FINISH: "All-out attack and use the super",
  SHIFT: "Transform (robot <-> vehicle, or kaiju mutation)",
  RETREAT: "Back off and recover",
};
const ACTIONS = ["light", "heavy", "special", "super", "transform", "jump", "dodge", "grab"];

let game = null, latest = null, nextId = 1, hello = null;
const pending = new Map();

const wss = new WebSocketServer({ port: PORT });
wss.on("listening", () => log(`waiting for the game on ws://localhost:${PORT}`));
wss.on("error", (e) => log("websocket error:", e.message));
wss.on("connection", (ws) => {
  game = ws; log("game connected");
  ws.on("message", (buf) => {
    let m; try { m = JSON.parse(buf.toString()); } catch { return; }
    if (m.type === "hello") hello = m;
    else if (m.type === "state") latest = m.state;
    else if (m.type === "reply" && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  });
  ws.on("close", () => { if (game === ws) { game = null; log("game disconnected"); } });
});

function ask(msg, timeout = 4000) {
  return new Promise((resolve) => {
    if (!game || game.readyState !== 1) return resolve({ ok: false, error: "The game is not connected. Open Titan Clash, go to Settings and turn on 'AI agent pilot'." });
    const id = nextId++; pending.set(id, resolve);
    game.send(JSON.stringify({ ...msg, id }));
    setTimeout(() => { if (pending.has(id)) { pending.delete(id); resolve({ ok: false, error: "The game did not answer in time." }); } }, timeout);
  });
}
const text = (o) => ({ content: [{ type: "text", text: typeof o === "string" ? o : JSON.stringify(o, null, 2) }] });
const out = (r) => text(r.ok ? (r.result ?? "ok") : "ERROR: " + r.error);

const server = new McpServer({ name: "titan-clash", version: "1.0.0" });

server.registerTool("list_options", {
  title: "List titans, maps and orders",
  description: "Lists the titans, maps, commander orders and button actions available in Titan Clash.",
  inputSchema: {},
}, async () => text({ connected: !!game, titans: hello?.titans ?? "connect the game to see the list", maps: hello?.maps ?? "connect the game to see the list", orders: ORDERS, actions: ACTIONS }));

server.registerTool("start_match", {
  title: "Start a match",
  description: "Starts a match against the CPU. side='opponent' means the agent flies the rival titan against the human player; side='player' means the agent flies the player's titan (watch mode) against the CPU.",
  inputSchema: {
    titan: z.string().optional().describe("Titan id the agent flies (valor, ashvin, raikou, infernoth, ragnavox, worldroot) or 'random'"),
    opponent: z.string().optional().describe("Titan id for the other side, or 'random'"),
    map: z.string().optional().describe("Map id: city (Neon City, the only map since v8.1) or 'random'"),
    side: z.enum(["opponent", "player"]).optional(),
  },
}, async (a) => out(await ask({ type: "start", ...a })));

server.registerTool("get_state", {
  title: "Read the battle",
  description: "Returns the live battle state: both titans' health, energy, heat, limbs, form, positions, distance, the current disaster stage, pickups, the order being followed and recent news events.",
  inputSchema: {},
}, async () => {
  if (!game) return text("ERROR: The game is not connected. Open Titan Clash, go to Settings and turn on 'AI agent pilot'.");
  const r = await ask({ type: "state" });
  return text(r.ok ? r.result : latest ?? "no state yet");
});

server.registerTool("give_order", {
  title: "Give the titan an order",
  description: "Commander order. The titan follows it for `seconds`, then its own commander takes over again. Reflexes (aim, blocks, dodges, combos) are automatic.\n" + Object.entries(ORDERS).map(([k, v]) => `${k}: ${v}`).join("\n"),
  inputSchema: {
    order: z.enum(Object.keys(ORDERS)),
    seconds: z.number().min(1).max(60).optional().describe("How long to follow it (default 8)"),
    reason: z.string().max(90).optional().describe("Optional short line shown on the news ticker"),
  },
}, async (a) => out(await ask({ type: "order", ...a })));

server.registerTool("do_action", {
  title: "Press a button",
  description: "Presses one button right now (light, heavy, special, super, transform, jump, dodge, grab). Use for timing: jump over an avalanche or earthquake, dodge a beam, fire the super.",
  inputSchema: { action: z.enum(ACTIONS) },
}, async (a) => out(await ask({ type: "action", ...a })));

server.registerTool("wait_and_watch", {
  title: "Wait, then read the battle",
  description: "Waits a few seconds of real time, then returns the battle state. Use it between orders.",
  inputSchema: { seconds: z.number().min(0.5).max(10).optional() },
}, async ({ seconds = 3 }) => {
  await new Promise((r) => setTimeout(r, seconds * 1000));
  const r = await ask({ type: "state" });
  return text(r.ok ? r.result : latest ?? ("ERROR: " + r.error));
});

server.registerTool("say", {
  title: "Trash talk",
  description: "Puts a short line on the Channel 7 news ticker, credited to the agent.",
  inputSchema: { text: z.string().max(90) },
}, async (a) => out(await ask({ type: "say", ...a })));

await server.connect(new StdioServerTransport());
log("MCP server running");
