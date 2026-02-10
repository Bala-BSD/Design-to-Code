import { PdfPage } from '../types';

// We access the globally loaded pdfjsLib from the CDN script in index.html
declare global {
  interface Window {
    pdfjsLib: any;
  }
}

export const convertPdfToImages = async (
  file: File, 
  onProgress?: (current: number, total: number) => void
): Promise<PdfPage[]> => {
  return new Promise(async (resolve, reject) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const totalPages = pdf.numPages;

      const pagesResult: PdfPage[] = [];

      // Process pages sequentially
      for (let i = 1; i <= totalPages; i++) {
        // Report progress
        if (onProgress) {
          onProgress(i, totalPages);
        }

        const page = await pdf.getPage(i);
        
        // Use high scale for AI clarity
        const scale = 2.0; 
        const viewport = page.getViewport({ scale });
        
        // --- VERTICAL SLICING LOGIC ---
        // If a page is taller than 2500px, we slice it into chunks.
        // This avoids the browser's max canvas size (which causes "White Layout")
        // and ensures the AI gets high-res details for the entire length.
        const CHUNK_HEIGHT = 2500;
        const totalHeight = viewport.height;

        if (totalHeight > CHUNK_HEIGHT + 100) { // Add small buffer
             const numChunks = Math.ceil(totalHeight / CHUNK_HEIGHT);
             
             for (let c = 0; c < numChunks; c++) {
                 const yOffset = c * CHUNK_HEIGHT;
                 // The last chunk might be shorter
                 const currentChunkHeight = Math.min(CHUNK_HEIGHT, totalHeight - yOffset);
                 
                 const canvas = document.createElement('canvas');
                 canvas.width = viewport.width;
                 canvas.height = currentChunkHeight;
                 const context = canvas.getContext('2d');
                 
                 if (!context) {
                   console.error("Canvas context failed");
                   continue;
                 }
                 
                 // Translate the context UP to draw the specific slice into view
                 context.translate(0, -yOffset);
                 
                 await page.render({
                     canvasContext: context,
                     viewport: viewport
                 }).promise;
                 
                 // Export slice
                 const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
                 pagesResult.push({
                     pageNumber: i,
                     imageData: dataUrl.split(',')[1]
                 });
             }
        } else {
             // --- STANDARD RENDER (Short page) ---
             const canvas = document.createElement('canvas');
             canvas.width = viewport.width;
             canvas.height = viewport.height;
             const context = canvas.getContext('2d');
             
             if (!context) throw new Error("Could not create canvas context");

             await page.render({
                 canvasContext: context,
                 viewport: viewport
             }).promise;

             const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
             pagesResult.push({
                 pageNumber: i,
                 imageData: dataUrl.split(',')[1]
             });
        }
      }

      resolve(pagesResult);

    } catch (error) {
      console.error("Error processing PDF:", error);
      reject(error);
    }
  });
};