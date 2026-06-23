# MCP Selenium Server

A Model Context Protocol (MCP) server that lets AI agents automate real browsers
through Selenium WebDriver.

Use it when an agent needs to open a browser, navigate pages, click elements,
fill forms, upload files, handle alerts, manage cookies, capture diagnostics, or
inspect page structure without writing a separate Selenium script.

## What It Provides

- Browser automation for Chrome, Firefox, Edge, Safari, and Edge in IE mode.
- 18 MCP tools for navigation, interactions, screenshots, cookies, windows,
  frames, alerts, script execution, and diagnostics.
- 2 MCP resources for browser status and compact accessibility snapshots.
- Passive WebDriver BiDi capture for console logs, JavaScript errors, and
  network activity when the browser and driver support it.

## Setup

<details open>
<summary><strong>Goose (Desktop)</strong></summary>

Paste into your browser address bar:

```
goose://extension?cmd=npx&arg=-y&arg=github%3Arayven122%2Fmcp-selenium&id=selenium-mcp&name=Selenium%20MCP&description=automates%20browser%20interactions
```
</details>

<details>
<summary><strong>Goose (CLI)</strong></summary>

```bash
goose session --with-extension "npx -y github:rayven122/mcp-selenium"
```
</details>

<details>
<summary><strong>Claude Code</strong></summary>

```bash
claude mcp add selenium -- npx -y github:rayven122/mcp-selenium
```
</details>

<details>
<summary><strong>Cursor / Windsurf / other MCP clients</strong></summary>

```json
{
  "mcpServers": {
    "selenium": {
      "command": "npx",
      "args": ["-y", "github:rayven122/mcp-selenium"]
    }
  }
}
```
</details>

## Requirements

- Node.js and npm.
- At least one supported browser installed.
- The matching browser driver available to Selenium if your environment does
  not provide one automatically.

For local tests, Chrome and `chromedriver` must be on your `PATH`.

## Example Usage

After adding the server to your MCP client, ask your AI agent something like:

> Open Chrome, go to github.com/angiejones, and take a screenshot.

The agent can then call `start_browser`, `navigate`, and `take_screenshot`
through MCP. For most page inspection tasks, agents should prefer the
`accessibility://current` resource because it is smaller and easier to reason
about than full HTML or screenshots.

## Supported Browsers

| Browser | `start_browser` value | Headless support | Notes |
|---------|------------------------|------------------|-------|
| Chrome | `chrome` | Yes | Uses `--headless=new` when `options.headless` is true. |
| Firefox | `firefox` | Yes | Uses Firefox headless mode when requested. |
| Edge | `edge` | Yes | Uses `--headless=new` when `options.headless` is true. |
| Safari | `safari` | No | macOS only. Requires Safari remote automation. |
| Edge in IE mode | `edge-ie` | No | Windows only. Only exposed in the `start_browser` schema on Windows. Requires IEDriverServer and IE mode setup. |

### Safari Setup

Run this once on macOS:

```bash
sudo safaridriver --enable
```

Then enable "Allow Remote Automation" in Safari under Settings > Developer.

### Edge IE Mode Setup

Edge IE mode is for legacy sites that must run through the Internet Explorer
engine inside Microsoft Edge. It requires:

- Windows.
- Microsoft Edge.
- IEDriverServer, preferably 32-bit, from the
  [Selenium downloads](https://www.selenium.dev/downloads/) on your `PATH`.
- IE mode enabled in Edge by policy or registry, with target sites configured
  for Internet Explorer mode.

Example:

```json
{
  "browser": "edge-ie",
  "options": {
    "ieIgnoreZoomSetting": true
  }
}
```

Optional Edge IE mode options include `edgePath` and `ieIgnoreZoomSetting`.

## Tools

Locator-based tools use the same locator strategies:

| Strategy | Description |
|----------|-------------|
| `id` | Find by element ID. |
| `css` | Find by CSS selector. |
| `xpath` | Find by XPath expression. |
| `name` | Find by `name` attribute. |
| `tag` | Find by tag name. |
| `class` | Find by class name. |

Most locator-based tools accept an optional `timeout` in milliseconds. The
default is `10000` unless noted otherwise.

| Tool | Purpose | Key parameters |
|------|---------|----------------|
| `start_browser` | Launch a browser session. | `browser`, optional `options` |
| `navigate` | Navigate to a URL. | `url` |
| `interact` | Click, double-click, right-click, or hover over an element. | `action`, `by`, `value`, optional `timeout` |
| `send_keys` | Clear an element, then type text into it. | `by`, `value`, `text`, optional `timeout` |
| `get_element_text` | Read visible text from an element. | `by`, `value`, optional `timeout` |
| `get_element_attribute` | Read an element attribute. | `by`, `value`, `attribute`, optional `timeout` |
| `press_key` | Press a keyboard key. | `key` |
| `upload_file` | Set a file input to an absolute file path. | `by`, `value`, `filePath`, optional `timeout` |
| `take_screenshot` | Capture the current page. | optional `outputPath` |
| `close_session` | Close the current browser session. | none |
| `execute_script` | Run JavaScript in the browser. | `script`, optional `args` |
| `window` | List, switch, switch to latest, or close windows and tabs. | `action`, optional `handle` |
| `frame` | Switch to a frame or back to the default page. | `action`, optional `by`, `value`, `index`, `timeout` |
| `alert` | Accept, dismiss, read, or type into browser dialogs. | `action`, optional `text`, `timeout` |
| `add_cookie` | Add a cookie for the current page domain. | `name`, `value`, optional cookie fields |
| `get_cookies` | Return all cookies or one cookie by name. | optional `name` |
| `delete_cookie` | Delete all cookies or one cookie by name. | optional `name` |
| `diagnostics` | Read BiDi console logs, JS errors, or network activity. | `type`, optional `clear` |

### Tool Details

#### `start_browser`

`browser` must be one of `chrome`, `firefox`, `edge`, or `safari`. On Windows,
`edge-ie` is also available for Edge in Internet Explorer mode.

`options` can include:

```json
{
  "headless": true,
  "arguments": ["--window-size=1280,720"],
  "edgePath": "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "ieIgnoreZoomSetting": true
}
```

`edgePath` and `ieIgnoreZoomSetting` apply only to `edge-ie`.

For safety, browser arguments that weaken browser isolation or expose remote
debugging are blocked by default. In a trusted local environment, set
`MCP_SELENIUM_ALLOW_UNSAFE_BROWSER_ARGS=1` to pass those arguments through.

#### `navigate`

`javascript:` and `vbscript:` URLs are rejected. Use `execute_script` when you
intentionally need to run JavaScript in the active page.

#### `interact`

`action` must be one of `click`, `doubleclick`, `rightclick`, or `hover`.

#### `take_screenshot`

When `outputPath` is provided, the path must end in `.png` and resolve inside
the server's current working directory. Set `MCP_SELENIUM_SCREENSHOT_DIR` to use
a different trusted screenshot output directory.

#### `window`

`action` must be one of `list`, `switch`, `switch_latest`, or `close`.
`handle` is required for `switch`.

#### `frame`

`action` must be `switch` or `default`. For `switch`, provide either a locator
(`by` and `value`) or an `index`.

#### `alert`

`action` must be one of `accept`, `dismiss`, `get_text`, or `send_text`.
`text` is required for `send_text`. The default timeout is `5000` ms.

#### `diagnostics`

`type` must be one of `console`, `errors`, or `network`. Set `clear` to `true`
to empty that diagnostics buffer after reading it.

## Resources

MCP resources provide read-only data that clients can access without calling a
tool.

| Resource | MIME type | Requires browser | Description |
|----------|-----------|------------------|-------------|
| `browser-status://current` | `text/plain` | No | Current active session ID, or `no active session`. |
| `accessibility://current` | `application/json` | Yes | Compact accessibility tree of interactive elements and text content. |

## Development

```bash
git clone https://github.com/rayven122/mcp-selenium.git
cd mcp-selenium
npm install
npm test
```

Tests use Node's built-in test runner and talk to the real MCP server over
stdio. They require Chrome and `chromedriver` on your `PATH`.

This fork is distributed via GitHub (not published to npm). The Setup section
above runs it directly with `npx -y github:rayven122/mcp-selenium`.

### Run from a local clone

For a pinned local copy (recommended when running on a fixed Windows host for
Edge IE mode), point your MCP client at the server entry directly:

```bash
node /absolute/path/to/mcp-selenium/src/lib/server.js
```

## License

MIT
