import { app, BrowserWindow, screen } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Hide automation flags
app.commandLine.appendSwitch('disable-blink-features', 'AutomationControlled');
app.commandLine.appendSwitch('disable-site-isolation-trials');
// Disable WebAuthn to avoid Bluetooth/FIDO errors in dev build
app.commandLine.appendSwitch('disable-features', 'WebAuthentication');

let mainWindow;

function createWindow() {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;

    mainWindow = new BrowserWindow({
        width: width,
        height: height,
        webPreferences: {
            webviewTag: true, // Required for the app's core functionality
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: true,
            webSecurity: true,
            preload: path.join(__dirname, 'preload.js')
        },
    });

    // USER SUGGESTED FIX: Dynamic User-Agent Cleaning
    const originalUserAgent = mainWindow.webContents.userAgent;
    const cleanUserAgent = originalUserAgent.replace(/Electron\/[0-9\.]+\s/, '');

    // Set globally for this window
    mainWindow.webContents.userAgent = cleanUserAgent;
    app.userAgentFallback = cleanUserAgent; // Fallback for new windows/webviews

    console.log("Spoofed User-Agent:", cleanUserAgent);

    // CRITICAL: Strip "Electron" from headers to fool Google
    mainWindow.webContents.session.webRequest.onBeforeSendHeaders((details, callback) => {
        const { requestHeaders } = details;

        // Force the clean User-Agent
        requestHeaders['User-Agent'] = cleanUserAgent;

        // Spoof Client Hints to match Chrome 131 on macOS
        requestHeaders['Sec-CH-UA'] = '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"';
        requestHeaders['Sec-CH-UA-Mobile'] = '?0';
        requestHeaders['Sec-CH-UA-Platform'] = '"macOS"';

        // Remove version markers if they exist to be safe
        delete requestHeaders['Sec-CH-UA-Full-Version'];
        delete requestHeaders['Sec-CH-UA-Full-Version-List'];

        callback({ requestHeaders, cancel: false });
    });

    // Intercept webview creation to inject our "Scrubbing" preload script
    mainWindow.webContents.on('will-attach-webview', (event, webPreferences, params) => {
        // Strip away Electron integration features strictly
        webPreferences.nodeIntegration = false;
        webPreferences.contextIsolation = false; // Must be false to allow spoofing logic to run in main world
        webPreferences.preload = path.join(__dirname, 'preload-webview.js');

        // Disable security-sensitive features that might flag bots
        webPreferences.disableBlinkFeatures = 'AutomationControlled';
    });

    const startUrl = process.env.VITE_DEV_SERVER_URL || `file://${path.join(__dirname, '../dist/index.html')}`;

    mainWindow.loadURL(startUrl);

    // Open DevTools in development
    if (process.env.VITE_DEV_SERVER_URL) {
        mainWindow.webContents.openDevTools({ mode: 'detach' });
    }

    mainWindow.on('closed', () => (mainWindow = null));
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});
