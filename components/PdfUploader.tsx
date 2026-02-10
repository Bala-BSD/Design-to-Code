import React, { useCallback, useState, useEffect } from 'react';
import { Upload, X, CheckCircle, Loader2, ScanEye } from 'lucide-react';
import { convertPdfToImages } from '../utils/pdfUtils';
import { GenerationState } from '../types';

interface PdfUploaderProps {
  onImageReady: (images: string[]) => void;
  status: GenerationState['status'];
}

export const PdfUploader: React.FC<PdfUploaderProps> = ({ onImageReady, status }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  
  // Loading states
  const [processingPdf, setProcessingPdf] = useState(false);
  const [progress, setProgress] = useState<{current: number, total: number} | null>(null);
  
  // Analysis Phase Text
  const [analysisText, setAnalysisText] = useState("Initializing Vision...");
  
  // Cycle through "AI Thoughts" based on the user's provided stages
  useEffect(() => {
    if (status !== 'generating') return;

    const stages = [
      "Stage 1: Normalizing Pixel Grid...",
      "Stage 2: Breaking into 16x16 Patches...",
      "Stage 3: Calculating Attention Maps...",
      "Stage 4: Detecting UI Objects (YOLO)...",
      "Stage 5: Measuring Spatial Distances...",
      "Stage 6: Analyzing Typography Hierarchy...",
      "Stage 7: Semantic Layout Understanding...",
      "Generating React Code..."
    ];

    let i = 0;
    const interval = setInterval(() => {
      setAnalysisText(stages[i]);
      i = (i + 1) % stages.length;
    }, 1200); 

    return () => clearInterval(interval);
  }, [status]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFile = async (file: File) => {
    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file.');
      return;
    }

    setProcessingPdf(true);
    setProgress({ current: 0, total: 1 }); 
    setFileName(file.name);

    try {
      const pages = await convertPdfToImages(file, (current, total) => {
        setProgress({ current, total });
      });

      if (pages.length > 0) {
        // Collect all image data
        const images = pages.map(p => p.imageData);
        
        // Prepare preview URLs
        const previewUrls = images.map(img => {
          const prefix = img.startsWith('/9j/') ? 'data:image/jpeg;base64,' : 'data:image/png;base64,';
          return `${prefix}${img}`;
        });

        setPreviewImages(previewUrls);
        onImageReady(images);
      }
    } catch (error) {
      console.error(error);
      alert('Failed to process PDF. Please try another file.');
      setFileName(null);
    } finally {
      setProcessingPdf(false);
      setProgress(null);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (status === 'generating' || status === 'processing' || processingPdf) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  }, [status, processingPdf]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const clearFile = () => {
    setPreviewImages([]);
    setFileName(null);
    onImageReady([]); 
  };

  return (
    <div className="w-full h-full flex flex-col">
      {previewImages.length === 0 ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-8 transition-all duration-200 relative overflow-hidden
            ${isDragging 
              ? 'border-blue-500 bg-blue-50/10' 
              : 'border-slate-300 dark:border-slate-700 hover:border-blue-400 hover:bg-slate-50/5'
            }
          `}
        >
          {processingPdf ? (
            <div className="flex flex-col items-center z-10 w-full max-w-xs animate-in fade-in duration-300">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 rounded-full"></div>
                <Loader2 className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin relative z-10" />
              </div>
              
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Scanning Full PDF...
              </h3>
              
              {/* Progress Bar */}
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mb-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress ? (progress.current / progress.total) * 100 : 0}%` }}
                ></div>
              </div>
              
              <p className="text-sm text-slate-500 dark:text-slate-400 font-mono">
                High-Res Conversion: Page {progress?.current} of {progress?.total}
              </p>
            </div>
          ) : (
            <>
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-200">
                <Upload className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Upload Design PDF
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-center mb-6 max-w-xs text-sm leading-relaxed">
                Drag & drop your UI design PDF here. We handle long-scrolling files automatically.
              </p>
              <label className="relative group">
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf"
                  onChange={handleFileSelect}
                />
                <span className="cursor-pointer bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-2.5 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0">
                  Browse Files
                </span>
              </label>
            </>
          )}
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0 bg-slate-50 dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
             <div className="flex items-center space-x-3">
               <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                 <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
               </div>
               <div>
                 <p className="text-sm font-medium text-slate-900 dark:text-white truncate max-w-[200px]">
                   {fileName}
                 </p>
                 <p className="text-xs text-green-600 dark:text-green-400 flex items-center">
                   <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>
                   {previewImages.length} High-Res Slices
                 </p>
               </div>
             </div>
             {status !== 'generating' && (
               <button 
                 onClick={clearFile}
                 className="p-2 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 rounded-lg transition-colors text-slate-500"
               >
                 <X className="w-5 h-5" />
               </button>
             )}
          </div>
          
          <div className="flex-1 overflow-auto p-4 bg-slate-100 dark:bg-black/50 custom-scrollbar relative">
            <div className="relative shadow-2xl rounded-lg inline-block min-w-full bg-white ring-1 ring-black/5 overflow-hidden">
               
               {/* Render All Slices Vertical - gap-0 for seamless look */}
               <div className={`flex flex-col gap-0 transition-opacity duration-500 ${status === 'generating' ? 'opacity-80' : 'opacity-100'}`}>
                  {previewImages.map((src, idx) => (
                    <img 
                      key={idx}
                      src={src} 
                      alt={`Slice ${idx + 1}`} 
                      className="w-full h-auto block" // Removed rounded/shadow from individual images to look like one piece
                    />
                  ))}
               </div>
               
               {/* VISUAL VISION ANALYSIS OVERLAY */}
               {status === 'generating' && (
                 <>
                   {/* Scanning Beam */}
                   <div className="scan-line">
                      <div className="scan-overlay"></div>
                   </div>
                   
                   {/* Stage 2: Patch Grid Overlay */}
                   <div className="absolute inset-0 vision-grid pointer-events-none z-10 h-full"></div>
                   
                   {/* Status HUD */}
                   <div className="sticky top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 w-full flex justify-center pointer-events-none">
                     <div className="bg-slate-900/90 backdrop-blur-md text-white px-8 py-6 rounded-2xl shadow-2xl border border-blue-500/30 flex flex-col items-center pointer-events-auto">
                        <div className="relative w-16 h-16 mb-4">
                           <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping"></div>
                           <div className="relative w-full h-full bg-slate-800 rounded-full flex items-center justify-center border border-blue-400">
                              <ScanEye className="w-8 h-8 text-blue-400" />
                           </div>
                        </div>
                        <p className="text-blue-300 text-xs font-mono uppercase tracking-widest mb-1">Gemini Vision AI</p>
                        <h3 className="text-xl font-bold font-mono text-center min-w-[280px]">
                           {analysisText}
                        </h3>
                     </div>
                   </div>
                 </>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};