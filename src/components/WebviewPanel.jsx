import React, { forwardRef, useState } from 'react';
import { RefreshCw } from 'lucide-react';

const WebviewPanel = forwardRef(({ url, isActive, name, className }, ref) => {
    const [isLoading, setIsLoading] = useState(true);

    const handleReload = () => {
        if (ref.current) {
            ref.current.reload();
        }
    };

    return (
        <div className={`flex flex-col h-full bg-slate-900 border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl ${className}`}>
            <div className="bg-slate-800 px-4 py-2 flex items-center justify-between border-b border-slate-700 font-medium text-slate-200">
                <span>{name}</span>
                <button onClick={handleReload} className="p-1 hover:bg-slate-700 rounded transition-colors" title="Reload">
                    <RefreshCw className="w-4 h-4" />
                </button>
            </div>
            <div className="flex-1 relative w-full h-full">
                <webview
                    ref={ref}
                    src={url}
                    className="w-full h-full"
                    allowpopups="true"
                    webpreferences="nativeWindowOpen=yes, contextIsolation=true, nodeIntegration=false, sandbox=true"
                    style={{ width: '100%', height: '100%', display: 'inline-flex' }}
                    useragent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
                />
                {!isActive && (
                    <div className="absolute inset-0 bg-slate-900/10 z-10 pointer-events-none"></div>
                )}
            </div>
        </div>
    );
});

export default WebviewPanel;
