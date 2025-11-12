import { GoogleGenAI, Type, Chat, Modality, Content } from "@google/genai";
import { Model, ComponentModel } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const modelGenerationSchema = {
  type: Type.OBJECT,
  properties: {
    components: {
      type: Type.ARRAY,
      description: "An array of 2D components representing the model.",
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: "A unique identifier for the component." },
          type: { type: Type.STRING, enum: ["image", "line"], description: "The type of component. Use 'image' for objects and 'line' for connections." },
          x: { type: Type.NUMBER, description: "The x-coordinate of the component's top-left corner." },
          y: { type: Type.NUMBER, description: "The y-coordinate of the component's top-left corner." },
          width: { type: Type.NUMBER, description: "The width of the image. Required for images. Suggest 80." },
          height: { type: Type.NUMBER, description: "The height of the image. Required for images. Suggest 80." },
          x2: { type: Type.NUMBER, description: "The x-coordinate of the line's end point. Required for lines." },
          y2: { type: Type.NUMBER, description: "The y-coordinate of the line's end point. Required for lines." },
          label: { type: Type.STRING, description: "A short, user-friendly label for the component." },
          description: { type: Type.STRING, description: "A brief, simple, one-sentence explanation of what the component is or does." },
          relationships: {
            type: Type.ARRAY,
            description: "An array describing how this component relates to others.",
            items: {
              type: Type.OBJECT,
              properties: {
                targetId: { type: Type.STRING, description: "The 'id' of the component it connects to." },
                description: { type: Type.STRING, description: "A short sentence explaining the relationship (e.g., 'sends power to')." }
              },
              required: ["targetId", "description"]
            }
          }
        },
        required: ["id", "type", "x", "y", "label", "description"],
      },
    },
  },
  required: ["components"],
};

const generateImageForComponent = async (component: ComponentModel): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: `Generate a clean, simple, 2D vector icon of a "${component.label}" for a technical diagram. It should be in a modern, flat design style with a transparent background.` }],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });
        
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        }
        throw new Error('No image data found in response.');

    } catch(error) {
        console.error(`Failed to generate image for ${component.label}:`, error);
        // Return a placeholder or re-throw
        throw new Error(`Could not generate image for ${component.label}.`);
    }
}


export const generateModelFromText = async (idea: string, onProgress: (message: string) => void): Promise<Model> => {
  try {
    onProgress("Generating model structure...");
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are an AI assistant for InnoDraw AI. A user wants to create a 2D model of an idea. Convert the following user prompt into a structured JSON representation of a 2D model. The model should consist of images for main components and lines to connect them. The canvas is 500x500. Keep all coordinates and sizes within this boundary and ensure components are well-distributed without overlapping. For each component, define its direct relationships with other components. User prompt: "${idea}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: modelGenerationSchema,
      },
    });
    
    const jsonString = response.text.trim();
    const modelStructure: Model = JSON.parse(jsonString);
    
    if (!modelStructure || !Array.isArray(modelStructure.components)) {
        throw new Error("Generated JSON does not match the expected model structure.");
    }
    
    const imageComponents = modelStructure.components.filter(c => c.type === 'image');
    onProgress(`Generating ${imageComponents.length} component images...`);

    const imagePromises = imageComponents.map((component, index) => 
        generateImageForComponent(component).then(imageUrl => {
            onProgress(`Generating component images (${index + 1}/${imageComponents.length})...`);
            return { ...component, imageUrl };
        })
    );

    const generatedImages = await Promise.all(imagePromises);

    const finalComponents = modelStructure.components.map(c => {
        if (c.type === 'image') {
            return generatedImages.find(imgC => imgC.id === c.id) || c;
        }
        return c;
    });

    return { components: finalComponents };

  } catch (error) {
    console.error("Error generating model with Gemini:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to generate model: ${error.message}`);
    }
    throw new Error("Failed to generate model. Please try a different idea.");
  }
};

export const createChat = (history?: Content[]): Chat => {
    return ai.chats.create({
        model: 'gemini-2.5-flash',
        history: history,
        config: {
            systemInstruction: 'You are a helpful and encouraging AI project mentor for students using InnoDraw AI. Your role is to guide them in turning their 2D visual models into real-world projects. Break down complex topics, suggest alternative components and designs, provide practical advice, and help them brainstorm. Your tone is supportive and expert.',
        },
    });
};