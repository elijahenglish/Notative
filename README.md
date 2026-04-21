# Notative

Notative is a lightweight note-taking app (similar to Notepad/Notion basics) with automatic task suggestion.

## Features

- Run as a local desktop app on your PC (Electron)
- Create and save notes locally on your machine
- Analyze note text to detect actionable tasks
- Use OpenAI when API key is configured
- Automatic local fallback extractor when no API key is set
- Keep a personal task inbox from suggestions

## Run Locally

1. Install dependencies:
   - PowerShell (one-session policy bypass):
     Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
   - Then install:
     npm install
2. (Optional) Configure AI:
   - Copy `.env.example` to `.env`
   - Add `OPENAI_API_KEY`
3. Start the desktop app:
   npm run dev
4. Notative opens in its own native window.

## Quick Start On Windows

To launch the desktop app without typing commands:

1. Double-click `Start-Notative.bat`
2. The script will:
  - find Node.js
  - install dependencies if needed
  - launch the Electron desktop app

## Optional Web Mode

If you still want the browser version:

1. Start the web server:
   npm run web
2. Open:
   http://localhost:3000

## Project Structure

Renderer UI is now split so future theme, typography, and panel-layout controls can be added without reopening one large file.

```text
public/
  index.html
  styles.css
  styles/
    tokens.css
    shell.css
    components.css
    responsive.css
  scripts/
    main.js
    core/
      constants.js
      settings.js
      store.js
    ui/
      elements.js
      renderers.js
    utils/
      date.js
      dom.js

electron/
  main.js
  preload.js
```

Why this split:

- `scripts/core` owns app state, storage, and settings scaffolding.
- `scripts/ui` owns DOM lookups and rendering.
- `scripts/utils` holds shared helpers.
- `styles/tokens.css` is the right place for themes and font scales.
- `styles/shell.css` and `styles/components.css` separate layout from component styling.

This structure is intended to support future user options for:

- Showing and hiding panels
- Reordering panel placement
- Swapping themes
- Changing font scale and visual density

## API

### POST /api/extract-tasks

Request body:

```json
{ "text": "Your notes here" }
```

Response body:

```json
{
  "source": "openai",
  "tasks": [
    {
      "title": "Send budget update",
      "description": "Need to send budget update by Friday",
      "priority": "high",
      "sourceSnippet": "Need to send budget update by Friday"
    }
  ]
}
```
