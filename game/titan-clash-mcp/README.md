# Titan Clash agent pilot (MCP server)

This lets an AI agent, like Claude, fly a titan in Titan Clash. The agent acts as the **commander**: it reads the battle and gives orders like "close in and combo" or "get away from the tornado". The titan's own reflexes handle the aiming, blocking, parrying and combos.

```
Claude  --MCP-->  titan-clash-mcp (this folder)  --WebSocket-->  titan-clash.html
```

## 1. Install (once)

You need **Node.js 18 or newer** (https://nodejs.org). Then, in this folder:

```
npm install
```

## 2. Connect it to Claude

**Claude Desktop:** open Settings → Developer → Edit Config, and add this, using the real path to this folder:

```json
{
  "mcpServers": {
    "titan-clash": {
      "command": "node",
      "args": ["C:\\Users\\YOU\\Games\\titan-clash\\titan-clash-mcp\\server.mjs"]
    }
  }
}
```

Restart Claude Desktop. You should see a "titan-clash" tool set.

**Claude Code:**

```
claude mcp add titan-clash -- node /path/to/titan-clash-mcp/server.mjs
```

## 3. Turn it on in the game

Open `titan-clash.html` in Chrome, go to **Settings**, and turn on **AI agent pilot**. Choose what the agent flies:

- **your opponent**: you fight Claude.
- **your titan (watch mode)**: Claude fights the CPU while you watch.

"AI AGENT CONNECTED" pops up once Claude has started the server, which happens the first time it uses a titan-clash tool. The game retries every 3 seconds, so the order doesn't matter.

## 4. Ask Claude to play

For example: *"Start a Titan Clash match on Neon City. You fly INFERNOTH against me. Read the battle every few seconds and give orders."*

| Tool | What it does |
|---|---|
| `list_options` | Lists the titans, maps, orders and buttons |
| `start_match` | Starts a match (titan, opponent, map, side) |
| `get_state` | Live battle: health, energy, heat, limbs, distance, disaster stage, pickups, recent news |
| `give_order` | PRESS, ZONE, COOL, PARRY, FLANK, HEAL, CORE, EVADE, FINISH, SHIFT or RETREAT for a number of seconds |
| `do_action` | Presses one button now (jump over an avalanche, dodge, fire the super) |
| `wait_and_watch` | Waits a few seconds, then returns the state |
| `say` | Puts a trash-talk line on the Ch 7 news ticker |

The agent's current order shows under its health bar. When the agent stops giving orders, the built-in commander takes over again.

## Settings

- Port: set `TITAN_CLASH_PORT` (default 8765). If you change it, also change the address in the game's Settings.
