// lib/gemini.ts
export async function generateDoctorSuggestion(notes: string, agents: any[]) {
    const API_KEY = process.env.GEMINI_API_KEY!;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${API_KEY}`;
  
    const prompt = `
  Here is the list of available AI Doctor Agents:
  ${JSON.stringify(agents, null, 2)}
  
  Suggest the most suitable doctor(s) for this user note:
  "${notes}"
  
  Respond in JSON format like this:
  {
    "suggestedDoctors": [
      { "name": "Doctor Name", "specialty": "Specialization" }
    ]
  }
    `;
  
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });
  
    if (!res.ok) {
      throw new Error(`Gemini API Error: ${res.status}`);
    }
  
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  
    return text;
  }
  