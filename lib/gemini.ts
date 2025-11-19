import { GoogleGenerativeAI } from '@google/generative-ai';

export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

// Fast/cheap default; change to 'gemini-1.5-pro' if you need better reasoning
export function model() {
  return genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
}

export async function generateJson<T = unknown>(prompt: string): Promise<T> {
  const res = await model().generateContent(`${prompt}\n\nReturn ONLY a minified JSON object with no prose.`);
  const text = res.response.text().trim();

  // Try to find a JSON payload even if the model wraps it
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  const json = start >= 0 && end > start ? text.slice(start, end + 1) : text;

  return JSON.parse(json) as T;
}