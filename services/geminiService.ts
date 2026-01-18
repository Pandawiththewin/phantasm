import { GoogleGenAI, Type, Modality } from "@google/genai";
import { ProfessorRating, CramPlan } from "../types";

// Helper to convert file to base64
const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const generateSyllabus = async (
  university: string, 
  courseCode: string, 
  rawData: string, 
  professor?: string,
  syllabusFile?: File | null
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-3-flash-preview"; 

  const profContext = professor && professor.trim() ? `taught by Professor ${professor}` : "with no specific professor specified";
  
  let promptText = `
    Context: You are an "Academic Strategist" for a university hackathon project called Phantasm.
    Task: Analyze the following raw student discussion data about the course "${courseCode}" at "${university}" ${profContext} and construct a "Ghost Syllabus".
    
    Raw Reddit Data:
    ${rawData}
  `;

  if (syllabusFile) {
    promptText += `
    \nIMPORTANT: An image or PDF of the OFFICIAL syllabus has been provided. 
    Compare the "Official" rules in the document vs. the "Real" student experiences in the Reddit data.
    `;
  }

  promptText += `
    Format Requirements:
    Output strictly in Markdown.
    Use exactly the following headers (using ## syntax):
    
    ${syllabusFile ? `## Syllabus vs Reality
    (Crucial Section: Bullet points comparing "Official Policy" vs "Student Reality". Example: "Syllabus says 5% participation, students say he never checks.")` : ''}

    ## Reality Check
    (General difficulty and vibe. Analyze teaching style, grading quirks, or reputation).
    
    ## Hidden Prerequisites
    (What you actually need to know before taking this class)
    
    ## Panic Zones
    (Midterms, specific hard topics, or weeks to watch out for)
    
    ## Golden Resources
    (Textbook PDFs, cheat sheets, or drive links mentioned in threads)
    
    ## Phantom Library
    (Curated Video Vault. List high-quality YouTube resources like Organic Chemistry Tutor, 3Blue1Brown, Khan Academy. Organize by "Unit" or "Module". Format: "### Unit 1: Topic" followed by bullet points "- [Video Title](URL)").

    Tone: Strategic, slightly secretive, helpful, student-to-student advice.
  `;

  try {
    const parts: any[] = [{ text: promptText }];
    if (syllabusFile) {
      const filePart = await fileToGenerativePart(syllabusFile);
      parts.push(filePart);
    }

    const response = await ai.models.generateContent({
      model: model,
      contents: { parts },
    });
    
    return response.text || "The spirits remained silent. No syllabus could be conjured.";
  } catch (error) {
    console.error("Gemini generation error:", error);
    throw new Error("Failed to conjure the syllabus.");
  }
};

export const generateCramPlan = async (
  courseCode: string,
  syllabusContext: string | null,
  examType: string,
  hoursAvailable: string
): Promise<CramPlan> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-3-flash-preview";

  // Truncate context if it's too long to prevent token issues/latency
  const safeContext = syllabusContext && syllabusContext.length > 10000 
    ? syllabusContext.substring(0, 10000) + "...(truncated)" 
    : syllabusContext;

  const prompt = `
    Role: You are an Academic Triage Surgeon.
    Situation: A student is panicking. They have a ${examType} for ${courseCode} in exactly ${hoursAvailable}.
    
    Input Context (Course Info):
    ${safeContext || "No specific syllabus provided. Infer standard topics for this course code based on its name."}

    Mission:
    1. Cut 80% of the curriculum. We are not aiming for an A+, we are aiming to pass/survive.
    2. Create a minute-by-minute survival checklist.
    3. Identify exactly what to IGNORE (The Sacrifice).
    
    CRITICAL INSTRUCTION:
    If the provided context is empty or vague, YOU MUST INVENT A GENERIC BUT PLAUSIBLE PLAN for a Computer Science/Engineering course. 
    DO NOT return empty arrays. The student needs a plan, even a generic one.

    For each timeblock, you MUST provide a "videoSuggestion":
    - "title": A concise title of a YouTube video (real or hypothetical) that explains this topic perfectly.
    - "url": A direct YouTube link. If you do not know a specific URL, generate a YouTube Search URL for the topic (e.g. https://www.youtube.com/results?search_query=topic).

    Output JSON Format:
    {
      "examType": "${examType}",
      "totalHours": "${hoursAvailable}",
      "strategy": "A 2-sentence ruthless strategy summary.",
      "schedule": [
        { 
          "timeblock": "Hour 1", 
          "action": "Exact topic/formula to memorize", 
          "priority": "CRITICAL", 
          "notes": "Why this matters",
          "videoSuggestion": { "title": "Learn X in 10 mins", "url": "..." }
        }
      ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            examType: { type: Type.STRING },
            totalHours: { type: Type.STRING },
            strategy: { type: Type.STRING },
            schedule: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  timeblock: { type: Type.STRING },
                  action: { type: Type.STRING },
                  priority: { type: Type.STRING },
                  notes: { type: Type.STRING },
                  videoSuggestion: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      url: { type: Type.STRING }
                    },
                    required: ["title", "url"]
                  }
                },
                required: ["timeblock", "action", "priority", "notes", "videoSuggestion"]
              }
            }
          },
          required: ["examType", "totalHours", "strategy", "schedule"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Triage failed.");
    
    // Clean up potential markdown formatting in JSON response
    const jsonStr = text.replace(/```json\n?|\n?```/g, '').trim();
    let data = JSON.parse(jsonStr);
    
    // --- ROBUST UNWRAPPING LOGIC ---
    // Sometimes the model wraps the response in a root object like { "result": ... } or { "cramPlan": ... }
    if (!data.strategy && !data.schedule) {
       const keys = Object.keys(data);
       // If there's only one key and it's an object, dive in
       if (keys.length === 1 && typeof data[keys[0]] === 'object' && !Array.isArray(data[keys[0]])) {
           data = data[keys[0]];
       }
    }

    // Default fallbacks to prevent empty UI
    const plan: CramPlan = {
        examType: data.examType || examType,
        totalHours: data.totalHours || hoursAvailable,
        strategy: data.strategy || "Survive at all costs. (Strategy details missing from report)",
        schedule: Array.isArray(data.schedule) ? data.schedule : []
    };

    return plan;

  } catch (error) {
    console.error("Cram Plan Error:", error);
    throw new Error("The Surgeon could not operate.");
  }
};

export const generateAudioSummary = async (syllabusText: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Extract just the juicy parts for the audio to save tokens/time
  const shortText = syllabusText.length > 2000 ? syllabusText.substring(0, 2000) + "..." : syllabusText;

  const prompt = `
    Act as a fast-talking 1930s Transatlantic Radio News Anchor (Mid-Atlantic accent).
    
    Give a 45-second "News Flash" summary of this course based on the text below.
    Focus on the "Panic Zones" and "Reality Check". 
    Be dramatic, old-timey, and urgent. Start with "This is Phantasm Radio reporting live!"
    
    Source Text:
    ${shortText}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Charon' }, // Charon fits the ghost theme
            },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("No audio generated");
    return base64Audio;
  } catch (error) {
    console.error("Audio generation error", error);
    throw new Error("Radio signal lost.");
  }
};

export const getProfessorRating = async (university: string, professor: string): Promise<ProfessorRating | null> => {
  if (!professor) return null;
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Search for the RateMyProfessors profile for "${professor}" at "${university}".
                 
                 STRICT RULES:
                 1. First, identify the correct full name of the professor at this university. Use Google Search to correct any misspellings in the input name.
                 2. You must find the numeric scores: "Overall Quality" (1-5), "Level of Difficulty" (1-5), and "Would Take Again" (%).
                 3. If you cannot find a matching profile, OR if the numeric scores are missing/hidden, set 'found' to FALSE.
                 4. DO NOT GUESS or hallucinate numbers. If unsure, set 'found' to FALSE.
                 5. Provide a 1-sentence summary based on the reviews if found.
                 6. Return the CORRECT FULL NAME of the professor as found on the site.
                 `,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            found: { type: Type.BOOLEAN },
            name: { type: Type.STRING, description: "The correct full name of the professor found on the profile." },
            quality: { type: Type.STRING, description: "The overall quality score (e.g. '4.2')" },
            difficulty: { type: Type.STRING, description: "The difficulty score (e.g. '3.5')" },
            takeAgain: { type: Type.STRING, description: "The would take again percentage (e.g. '80%')" },
            summary: { type: Type.STRING, description: "A one-sentence summary of the reviews." }
          }
        }
      }
    });

    const text = response.text;
    const fallback = { found: false, quality: "0", difficulty: "0", takeAgain: "0%", summary: "Profile not found.", name: professor };

    if (!text) return fallback;
    
    // Sometimes text might contain markdown code blocks
    const jsonStr = text.replace(/```json\n?|\n?```/g, '').trim();
    let data;
    try {
        data = JSON.parse(jsonStr);
    } catch (parseError) {
        console.warn("JSON parse failed, returning fallback");
        return fallback;
    }
    
    // Explicit hallucination check: Ensure numbers are actually numbers if found is true
    const hasNumbers = data.found && 
                       data.quality && !isNaN(parseFloat(data.quality)) && 
                       data.difficulty && !isNaN(parseFloat(data.difficulty));

    if (data.found && !hasNumbers) {
       return { ...fallback, summary: "Could not verify numeric scores.", name: data.name || professor };
    }

    if (!data.found) {
       return fallback;
    }
    
    return data;
  } catch (e) {
    console.error("Failed to fetch professor rating", e);
    // Return a not-found object so UI shows the message instead of nothing
    return { found: false, quality: "0", difficulty: "0", takeAgain: "0%", summary: "Search error.", name: professor };
  }
};