export type OutputFormat = 'react' | 'bootstrap';

export interface GenerationState {
  status: 'idle' | 'processing' | 'generating' | 'completed' | 'error';
  message?: string;
  error?: string;
}

export interface GeneratedResult {
  code: string;
  explanation?: string;
}

export interface PdfPage {
  pageNumber: number;
  imageData: string; // Base64
}