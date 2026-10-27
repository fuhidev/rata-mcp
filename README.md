# rata-mcp

Official Model Context Protocol (MCP) server for **RATA (GHM Automate v2)** — Antidetect Browser Automation & AI Vision Engine.

Connect AI agents (Claude Desktop, Cursor, Antigravity, Cline...) directly to your antidetect browser profiles with Vision-based element interaction and automated workflows.

> [!IMPORTANT]
> **RATA is GHM Automate v2**: GHM Automate (v1) provides the solid core automation foundation, while RATA (v2) elevates the ecosystem into an autonomous, AI-driven automation suite featuring Computer Vision (Set-of-Mark), live XPath reflection, and multi-profile agent control.
>
> This package is a lightweight open-source MCP adapter. It requires the **RATA / GHM Automate application** (by BHIT TECH) running on your machine with its Gateway on port 1408.
> - Get the app: https://bhitech.vn
> - Hotline / Zalo: 0708 521 015
> - Email: bhitech.vn@gmail.com

---

## 🚀 Capabilities

- **System & Profiles**: `rata_health`, `rata_list_profiles`, `rata_get_job_status` (with backward-compatible aliases for `ghm_*`).
- **RATA Browser Vision (`rata_browser_*`)**:
  - `rata_browser_navigate`: Open profile and navigate to URL (headed or headless).
  - `rata_browser_get_state`: Capture current page state with numbered interactive elements (Set-of-Mark) + screenshot.
  - `rata_browser_click`, `rata_browser_type`, `rata_browser_scroll`, `rata_browser_press_key`, `rata_browser_upload_file`.
  - `rata_browser_evaluate_js`: Run inspected scripts and test resilient XPath locators live.
  - `rata_browser_switch_tab`, `rata_browser_close_tab`, `rata_browser_close_session`.
- **Dynamic Script Runners**: Auto-discovered high-level automation runners exposed by the local application (Facebook Fanpage, Groups, TikTok, etc.).

---

## 📦 Quick Start

### 1. Requirements
- Node.js >= 18
- RATA (GHM Automate v2) desktop app running with Gateway enabled (port 1408).

### 2. Configuration for AI Clients

#### Antigravity / Claude Desktop / Cursor
Add to your MCP configuration:

```json
{
  "mcpServers": {
    "rata": {
      "command": "npx",
      "args": [
        "-y",
        "rata-mcp"
      ],
      "env": {
        "RATA_GATEWAY_URL": "http://127.0.0.1:1408"
      }
    }
  }
}
```

Or connect via local build:
```json
{
  "mcpServers": {
    "rata": {
      "command": "node",
      "args": [
        "path/to/ghmautomate/packages/mcp-server/dist/index.js"
      ]
    }
  }
}
```

---

## ⚙️ Environment Variables

| Variable | Default | Description |
|---|---|---|
| `RATA_GATEWAY_URL` | `http://127.0.0.1:1408` | URL of the local RATA Gateway |
| `GHM_GATEWAY_URL` | `http://127.0.0.1:1408` | Backward compatibility fallback URL |
| `RATA_GATEWAY_TOKEN` | _(none)_ | Bearer authentication token if enabled on Gateway |
| `GHM_GATEWAY_TOKEN` | _(none)_ | Backward compatibility fallback token |

---

## 🔒 Security
- Keep the Gateway bound to `127.0.0.1`; never expose port 1408 to the public network without proper VPN/tunneling and token authorization.
- `rata_browser_evaluate_js` executes JavaScript in the context of the active profile. Only connect trusted AI clients.

---

## 🛠️ Build from Source

```bash
npm install
npm run build
node dist/index.js
```

---

## 📄 License

MIT License for this MCP adapter. The core RATA / GHM Automate desktop application is proprietary commercial software of BHIT TECH and is not covered by this license.
