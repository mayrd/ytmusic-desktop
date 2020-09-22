# ytmusic-desktop
UNOFFICIAL: YouTube Music as a desktop application which you can control with your media keys.

## Binaries

Find the latest binaries (mac, win, linux 64) in https://github.com/mayrd/ytmusic-desktop/releases

## Usage
When you start the app, it opens https://music.youtube.com. In order to use it properly, login with your Google account.
After you started you can simply use your Media Keys on your Keyboard or use the alternative key mapping.

| Function | Key | Alternative Key |
|----------|-----|-----------------|
|Play or Pause Playback| ⏯ | <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>Enter</kbd>|
|Next Song| ⏭ | <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>→</kbd>|
|Previous Song| ⏮ | <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>←</kbd>|
|Thumbs Up| - | <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>↑</kbd>|
|Thumbs Down| - | <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>↓</kbd>|

## Build yourself
The application is built with electron (http://electronjs.org). Install nodejs, download the package, install packages with `npm install` and run `npm start`.

### Looking for an Installer?
Build the packages with `npm run build-mac64` or `npm run build-linux64` or `npm run build-win32`.

If you need .dmg, .deb or anything related, use the specific installer, i.e. (install with `npm electron-installer-debian -g`):

`electron-installer-debian --src release-builds/ytmusic-linux-x64/ --dest release-builds/ --arch amd64 --icon media/logo.png`
