# Security Policy

## Scope

This extension runs entirely in your browser. It:

- Makes **zero network requests** of its own
- Reads **no personal data** — it only interacts with DOM buttons on `*.hbomax.com`
- Stores only your feature toggles and delay preference via `chrome.storage.sync`
- Logs only selector names and click events to the browser console — never page content

## Reporting a Vulnerability

If you find a security issue, please **do not open a public issue**.

Open a GitHub issue with the label `security` and a brief description. We will respond within 7 days and coordinate a fix before any public disclosure.

## Permissions Justification

| Permission | Why |
|---|---|
| `storage` | Save your toggle preferences (skip intro on/off, delay, etc.) |
| `activeTab` | Inject the content script into the active Max tab |

No `tabs`, no `history`, no `cookies`, no `webRequest`.
