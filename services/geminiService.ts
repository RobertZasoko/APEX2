import { GoogleGenAI, Type, GenerateContentResponse, Modality } from "@google/genai";
import { Scenario, TranscriptMessage, Feedback } from '../types';

// Lazily initialize to avoid issues during the initial render.
// The API key is assumed to be set in the deployment environment.
let ai: GoogleGenAI | null = null;
export function getGenAI(): GoogleGenAI {
    if (!ai) {
        const apiKey = process.env.API_KEY;
        
        if (!apiKey) {
            // This is a critical configuration error.
            // This message will appear in your Vercel Function logs.
            console.error("FATAL ERROR: Gemini API key is missing. Ensure the 'API_KEY' environment variable is correctly set in your Vercel project settings and that the project has been redeployed.");
            throw new Error("API key is not configured. The simulation cannot start. Please check server logs for details.");
        }
        
        // The API key is passed directly from the environment variable.
        ai = new GoogleGenAI({ apiKey });
    }
    return ai;
}


const detailedItemSchema = {
    type: Type.OBJECT,
    properties: {
        point: { 
            type: Type.STRING, 
            description: "The main point, summary, or suggestion." 
        },
        details: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "An array of specific sub-points, examples from the transcript, or phrasing suggestions. Can be empty if not applicable."
        }
    },
    required: ["point", "details"]
};

const feedbackSchema = {
    type: Type.OBJECT,
    properties: {
        score: {
            type: Type.NUMBER,
            description: "A performance score from 1-10.",
        },
        strengths: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Observed strengths during the call. Be specific. If none, return empty array.",
        },
        improvements: {
            type: Type.ARRAY,
            items: detailedItemSchema,
            description: "Areas for improvement with specific examples from the transcript.",
        },
        coachingTips: {
            type: Type.ARRAY,
            items: detailedItemSchema,
            description: "Tactical coaching tips and specific phrasing suggestions.",
        },
        practiceQuestions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A few practice questions for the user to rehearse later.",
        },
    },
    required: ["score", "strengths", "improvements", "coachingTips", "practiceQuestions"],
};


export const generateFeedback = async (scenario: Scenario, transcript: TranscriptMessage[]): Promise<Feedback> => {
    const ai = getGenAI();
    // Using gemini-2.5-flash for better quality structured JSON output.
    const model = 'gemini-2.5-flash';

    const transcriptText = transcript
        .map(msg => `${msg.speaker === 'user' ? 'Consultant' : 'Client'}: ${msg.text}`)
        .join('\n');

    const prompt = `
        You are a world-class sales coach. Analyze the following sales call transcript and the initial scenario.
        The user was playing the role of the 'Consultant'.
        Your role is to become a sales coach and evaluator.
        Provide a detailed, critical, and actionable evaluation. Do not give fake praise.
        If no strengths were observed, the 'strengths' array should be empty.
        For 'improvements' and 'coachingTips', provide a main point and use the 'details' array for specific examples or sub-points.

        SCENARIO:
        - Consultant Role: ${scenario.consultantRole}
        - Lead Source: ${scenario.leadSource}
        - Client Role & Persona: ${scenario.clientRole}, ${scenario.clientPersona}
        - Industry: ${scenario.industry}
        - Objection Style: ${scenario.objectionStyle}

        TRANSCRIPT:
        ${transcriptText}

        Your response must be in JSON format matching the provided schema.
    `;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: feedbackSchema,
            },
        });
        
        const jsonText = response.text.trim();
        const parsedJson = JSON.parse(jsonText);
        return parsedJson as Feedback;
    } catch (error) {
        console.error("Error generating feedback from Gemini:", error);
        throw new Error("Failed to generate feedback.");
    }
};

export const generateSpeech = async (text: string): Promise<string> => {
    const ai = getGenAI();
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) {
            throw new Error("No audio data received from TTS API.");
        }
        return base64Audio;
    } catch (error) {
        console.error("Error generating speech:", error);
        throw new Error("Failed to generate speech.");
    }
};

// Audio utility functions required for Live API
export function decode(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

export async function decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
}

export function encode(bytes: Uint8Array): string {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}