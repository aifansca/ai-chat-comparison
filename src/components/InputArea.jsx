import React, { useState } from 'react';
import { Send, Sparkles } from 'lucide-react';

const InputArea = ({ onSend, disabled }) => {
    const [prompt, setPrompt] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (prompt.trim() && !disabled) {
            onSend(prompt);
            setPrompt('');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <div className="border-t border-slate-700/50 bg-slate-900/80 backdrop-blur-xl p-4 md:p-6 w-full max-w-7xl mx-auto">
            <form onSubmit={handleSubmit} className="relative max-w-4xl mx-auto group">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative flex items-end gap-2 bg-slate-800/80 border border-slate-700 rounded-2xl p-2 shadow-2xl focus-within:ring-2 focus-within:ring-indigo-500/50 focus-within:border-indigo-500/50 transition-all">
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask anything..."
                        disabled={disabled}
                        rows={1}
                        className="w-full bg-transparent border-0 text-white placeholder-slate-400 focus:ring-0 resize-none py-3 px-3 max-h-32 min-h-[3rem] scrollbar-hide"
                        style={{ minHeight: '48px' }}
                    />
                    <button
                        type="submit"
                        disabled={!prompt.trim() || disabled}
                        className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 flex-shrink-0"
                    >
                        {disabled ? (
                            <Sparkles className="w-5 h-5 animate-pulse" />
                        ) : (
                            <Send className="w-5 h-5" />
                        )}
                    </button>
                </div>
                <p className="text-center text-xs text-slate-500 mt-2">
                    Press Return to send. Shift + Return for new line.
                </p>
            </form>
        </div>
    );
};

export default InputArea;
