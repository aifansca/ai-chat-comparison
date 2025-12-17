
// This script runs BEFORE the web page loads.
// It is critical for hiding Electron from Google's detection scripts.

// 1. Delete the node `process` object if it leaked (shouldn't with contextIsolation, but safe to do)
if (window.process) {
    delete window.process;
}

// 2. Hide common Electron/Node globals
const DELETE_GLOBALS = ['require', 'module', 'exports', '__dirname', '__filename'];
DELETE_GLOBALS.forEach(g => {
    if (window[g]) delete window[g];
});

// 3. Spoof `navigator` properties that might betray us
try {
    // Hide "automation" flag
    Object.defineProperty(navigator, 'webdriver', {
        get: () => false,
    });

    // Mock plugins to look like a real browser (often empty in Electron)
    if (navigator.plugins.length === 0) {
        // This is a rough mock, but better than strict empty vs Chrome
        Object.defineProperty(navigator, 'plugins', {
            get: () => [1, 2, 3], // Dummy length
        });
    }

    // Mock languages
    Object.defineProperty(navigator, 'languages', {
        get: () => ['en-US', 'en'],
    });
} catch (e) {
    console.error("Spoofing error", e);
}

console.log("Environment scrubbed for Google Login");
