import { db } from "@/config/db";
import { SessionChatTable } from "@/config/schema";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const REPORT_GEN_PROMPT = `
You are an AI Medical Voice Agent that just finished a call with a patient. Your task is to generate a structured medical report based on Doctor AI agent info and conversation between AI medical agent and user.

The report must contain the following fields:
1. sessionId: a unique session identifier
2. agent: the medical specialist name (e.g., "General Physician AI")
3. user: name of the patient or "Anonymous" if not provided
4. timestamp: current date and time in ISO format
5. chiefComplaint: one-sentence summary of the main health concern
6. summary: a 2–3 sentence summary of the conversation, symptoms, and advice
7. symptoms: list of symptoms mentioned by the user
8. duration: how long the user has experienced the symptoms
9. severity: mild, moderate, or severe
10. medicationsMentioned: list of any medicines mentioned and 
11. medicationDetails: list of objects describing medication name, quantity/dosage, and timing/frequency, like:
   [
     {
       "medication": "Paracetamol",
       "dosage": "500mg",
       "timing": "Twice daily after meals"
     }
   ]
12. recommendations: list of AI suggestions (e.g., rest, see a doctor)
13.possibleConditions: list of possible conditions or diagnoses considered during the conversation

Return ONLY the JSON response with these fields, like this:

{
  "sessionId": "string",
  "agent": "string",
  "user": "string",
  "timestamp": "ISO Date string",
  "chiefComplaint": "string",
  "summary": "string",
  "symptoms": ["symptom1", "symptom2"],
  "duration": "string",
  "severity": "string",
  "medicationsMentioned": ["med1", "med2"],
  "recommendations": ["rec1", "rec2"]
}
`;

export async function POST(req: NextRequest) {
  try {
    const { sessionId, sessionDetail, messages } = await req.json();

    const userInput = `AI Doctor Agent Info: ${JSON.stringify(sessionDetail)}\nConversation: ${JSON.stringify(messages)}`;
    const fullPrompt = `${REPORT_GEN_PROMPT}\n\n${userInput}`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(fullPrompt);
    const responseText = result.response.text();

    if (!responseText) {
      throw new Error("Empty response from Gemini.");
    }

    const cleaned = responseText.replace(/```json/, "").replace(/```/, "").trim();

    let report;
    try {
      report = JSON.parse(cleaned);
    } catch (err) {
      console.error("Failed to parse Gemini response:", cleaned);
      throw new Error("Invalid JSON format returned by Gemini.");
    }

    // Save report and conversation in DB
    await db
      .update(SessionChatTable)
      .set({ report, conversation: messages })
      .where(eq(SessionChatTable.sessionId, sessionId));

    return NextResponse.json(report);
  } catch (error: any) {
    console.error("Gemini Report API Error:", error);
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
  }
}
