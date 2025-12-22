import { app, BrowserWindow, screen, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import LicenseManager from './license.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize License Manager
const licenseManager = new LicenseManager(app.getPath('userData'));

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

    // Handle License IPC
    ipcMain.handle('license:activate', async (event, key) => {
        const instanceName = 'MacBook-User'; // Ideally get hostname
        return await licenseManager.activate(key, instanceName);
    });

    ipcMain.handle('license:check', async () => {
        return await licenseManager.validate();
    });

    // Check License on Launch
    const license = licenseManager.getLicense();
    let isActivated = false;

    // Simple check: do we have a file? 
    // Ideally we validate online here, but to avoid blocking UI startup, 
    // we let the frontend trigger the validation or just rely on file existence first.
    if (license && license.key) {
        isActivated = true;
    }

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

    // We load the app regardless, but we can pass the license state to the renderer
    // Alternatively, we could load a separate 'gate.html'
    // For React Single Page Apps, it's often better to load the App and let React render the Gate component.
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
