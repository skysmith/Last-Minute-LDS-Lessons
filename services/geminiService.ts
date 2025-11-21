import { GoogleGenAI, Type } from '@google/genai';
import { Audience, Slide } from '../types';

const getGenAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please add 'API_KEY' to your Vercel Environment Variables and redeploy your application.");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Step 1: Use Google Search Grounding to find the correct lesson for the date.
 * We cannot use JSON schema here because of the 'googleSearch' tool restriction.
 */
export const identifyLesson = async (dateStr: string): Promise<{ title: string; context: string; sources: Array<{title: string, uri: string}> }> => {
  try {
    const ai = getGenAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Identify the LDS "Come, Follow Me" lesson topic and assigned scripture readings for the week including Sunday, ${dateStr}. 
      Please provide a concise summary of the lesson title and the specific scripture blocks assigned.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || '';
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    const sources = groundingChunks
      .filter(c => c.web?.uri && c.web?.title)
      .map(c => ({ title: c.web!.title!, uri: c.web!.uri! }));

    return {
      title: `Lesson for ${dateStr}`,
      context: text,
      sources,
    };
  } catch (error: any) {
    console.error("Error identifying lesson:", error);
    // Pass through our specific configuration errors
    if (error.message.includes("API Key")) {
      throw error;
    }
    throw new Error("Failed to identify the lesson schedule. Please try again.");
  }
};

/**
 * Step 2: Generate the JSON slides based on the identified context.
 */
export const generateSlides = async (
  lessonContext: string,
  audience: Audience
): Promise<Slide[]> => {
  const systemInstruction = `
    You are an expert Latter-day Saint teacher. 
    Create a presentation lesson plan based on the provided "Come, Follow Me" lesson details.
    
    Audience Profile: ${audience}
    
    CRITICAL INSTRUCTIONS FOR CONTENT:
    1. **QUESTIONS ONLY**: Do NOT use standard bullet point statements. Every item in the 'bullets' array must be an engaging, open-ended QUESTION designed to spark discussion among the class members.
    2. **Tone**:
       - PRIMARY: Questions should be simple (e.g., "How do you think Noah felt?").
       - YOUTH: Questions should be about application and feelings (e.g., "When have you stood alone for what is right?").
       - ADULTS: Questions should be doctrinal and reflective.

    CRITICAL INSTRUCTIONS FOR IMAGERY ('imageKeyword'):
    - PRIMARY (Children): Start with "cute vector illustration". Keep description concise (max 10 words).
    - YOUTH (Teens): Start with "digital art style". Keep description concise (max 10 words).
    - ADULTS: Start with "cinematic oil painting". Keep description concise (max 10 words).
    
    Generate 5-8 slides.
    The 'imageKeyword' will be used by an AI image generator, so keep it short but descriptive of the style.
  `;

  try {
    const ai = getGenAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Here is the lesson context found via search: ${lessonContext}. Generate the slides now.`,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              bullets: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "A list of discussion questions. Do not use statements." 
              },
              scriptureReference: { type: Type.STRING, description: "Relevant verses for this specific slide" },
              discussionQuestion: { type: Type.STRING, description: "One main 'big idea' question for the class" },
              imageKeyword: { type: Type.STRING, description: "Short visual prompt (max 10 words) describing style and subject" },
              speakerNotes: { type: Type.STRING, description: "Tips for the teacher on how to present this slide" },
            },
            required: ['title', 'bullets', 'imageKeyword', 'speakerNotes'],
          },
        },
      },
    });

    const jsonStr = response.text || '[]';
    return JSON.parse(jsonStr) as Slide[];
  } catch (error: any) {
    console.error("Error generating slides:", error);
    if (error.message.includes("API Key")) {
      throw error;
    }
    throw new Error("Failed to generate slide content.");
  }
};