const {app, BrowserWindow, Menu, globalShortcut} = require('electron')

let win

function ready() {
    Menu.setApplicationMenu(null)
    win = new BrowserWindow({
        width: 8000,
        height: 6000,
        fullscreenable: true,
        images: true,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        }
    })
    win.maximize()

    // Use a recent Chrome user agent
    win.loadURL("https://music.youtube.com", {
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0"
    })

    win.on('closed', () => {
        win = null
    })

    // Keyboard shortcuts - use both accelerator shortcuts AND media keys
    // These send keyboard events to the web content which YT Music responds to

    // Ctrl+Shift+Left  -> Previous
    globalShortcut.register('CommandOrControl+Shift+Left', () => {
        win.webContents.sendInputEvent({ type: 'keyDown', keyCode: 'MediaTrackPrevious', modifiers: [] })
        win.webContents.sendInputEvent({ type: 'keyUp', keyCode: 'MediaTrackPrevious', modifiers: [] })
        // Also try dispatching a keyboard event as fallback
        dispatchKeyEvent(win, 'MediaTrackPrevious')
    })

    // Ctrl+Shift+Enter -> Play/Pause
    globalShortcut.register('CommandOrControl+Shift+Enter', () => {
        win.webContents.sendInputEvent({ type: 'keyDown', keyCode: 'MediaPlayPause', modifiers: [] })
        win.webContents.sendInputEvent({ type: 'keyUp', keyCode: 'MediaPlayPause', modifiers: [] })
        dispatchKeyEvent(win, 'MediaPlayPause')
    })

    // Ctrl+Shift+Right -> Next
    globalShortcut.register('CommandOrControl+Shift+Right', () => {
        win.webContents.sendInputEvent({ type: 'keyDown', keyCode: 'MediaTrackNext', modifiers: [] })
        win.webContents.sendInputEvent({ type: 'keyUp', keyCode: 'MediaTrackNext', modifiers: [] })
        dispatchKeyEvent(win, 'MediaTrackNext')
    })

    // Ctrl+Shift+Up   -> Thumbs Up
    globalShortcut.register('CommandOrControl+Shift+Up', () => {
        // Try keyboard shortcut: Shift+Alt+B is YT Music's thumbs up
        win.webContents.sendInputEvent({ type: 'keyDown', keyKey: 'b', modifiers: ['shift', 'alt'] })
        win.webContents.sendInputEvent({ type: 'keyUp', keyCode: 'b', modifiers: ['shift', 'alt'] })
        // Also try CSS selector as fallback
        clickSelector(win, '.yt-spec-touch-feedback-shape--touch-response .yt-spec-touch-feedback-shape__fill')
    })

    // Ctrl+Shift+Down -> Thumbs Down
    globalShortcut.register('CommandOrControl+Shift+Down', () => {
        win.webContents.sendInputEvent({ type: 'keyDown', keyCode: 'b', modifiers: ['shift', 'alt', 'ctrl'] })
        win.webContents.sendInputEvent({ type: 'keyUp', keyCode: 'b', modifiers: ['shift', 'alt', 'ctrl'] })
    })

    // Standard media keys (no modifier needed)
    globalShortcut.register('MediaPreviousTrack', () => {
        dispatchKeyEvent(win, 'MediaTrackPrevious')
        // Fallback: try clicking the button via DOM
        clickYTMButton(win, 'previous-button')
    })
    globalShortcut.register('MediaPlayPause', () => {
        dispatchKeyEvent(win, 'MediaPlayPause')
        clickYTMButton(win, 'play-pause-button')
    })
    globalShortcut.register('MediaNextTrack', () => {
        dispatchKeyEvent(win, 'MediaTrackNext')
        clickYTMButton(win, 'next-button')
    })
}

/**
 * Dispatch a keyboard event to the page.
 * YouTube Music listens for keyboard/media events, not just clicks.
 */
function dispatchKeyEvent(window, keyCode) {
    if (!window || window.isDestroyed()) return
    window.webContents.executeJavaScript(`
        (function() {
            const event = new KeyboardEvent('keydown', {
                key: '${keyCode}',
                code: '${keyCode}',
                bubbles: true,
                cancelable: true
            });
            document.activeElement ? document.activeElement.dispatchEvent(event) : document.dispatchEvent(event);
        })();
    `).catch(() => {})
}

/**
 * Try to click a YouTube Music player bar button.
 * YT Music uses shadow DOM, so we pierce through shadow roots.
 */
function clickYTMButton(window, buttonName) {
    if (!window || window.isDestroyed()) return
    window.webContents.executeJavaScript(`
        (function() {
            // Try to find the player bar and its buttons through shadow DOM
            const player = document.querySelector('ytmusic-player-bar');
            if (player && player.shadowRoot) {
                const buttons = player.shadowRoot.querySelectorAll('${buttonName}');
                if (buttons.length > 0) { buttons[0].click(); return; }
            }
            // Fallback: try aria-label selectors
            const btn = document.querySelector('[aria-label="${buttonName}"]') ||
                        document.querySelector('[title="${buttonName}"]') ||
                        document.querySelector('.' + '${buttonName}');
            if (btn) { btn.click(); return; }
            // Last resort: try data attributes
            const dataBtn = document.querySelector('[data-icon-name="${buttonName}"]');
            if (dataBtn) { dataBtn.click(); }
        })();
    `).catch(() => {})
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
