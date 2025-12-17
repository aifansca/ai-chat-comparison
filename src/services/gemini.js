import { GoogleGenerativeAI } from "@google/generative-ai";

export const callGemini = async (apiKey, prompt) => {
    if (!apiKey) throw new Error("Gemini API Key is missing");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw error;
    }
};
