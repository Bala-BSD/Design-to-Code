import { GoogleGenAI } from "@google/genai";
import { OutputFormat } from "../types";

export const generateCodeFromImage = async (base64Images: string[], format: OutputFormat): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = `
    You are an expert Frontend Engineer and UI/UX Designer who processes designs using a strict **7-Stage AI Vision Analysis** protocol before coding.
    
    **YOUR PROCESS (INTERNAL VISION ANALYSIS):**
    
    1.  **Segmentation**: The input images are **VERTICAL SLICES** of a single long-scrolling page (or multiple pages of a design). You must stitch them mentally into one continuous layout. Do not treat them as separate screens unless they are clearly distinct pages.
    2.  **Object Detection**: Mentally draw bounding boxes around every UI element (Buttons, Input fields, Cards, Icons).
    3.  **Spatial Calculation (CRITICAL)**: 
        *   Measure Euclidean distances between elements in pixels across the slices.
        *   **Translate pixel distances to relative classes** (e.g., ~40px gap → \`gap-4\` or \`mb-4\`).
        *   Maintain the EXACT vertical rhythm of the original design.
    4.  **Hierarchy**: Measure font sizes and sample colors exactly.
    
    **CODING RULES (OUTPUT GENERATION):**
    
    *   **NO TRUNCATION**: You MUST generate the code for the **ENTIRE LENGTH** of the design. Start from the top slice and go all the way to the bottom slice.
    *   **Layout**: Create a single seamless scrolling page.
    *   **Colors**: Use specific hex codes (e.g., \`#0F172A\`) in custom CSS classes if standard framework colors don't match.
    *   **Content**: Transcribe all text exactly as it appears.
    *   **Images**: For detected image objects, use "https://picsum.photos/800/600" or similar placeholders.
    *   **Icons**: Use \`lucide-react\` (for React) or Lucide script tags (for HTML).

    **FORMAT SPECIFIC INSTRUCTIONS:**
    ${format === 'react' 
      ? `Output a SINGLE FILE React Functional Component.
         - Export default.
         - Use Lucide-React icons.
         - Use Tailwind CSS for all styling.` 
      : `Output a SINGLE HTML file.
         - Use **Bootstrap 5.3 CDN** (<link href="..." rel="stylesheet">).
         - Use **Bootstrap Icons** or Lucide Script (unpkg).
         - Use Bootstrap utility classes (d-flex, mb-3, p-4, text-center, etc.) and components (Card, Navbar, Grid) wherever possible.
         - If Bootstrap utilities aren't enough, add a <style> block with custom CSS to achieve pixel-perfect results.`}
  `;

  const prompt = `
    Analyze the uploaded design slices (Total ${base64Images.length} parts) using the 7-Stage Vision protocol.
    
    STEP 1: Identify the main layout structure from top to bottom.
    STEP 2: Detect all interactive elements.
    STEP 3: Generate the ${format === 'react' ? 'React Code' : 'HTML + Bootstrap 5 Code'} that reproduces this FULL design pixel-perfectly.
    
    IMPORTANT: The user has uploaded a long design split into multiple parts. ensure you convert the ENTIRE LENGTH. Do not stop halfway.
    
    Return ONLY the code string. No markdown fences. No explanations.
  `;

  // Construct the multi-part content
  const contentParts = [];
  
  // Add all images
  base64Images.forEach((imgBase64) => {
    contentParts.push({
      inlineData: {
        mimeType: 'image/jpeg',
        data: imgBase64
      }
    });
  });

  // Add the text prompt at the end
  contentParts.push({ text: systemInstruction + "\n\n" + prompt });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: contentParts
      },
      config: {
        thinkingConfig: {
            thinkingBudget: 4096 
        },
        maxOutputTokens: 65536,
        temperature: 0.1, 
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No code generated from Gemini.");
    }
    
    return text;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};