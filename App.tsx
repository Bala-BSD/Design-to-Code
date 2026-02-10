import React, { useState } from 'react';
import { PdfUploader } from './components/PdfUploader';
import { CodeViewer } from './components/CodeViewer';
import { generateCodeFromImage } from './services/geminiService';
import { GenerationState, OutputFormat } from './types';
import { Sparkles, ArrowRight, Code2, FileCode, FileType } from 'lucide-react';

const App: React.FC = () => {
  const [generationState, setGenerationState] = useState<GenerationState>({ status: 'idle' });
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('react');

  const handleImageReady = (images: string[]) => {
    setCurrentImages(images);
    setGenerationState({ status: 'idle' });
    setGeneratedCode('');
  };

  const handleGenerate = async () => {
    if (currentImages.length === 0) return;

    setGenerationState({ status: 'generating' });
    
    try {
      const code = await generateCodeFromImage(currentImages, outputFormat);
      setGeneratedCode(code);
      setGenerationState({ status: 'completed' });
    } catch (error) {
      console.error(error);
      setGenerationState({ 
        status: 'error', 
        error: "Failed to generate code. Please check your API key and try again." 
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#0f1117] text-slate-900 dark:text-slate-200 font-sans selection:bg-blue-500/30">
      
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#0f1117]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img
              src="/design-to-code-icon.png"
              alt="Design to Code"
              className="h-12 w-auto object-contain"
            />
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
              Design to Code
            </h1>
          </div>
          <img
            src="/brandstory-logo.png"
            alt="BRANDSTORY"
            className="h-12 w-auto object-contain"
          />
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
          
          {/* Left Column: Upload & Preview */}
          <div className="flex flex-col space-y-6 h-full">
            <div className="flex-none">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white flex items-center">
                <span className="mr-2 text-slate-400">1.</span> Upload Design
              </h2>
              <p className="mt-2 text-slate-500 dark:text-slate-400">
                Upload your UI PDF. We'll extract all pages and analyze the full layout.
              </p>
            </div>
            
            <div className="flex-1 min-h-0">
               <PdfUploader 
                 onImageReady={handleImageReady} 
                 status={generationState.status}
               />
            </div>

            <div className="flex-none pt-4 space-y-4">
              {/* Output Format Selection */}
              <div className="bg-slate-100 dark:bg-slate-900 p-1 rounded-xl flex">
                <button
                  onClick={() => setOutputFormat('react')}
                  className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    outputFormat === 'react' 
                      ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  <FileCode className="w-4 h-4" />
                  <span>React + Tailwind</span>
                </button>
                <button
                  onClick={() => setOutputFormat('bootstrap')}
                  className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    outputFormat === 'bootstrap' 
                      ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  <FileType className="w-4 h-4" />
                  <span>HTML + Bootstrap</span>
                </button>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={currentImages.length === 0 || generationState.status === 'generating'}
                className={`
                  w-full py-4 px-6 rounded-xl font-bold text-lg shadow-xl transition-all duration-300 flex items-center justify-center space-x-2
                  ${currentImages.length === 0 || generationState.status === 'generating'
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/25 hover:shadow-blue-500/40 transform hover:-translate-y-0.5'
                  }
                `}
              >
                {generationState.status === 'generating' ? (
                  <>
                    <Sparkles className="w-5 h-5 animate-spin" />
                    <span>Generating Code...</span>
                  </>
                ) : (
                  <>
                    <Code2 className="w-5 h-5" />
                    <span>Convert to {outputFormat === 'react' ? 'React' : 'Bootstrap'}</span>
                    <ArrowRight className="w-5 h-5 ml-1 opacity-70" />
                  </>
                )}
              </button>
              {generationState.status === 'error' && (
                <p className="mt-3 text-red-500 text-sm text-center font-medium">
                  {generationState.error}
                </p>
              )}
            </div>
          </div>

          {/* Right Column: Code Output */}
          <div className="flex flex-col space-y-6 h-full">
            <div className="flex-none">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white flex items-center">
                <span className="mr-2 text-slate-400">2.</span> Generated Code
              </h2>
              <p className="mt-2 text-slate-500 dark:text-slate-400">
                Get production-ready {outputFormat === 'react' ? 'React' : 'Bootstrap'} code generated instantly.
              </p>
            </div>

            <div className="flex-1 min-h-0">
              <CodeViewer 
                code={generatedCode} 
                isGenerating={generationState.status === 'generating'}
                format={outputFormat}
              />
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center justify-center gap-3 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400 tracking-wide">
              © {new Date().getFullYear()} Design to Code. All rights reserved.
            </p>
            <span className="text-slate-400 dark:text-slate-500"></span>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300 tracking-tight">
              Crafted by{' '}
              <a
                href="https://brandstory.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors underline underline-offset-2 decoration-slate-300 dark:decoration-slate-600 hover:decoration-blue-500"
              >
                BrandStory
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;