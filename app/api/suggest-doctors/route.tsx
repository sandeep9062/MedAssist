import { NextRequest, NextResponse } from "next/server";
import { AIDoctorAgents } from "@/shared/list";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const MAX_RETRIES = 2; // Retry twice before failing

const prompt = (notes: string) => `
Here is the list of available AI Doctor Agents (in JSON):

${JSON.stringify(AIDoctorAgents, null, 2)}

The user provided these health notes:
${notes}

From ONLY the above doctor list, suggest the MOST SUITABLE doctor for this user based on their notes.

Respond ONLY in JSON format with these fields:
id, name, image, specialist, description, agentPrompt, voiceId.
`;

export async function POST(req: NextRequest) {
  const { notes } = await req.json();

  let retries = 0;
  let lastError = "";

  while (retries <= MAX_RETRIES) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const result = await model.generateContent(prompt(notes));
      const text = result.response.text();

      if (!text) throw new Error("Empty response from Gemini");

      // Clean and parse the JSON
      const cleaned = text.replace(/```json/, "").replace(/```/, "").trim();
      const parsed = JSON.parse(cleaned);

      return NextResponse.json(parsed);
    } catch (err: any) {
      console.error(`Retry ${retries + 1} failed:`, err.message);
      lastError = err.message;
      retries++;
    }
  }

  return NextResponse.json(
    { error: `Gemini failed after ${MAX_RETRIES + 1} attempts: ${lastError}` },
    { status: 500 }
  );
}
