import OpenAI from "openai";

// Initialize OpenAI client
// Ensure OPENAI_API_KEY is set in your .env file
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper to generate JSON using OpenAI
export async function generateJson<T = unknown>(prompt: string): Promise<T> {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a helpful AI assistant that always returns valid JSON. Do not include any markdown formatting, code blocks, or explanation text.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "gpt-3.5-turbo-0125", // Cost-effective and fast model
      response_format: { type: "json_object" }, // Force JSON mode
    });

    const content = completion.choices[0].message.content || "{}";

    try {
      return JSON.parse(content) as T;
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      // Fallback simple cleanup if response_format fails (unlikely with gpt-3.5-turbo-0125+)
      const start = content.indexOf("{");
      const end = content.lastIndexOf("}");
      const json =
        start >= 0 && end > start ? content.slice(start, end + 1) : content;
      return JSON.parse(json) as T;
    }
  } catch (error) {
    console.error("OpenAI API Error:", error);
    throw new Error("Failed to generate content from OpenAI");
  }
}
