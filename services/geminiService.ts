import { GoogleGenAI, Type, Part, Modality } from "@google/genai";
import type { CreativeData, CreativeType, CreativeOutput } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToGenerativePart = async (file: File): Promise<Part> => {
  const base64EncodedDataPromise = new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]);
      } else {
        reject(new Error("Failed to read file as data URL."));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });

  const data = await base64EncodedDataPromise;
  return {
    inlineData: {
      mimeType: file.type,
      data,
    },
  };
};

const generateCreativeJson = async (userInput: string, occasion: string, creativeType: CreativeType, imagePart: Part | null): Promise<CreativeData> => {
  const imageInstruction = imagePart
    ? "An image has been provided as a reference. Analyze it meticulously—it could be a product photo, a sketch, or even handwritten notes. Your concept must be directly inspired by or enhance this image."
    : "No reference image was provided. You must conceive the entire visual from scratch.";
    
  const layoutDescriptionInstruction = imagePart
    ? "A concise, actionable instruction for a professional photo editor. Describe the exact edits needed for the provided image. Be specific. Example: 'Add a subtle lens flare in the top-left corner, enhance the product's metallic sheen, and change the background to a blurred, festive street scene at night.'"
    : "A rich, detailed art direction brief for an AI image generator. Describe the scene's composition (e.g., rule of thirds, leading lines), lighting (e.g., 'dramatic cinematic lighting', 'soft morning light'), color palette, mood, and subject. The goal is a visually stunning, photorealistic image.";

  const occasionInstruction = occasion
    ? `The creative is for a specific occasion: "${occasion}". This is the primary theme. The concept must be a clever, culturally authentic celebration of this event, with the product integrated naturally, not just placed in the scene.`
    : "This is a standard product/service promotion. The focus should be on creating desire and a clear value proposition.";

  const prompt = `
You are a world-class Creative Director at a top-tier advertising agency. Your task is to brainstorm a winning creative concept for "MegaTech Solutions," a modern, trustworthy, and innovative tech brand. The final output will be a "${creativeType.replace(/_/g, ' ')}".

**Your Goal:**
Go beyond the obvious. I need a "Big Idea"—a clever, unexpected concept that is emotionally resonant and visually arresting. Avoid generic marketing-speak.

**Context & User Input:**
- **Product/Service Information:** "${userInput}"
- **Occasion/Theme:** ${occasionInstruction}
- **Reference Material:** ${imageInstruction}

**Mandatory Requirements:**
1.  **Concept First:** Develop a single, strong, creative concept before writing anything else.
2.  **Compelling Copy:** Write copy that is sharp, persuasive, and aligns with the "MegaTech Solutions" brand voice. The headline should be a powerful hook. The CTA should be compelling (e.g., "Secure Your Peace of Mind" instead of just "Buy Now").
3.  **Art Direction:** The layout description must be incredibly detailed, providing a clear vision for the final image.
4.  **Error-Free:** All text must be proofread for spelling and grammatical errors.
5.  **Strict JSON Output:** The final output must be only the JSON object, adhering strictly to the defined schema.

**JSON Structure:**
- "headline": The attention-grabbing main text. Should be clever and concise.
- "subtext": Supporting text. Details, features, or a warm message.
- "CTA": The call-to-action. Must be a compelling verb phrase. Empty string ("") for pure greetings.
- "layout_description": ${layoutDescriptionInstruction}
- "festival_theme": If an occasion is specified, describe the visual theme in detail (e.g., for "Diwali": "Vibrant and warm, using a palette of saffron, gold, and deep indigo. Incorporate motifs of diya lamps and intricate rangoli patterns, with a focus on light overcoming darkness."). Empty string ("") if no occasion.
  `;

  const promptParts: Part[] = [{ text: prompt }];
  if (imagePart) {
    promptParts.push(imagePart);
  }

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: { parts: promptParts },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          headline: { type: Type.STRING },
          subtext: { type: Type.STRING },
          CTA: { type: Type.STRING },
          layout_description: { type: Type.STRING },
          festival_theme: { type: Type.STRING },
        },
        required: ["headline", "subtext", "CTA", "layout_description", "festival_theme"],
      },
    },
  });

  try {
    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr) as CreativeData;
  } catch (e) {
    console.error("Failed to parse JSON response:", response.text);
    throw new Error("Could not generate creative data. The AI returned an invalid format.");
  }
};

const getAspectRatioForCreativeType = (creativeType: CreativeType): '1:1' | '9:16' | '16:9' | '4:3' | '3:4' => {
    switch (creativeType) {
        case 'instagram_post':
            return '1:1';
        case 'whatsapp_story':
            return '9:16';
        case 'linkedin_post':
            return '4:3'; // Closest supported to LinkedIn's recommended 1.91:1
        case 'banner':
            return '16:9';
        case 'brochure':
            return '3:4'; // Portrait orientation suitable for a brochure cover
        default:
            return '1:1';
    }
};

const generateVisualImage = async (creativeData: CreativeData, creativeType: CreativeType): Promise<string> => {
    const imagePrompt = `
      Create a photorealistic, hyper-detailed, visually stunning marketing image for MegaTech Solutions, formatted as a ${creativeType.replace(/_/g, ' ')}.
      Art Direction: ${creativeData.layout_description}.
      ${creativeData.festival_theme ? `Thematic Elements: ${creativeData.festival_theme}.` : ''}
      Visual Style: Cinematic lighting, professional color grading, sharp focus, 8K resolution, shot on a high-end camera. Resembles an Unreal Engine 5 render for its realism and detail.
      CRITICALLY IMPORTANT: The image must contain absolutely NO text, letters, words, or numbers. It must be a pure visual with ample negative space for text overlays later. This is a strict requirement.
    `.trim().replace(/\s+/g, ' ');
    
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: imagePrompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/jpeg',
              aspectRatio: getAspectRatioForCreativeType(creativeType),
            },
        });

        if (!response.generatedImages || response.generatedImages.length === 0) {
            throw new Error("The image generator returned no images. This may be due to safety policies (e.g., prompts with real names) or if the prompt is unclear. Please try modifying your request.");
        }
        
        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        return `data:image/jpeg;base64,${base64ImageBytes}`;
    } catch (error) {
        console.error("Error calling the generateImages API:", error);
        throw new Error("Image generation failed due to a service error. This could be a temporary issue. Please try again.");
    }
};

const editVisualImage = async (creativeData: CreativeData, imagePart: Part): Promise<string> => {
    const editPrompt = `
    Act as a professional photo editor. Your task is to modify the provided image based on the following instructions. 
    Make the edits seamless, subtle, and photorealistic.
    Instructions: "${creativeData.layout_description}"
    `.trim();
    const promptParts: Part[] = [
        imagePart,
        { text: editPrompt },
    ];
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: promptParts,
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        const imageContentPart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);
        
        if (!imageContentPart || !imageContentPart.inlineData) {
            throw new Error("The image editor returned no image. The model might have refused the prompt. Please try a different instruction.");
        }
        
        const base64ImageBytes: string = imageContentPart.inlineData.data;
        const mimeType = imageContentPart.inlineData.mimeType;
        return `data:${mimeType};base64,${base64ImageBytes}`;

    } catch (error) {
        console.error("Error calling the image editing API:", error);
        throw new Error("Image editing failed due to a service error. This could be a temporary issue. Please try again.");
    }
};


export const generateCreative = async (
  userInput: string,
  occasion: string,
  creativeType: CreativeType,
  imageFile: File | null
): Promise<CreativeOutput> => {
  let imagePart: Part | null = null;
  if (imageFile) {
    imagePart = await fileToGenerativePart(imageFile);
  }

  const jsonData = await generateCreativeJson(userInput, occasion, creativeType, imagePart);
  
  let visualUrl: string;
  if (imagePart) {
      visualUrl = await editVisualImage(jsonData, imagePart);
  } else {
      visualUrl = await generateVisualImage(jsonData, creativeType);
  }

  return {
    json: jsonData,
    visualUrl: visualUrl,
  };
};