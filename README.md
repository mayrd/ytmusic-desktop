# YouTube Music Desktop

Unofficial YouTube Music Desktop Application built with Electron.

## Features

- **Global keyboard shortcuts** — control playback from anywhere
- **Media key support** — standard media keys (Play/Pause/Next/Previous)
- **Configurable shortcuts** — customize or disable shortcuts via config file
- **Cross-platform** — Windows, macOS, Linux (x64 + arm64)

## Installation

Download the latest release for your platform from the [Releases](https://github.com/mayrd/ytmusic-desktop/releases) page.

### Linux
- `.AppImage` — run directly, no installation needed
- `.deb` — install with `sudo dpkg -i ytmusic_*.deb`

### Windows
- `.exe` (NSIS installer) — run the installer
- `.exe` (portable) — run directly

### macOS
- `.dmg` — open and drag to Applications

## Keyboard Shortcuts

### Default Shortcuts

| Action | Shortcut |
|--------|----------|
| Previous | `Ctrl+Shift+Left` |
| Play/Pause | `Ctrl+Shift+Enter` |
| Next | `Ctrl+Shift+Right` |
| Thumbs Up | `Ctrl+Shift+Up` |
| Thumbs Down | `Ctrl+Shift+Down` |

Media keys (`MediaPreviousTrack`, `MediaPlayPause`, `MediaNextTrack`) are also supported and can be disabled independently.

## Configuration

Shortcuts are configured via `~/.config/ytmusic-desktop/config.json`.

On first launch, a default config file is created automatically. Edit this file to customize shortcuts or disable them entirely.

### Example config

```json
{
  "shortcuts": {
    "enabled": true,
    "previous": "CommandOrControl+Shift+Left",
    "playPause": "CommandOrControl+Shift+Enter",
    "next": "CommandOrControl+Shift+Right",
    "thumbsUp": "CommandOrControl+Shift+Up",
    "thumbsDown": "CommandOrControl+Shift+Down"
  },
  "mediaKeys": {
    "enabled": true
  },
  "window": {
    "width": 8000,
    "height": 6000,
    "maximize": true
  }
}
```

### Disable all alternative shortcuts

Set `shortcuts.enabled` to `false`:

```json
{
  "shortcuts": {
    "enabled": false
  }
}
```

### Disable only media keys

```json
{
  "mediaKeys": {
    "enabled": false
  }
}
```

### Custom shortcut keys

Change any shortcut to a valid [Electron accelerator](https://www.electronjs.org/docs/latest/api/accelerator):

```json
{
  "shortcuts": {
    "previous": "Alt+Left",
    "playPause": "Alt+Space",
    "next": "Alt+Right"
  }
}
```

## Development

```bash
npm install
npm start
```

### Build

```bash
npm run dist          # Build all platforms
npm run dist:linux    # Build Linux only
npm run dist:win      # Build Windows only
npm run dist:mac      # Build macOS only
```

## License

MIT
