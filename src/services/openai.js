import OpenAI from 'openai';

export const callOpenAI = async (apiKey, messages) => {
    if (!apiKey) throw new Error("OpenAI API Key is missing");

    const openai = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true
    });

    try {
        const completion = await openai.chat.completions.create({
            messages: messages,
            model: "gpt-4o", // Defaulting to 4o, could be configurable
        });

        return completion.choices[0].message.content;
    } catch (error) {
        console.error("OpenAI API Error:", error);
        throw error;
    }
};
