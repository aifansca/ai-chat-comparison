import React, { useState, useRef, useEffect } from 'react';
import { Send, Settings, AlertTriangle } from 'lucide-react';
import WebviewPanel from './components/WebviewPanel';
import InputArea from './components/InputArea';
import LicenseGate from './components/LicenseGate'; // [NEW] Import License Gate

function App() {
  const gptWebviewRef = useRef(null);
  const geminiWebviewRef = useRef(null);
  const [showWarning, setShowWarning] = useState(true);

  // [NEW] License State
  const [isLicensed, setIsLicensed] = useState(false);
  const [checkingLicense, setCheckingLicense] = useState(true);

  // [NEW] Check license on mount
  useEffect(() => {
    const checkLicense = async () => {
      try {
        // window.myAppAPI is exposed by electron/preload.js
        if (window.myAppAPI) {
          const result = await window.myAppAPI.checkLicense();
          if (result && result.valid) {
            setIsLicensed(true);
          }
        } else {
          // Fallback for dev mode without Electron (optional)
          // setTimeout(() => setIsLicensed(true), 1000); 
        }
      } catch (e) {
        console.error("License check failed:", e);
      } finally {
        setCheckingLicense(false);
      }
    };

    checkLicense();
  }, []);

  // Injection Scripts
  const injectChatGPT = (text) => `
    (function () {
      const el = document.querySelector('#prompt-textarea');
      if (el) {
        el.focus();
        el.innerText = ${JSON.stringify(text)};
        el.dispatchEvent(new Event('input', { bubbles: true }));
        setTimeout(() => {
          const btn = document.querySelector('[data-testid="send-button"]');
          if (btn) btn.click();
          else {
            const enterEvent = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'Enter', code: 'Enter', keyCode: 13 });
            el.dispatchEvent(enterEvent);
          }
        }, 500);
      }
    })();
  `;

  const injectGemini = (text) => `
    (function () {
      const el = document.querySelector('div[contenteditable="true"]');
      if (el) {
        el.focus();
        el.innerText = ${JSON.stringify(text)};
        el.dispatchEvent(new Event('input', { bubbles: true }));
        setTimeout(() => {
          const btn = document.querySelector('.send-button') || document.querySelector('button[aria-label*="Send"]');
          if (btn) btn.click();
        }, 500);
      }
    })();
  `;

  const handleSend = (text) => {
    if (gptWebviewRef.current) {
      try {
        gptWebviewRef.current.executeJavaScript(injectChatGPT(text));
      } catch (e) { console.error("GPT Inject Error", e); }
    }
    if (geminiWebviewRef.current) {
      try {
        geminiWebviewRef.current.executeJavaScript(injectGemini(text));
      } catch (e) { console.error("Gemini Inject Error", e); }
    }
  };

  // [NEW] Conditional Rendering for License Gate
  if (checkingLicense) {
    return <div className="h-screen w-screen bg-gray-900 flex items-center justify-center text-white">Loading...</div>;
  }

  if (!isLicensed) {
    return <LicenseGate onActivated={() => setIsLicensed(true)} />;
  }

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-50 overflow-hidden">
      {/* Header - Only shown for warning or controls */}
      {showWarning && (
        <header className="flex items-center justify-center px-6 py-2 bg-slate-900 border-b border-slate-800 z-50">
          <div className="flex items-center gap-2 bg-yellow-500/10 text-yellow-500 text-xs px-3 py-1 rounded-full border border-yellow-500/20">
            <AlertTriangle className="w-3 h-3" />
            <span>Please login manually in both panels. Auto-typing is experimental.</span>
            <button onClick={() => setShowWarning(false)} className="hover:text-white ml-2">×</button>
          </div>
        </header>
      )}

      {/* Main Content - Split Screen Webviews */}
      <main className="flex-1 flex flex-col md:flex-row gap-0 min-h-0 bg-slate-900">
        <WebviewPanel
          ref={gptWebviewRef}
          name="ChatGPT"
          url="https://chatgpt.com/"
          className="flex-1 border-r border-slate-800 rounded-none"
        />
        <WebviewPanel
          ref={geminiWebviewRef}
          name="Gemini"
          url="https://gemini.google.com/"
          className="flex-1 rounded-none"
        />
      </main>

      {/* Global Input */}
      <InputArea onSend={handleSend} />
    </div>
  );
}

export default App;
