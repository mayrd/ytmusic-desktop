const {app, BrowserWindow, Menu, globalShortcut} = require('electron')
const fs = require('fs')
const path = require('path')
const os = require('os')

let win

// ============================================================
// Config: load from ~/.config/ytmusic-desktop/config.json
// ============================================================
const CONFIG_DIR = path.join(os.homedir(), '.config', 'ytmusic-desktop')
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json')

const DEFAULT_CONFIG = {
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

function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const raw = fs.readFileSync(CONFIG_FILE, 'utf-8')
      const user = JSON.parse(raw)
      return deepMerge(DEFAULT_CONFIG, user)
    }
  } catch (e) {
    console.error('Failed to load config:', e.message)
  }
  return {...DEFAULT_CONFIG}
}

function deepMerge(target, source) {
  const result = {...target}
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key]) &&
        target[key] && typeof target[key] === 'object') {
      result[key] = deepMerge(target[key], source[key])
    } else {
      result[key] = source[key]
    }
  }
  return result
}

function createDefaultConfig() {
  try {
    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, {recursive: true})
    }
    if (!fs.existsSync(CONFIG_FILE)) {
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(DEFAULT_CONFIG, null, 2) + '\n')
      console.log('Created default config at', CONFIG_FILE)
    }
  } catch (e) {
    console.error('Failed to create config:', e.message)
  }
}

// ============================================================
// App
// ============================================================
function ready() {
  const config = loadConfig()
  createDefaultConfig()

  Menu.setApplicationMenu(null)

  const winConfig = config.window || {}
  win = new BrowserWindow({
    width: winConfig.width || 8000,
    height: winConfig.height || 6000,
    fullscreenable: true,
    images: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  if (winConfig.maximize !== false) {
    win.maximize()
  }

  win.loadURL("https://music.youtube.com", {
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0"
  })

  win.on('closed', () => {
    win = null
  })

  registerShortcuts(config)

  console.log('Config loaded from:', CONFIG_FILE)
  console.log('Shortcuts enabled:', config.shortcuts.enabled)
  console.log('Media keys enabled:', config.mediaKeys.enabled)
}

function registerShortcuts(config) {
  const sc = config.shortcuts || {}
  const mk = config.mediaKeys || {}

  function regIf(accelerator, fn) {
    if (!accelerator) return
    try {
      const ok = globalShortcut.register(accelerator, fn)
      if (!ok) {
        console.error('Failed to register shortcut:', accelerator)
      }
    } catch (e) {
      console.error('Error registering shortcut:', accelerator, e.message)
    }
  }

  if (sc.enabled !== false) {
    regIf(sc.previous, () => dispatchKeyEvent(win, 'MediaTrackPrevious'))
    regIf(sc.playPause, () => dispatchKeyEvent(win, 'MediaPlayPause'))
    regIf(sc.next, () => dispatchKeyEvent(win, 'MediaTrackNext'))
    regIf(sc.thumbsUp, () => {
      win.webContents.sendInputEvent({type: 'keyDown', keyCode: 'b', modifiers: ['shift', 'alt']})
      win.webContents.sendInputEvent({type: 'keyUp', keyCode: 'b', modifiers: ['shift', 'alt']})
    })
    regIf(sc.thumbsDown, () => {
      win.webContents.sendInputEvent({type: 'keyDown', keyCode: 'b', modifiers: ['shift', 'alt', 'ctrl']})
      win.webContents.sendInputEvent({type: 'keyUp', keyCode: 'b', modifiers: ['shift', 'alt', 'ctrl']})
    })
  }

  if (mk.enabled !== false) {
    regIf('MediaPreviousTrack', () => {
      dispatchKeyEvent(win, 'MediaTrackPrevious')
      clickYTMButton(win, 'previous-button')
    })
    regIf('MediaPlayPause', () => {
      dispatchKeyEvent(win, 'MediaPlayPause')
      clickYTMButton(win, 'play-pause-button')
    })
    regIf('MediaNextTrack', () => {
      dispatchKeyEvent(win, 'MediaTrackNext')
      clickYTMButton(win, 'next-button')
    })
  }
}

function dispatchKeyEvent(window, keyCode) {
  if (!window || window.isDestroyed()) return
  window.webContents.executeJavaScript(
    "(function(){const e=new KeyboardEvent('keydown',{key:'" + keyCode + "',code:'" + keyCode + "',bubbles:true,cancelable:true});(document.activeElement||document).dispatchEvent(e);})();"
  ).catch(() => {})
}

function clickYTMButton(window, buttonName) {
  if (!window || window.isDestroyed()) return
  const escaped = buttonName.replace(/'/g, "\\'")
  window.webContents.executeJavaScript(
    "(function(){const p=document.querySelector('ytmusic-player-bar');if(p&&p.shadowRoot){const b=p.shadowRoot.querySelector('" + escaped + "');if(b){b.click();return;}}const b=document.querySelector('[aria-label=\"" + escaped + "\"]')||document.querySelector('[title=\"" + escaped + "\"]')||document.querySelector('." + escaped + "');if(b){b.click();}})();"
  ).catch(() => {})
}

app.on('ready', ready)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
app.on('activate', () => {
  if (win === null) {
    ready()
  }
})
