import { GoogleGenAI } from "@google/genai";

// Initialize the client lazily to prevent crashes when API key is missing
// NOTE: In a production app, handle API keys securely (e.g., via a backend proxy).
let ai: GoogleGenAI | null = null;

const getAI = () => {
  if (!ai) {
    const apiKey = process.env.API_KEY || '';
    if (!apiKey) {
      throw new Error('API key is not configured. Please set GEMINI_API_KEY in your environment.');
    }
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
};

/**
 * Performs OCR and analysis on an image (simulating a scanned PDF page).
 * Uses Gemini 2.5 Flash for speed and multimodal capabilities.
 */
export const analyzeDocumentImage = async (base64Image: string, mimeType: string): Promise<string> => {
  try {
    const modelId = 'gemini-2.5-flash';
    const client = getAI();

    const response = await client.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: "Analyze this document image. Perform OCR to extract all visible text. If it is a form or structured document, summarize the key fields. Format the output cleanly with Markdown."
          },
        ],
      },
    });

    return response.text || "No text could be extracted.";
  } catch (error) {
    console.error("Gemini OCR Error:", error);
    throw new Error("Failed to process document.");
  }
};
