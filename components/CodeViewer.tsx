import React, { useState } from 'react';
import { Copy, Check, Code, Play } from 'lucide-react';
import { OutputFormat } from '../types';

interface CodeViewerProps {
  code: string;
  isGenerating: boolean;
  format?: OutputFormat;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({ code, isGenerating, format = 'react' }) => {
  const [copied, setCopied] = useState(false);

  // Simple function to strip markdown code fences if present
  const cleanCode = (raw: string) => {
    return raw.replace(/^```(tsx|jsx|javascript|typescript|react|html|xml)?\n/, '').replace(/```$/, '');
  };

  const displayCode = cleanCode(code);

  const handleCopy = () => {
    navigator.clipboard.writeText(displayCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fileName = format === 'react' ? 'App.tsx' : 'index.html';
  // Use purple for Bootstrap to distinguish from React (Blue) and HTML/Tailwind (Orange)
  const fileColor = format === 'react' ? 'text-blue-400' : 'text-purple-400';

  if (!code && !isGenerating) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-8 border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/30">
        <Code className="w-12 h-12 mb-4 opacity-50" />
        <p className="text-center font-medium">Generated code will appear here</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-[#1e1e1e] rounded-xl overflow-hidden shadow-xl border border-slate-800">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-[#252526]">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
          </div>
          <span className={`ml-3 text-xs font-mono ${fileColor}`}>{fileName}</span>
        </div>
        <div className="flex items-center space-x-2">
            <button
            onClick={handleCopy}
            disabled={isGenerating}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/15 text-white rounded-md text-xs font-medium transition-colors disabled:opacity-50"
            >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Code'}</span>
            </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden relative">
        {isGenerating ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
                <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                </div>
                <p className="text-slate-400 text-sm font-mono animate-pulse">
                  Writing {format === 'react' ? 'React' : 'Bootstrap'} code...
                </p>
            </div>
        ) : (
            <pre className="w-full h-full overflow-auto p-4 text-sm font-mono text-slate-300 custom-scrollbar">
            <code>{displayCode}</code>
            </pre>
        )}
      </div>
    </div>
  );
};