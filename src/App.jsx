import React, { useState, useRef } from 'react';
import { Send, Settings, AlertTriangle } from 'lucide-react';
import WebviewPanel from './components/WebviewPanel';
import InputArea from './components/InputArea';

function App() {
  const gptWebviewRef = useRef(null);
  const geminiWebviewRef = useRef(null);
  const [showWarning, setShowWarning] = useState(true);

  // Injection Scripts
  // Updated for late 2024 selectors (estimated)
  // These are BRITTLE and will likely need tuning.

  const injectGeneric = (text, selector) => `
    const tryFill = () => {
      const el = document.querySelector('${selector}');
      if (el) {
        el.focus();
        el.textContent = ${JSON.stringify(text)}; 
        // Newer frameworks need input events to register changes
        el.dispatchEvent(new Event('input', { bubbles: true }));
        
        // Try to find send button or simulate enter
        setTimeout(() => {
           // Common strategy: enter key on the input
           const enterEvent = new KeyboardEvent('keydown', {
             bubbles: true, cancelable: true, key: 'Enter', code: 'Enter', keyCode: 13
           });
           el.dispatchEvent(enterEvent);
        }, 100);
        return true;
      }
      return false;
    }
    tryFill();
  `;

  // ChatGPT Specifics
  // Often uses a contenteditable div or textarea.
  const injectChatGPT = (text) => `
    (function() {
      const el = document.querySelector('#prompt-textarea');
      if (el) {
        el.focus();
        el.innerText = ${JSON.stringify(text)};
        el.dispatchEvent(new Event('input', { bubbles: true }));
        
        setTimeout(() => {
            const btn = document.querySelector('[data-testid="send-button"]');
            if(btn) {
                btn.click();
            } else {
                 const enterEvent = new KeyboardEvent('keydown', {
                    bubbles: true, cancelable: true, key: 'Enter', code: 'Enter', keyCode: 13
                 });
                 el.dispatchEvent(enterEvent);
            }
        }, 500);
      } else {
        console.log("Input not found");
      }
    })();
  `;

  // Gemini Specifics
  const injectGemini = (text) => `
    (function() {
      // Gemini often uses complex rich text editors.
      // Selector strategy: contenteditable div inside the main input area
      const el = document.querySelector('div[contenteditable="true"]'); 
      // Fallback or specific class searches might be needed
      
      if (el) {
        el.focus();
        el.innerText = ${JSON.stringify(text)}; 
        el.dispatchEvent(new Event('input', { bubbles: true }));
        
        // Wait and click send
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

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-50 overflow-hidden">
      {/* Header */}
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
