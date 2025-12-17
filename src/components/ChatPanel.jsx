import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Loader2, AlertCircle } from 'lucide-react';

const ChatPanel = ({ name, icon: Icon, color, content, loading, error }) => {
    return (
        <div className={`flex flex-col h-full bg-slate-900 border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl`}>
            {/* Header */}
            <div className={`p-4 border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-between sticky top-0 z-10 ${loading ? 'animate-pulse' : ''}`}>
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${color} bg-opacity-20`}>
                        <Icon className={`w-5 h-5 ${color.replace('bg-', 'text-')}`} />
                    </div>
                    <h2 className="font-semibold text-lg text-white">{name}</h2>
                </div>
                {loading && <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 scroll-smooth custom-scrollbar">
                {error ? (
                    <div className="flex flex-col items-center justify-center h-full text-red-400 gap-2 p-4 text-center">
                        <AlertCircle className="w-8 h-8" />
                        <p>{error}</p>
                    </div>
                ) : content ? (
                    <div className="prose prose-invert prose-slate max-w-none prose-p:leading-relaxed prose-headings:text-slate-100 prose-a:text-indigo-400 prose-code:bg-slate-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-slate-950 prose-pre:border prose-pre:border-slate-800">
                        <ReactMarkdown>{content}</ReactMarkdown>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-2">
                        <div className={`w-12 h-12 rounded-full bg-slate-800/50 flex items-center justify-center mb-2`}>
                            <Icon className="w-6 h-6 opacity-30" />
                        </div>
                        <p className="text-sm">Ready to chat</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatPanel;
