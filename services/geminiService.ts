import { GoogleGenAI, Type } from "@google/genai";
import { AdFormData, AdVariation } from "../types";

const apiKey = process.env.API_KEY;

if (!apiKey) {
  console.error("API_KEY is missing. Please ensure it is set in the environment.");
}

const ai = new GoogleGenAI({ apiKey: apiKey });

export const generateAdCopy = async (data: AdFormData): Promise<AdVariation[]> => {
  const modelId = "gemini-3-flash-preview";

  const prompt = `
    You are an expert digital marketer and copywriter with decades of experience in high-converting advertising.
    
    Task: Create 3 distinct ad copy variations for the following product/service.
    
    Product Details:
    - Product Name: ${data.productName}
    - Industry/Business: ${data.businessType}
    - Target Audience: ${data.targetAudience}
    - Ad Platform: ${data.platform}
    - Tone of Voice: ${data.tone}
    - Objective: ${data.objective}
    - Language: ${data.language}
    
    Guidelines:
    1. Strictly follow the character limits and formatting rules for ${data.platform}.
    2. Use persuasive copywriting frameworks (AIDA, PAS, etc.).
    3. Be specific, avoid generic fluff. Focus on benefits over features.
    4. Ensure the output is in ${data.language}.
    
    Return a JSON array containing exactly 3 variations.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        systemInstruction: "You are a world-class copywriter assistant. Always respond with structured JSON data.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              headline: {
                type: Type.STRING,
                description: "The main headline for the ad. Catchy and relevant.",
              },
              primaryText: {
                type: Type.STRING,
                description: "The main body copy of the ad.",
              },
              cta: {
                type: Type.STRING,
                description: "Call to action button text (e.g., Shop Now, Learn More).",
              },
              framework: {
                type: Type.STRING,
                description: "The copywriting framework used (e.g., AIDA, PAS).",
              },
              explanation: {
                type: Type.STRING,
                description: "A very short explanation of why this copy works.",
              }
            },
            required: ["headline", "primaryText", "cta", "framework", "explanation"],
          },
        },
      },
    });

    const jsonText = response.text;
    if (!jsonText) {
        throw new Error("No data returned from Gemini.");
    }
    
    const parsedData = JSON.parse(jsonText) as AdVariation[];
    return parsedData;

  } catch (error) {
    console.error("Error generating ad copy:", error);
    throw error;
  }
};
