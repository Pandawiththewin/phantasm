import { CramPlan } from '../types';

export interface OpenNoteConfig {
  serverUrl: string;
  token: string;
}

export const HARDCODED_LEDGER_CONFIG = {
  url: "http://localhost:5230", 
  token: "eyJhbGciOiJIUzI1NiIsImtpZCI6InYxIiwidHlwIjoiSldUIn0.eyJuYW1lIjoiUGFuZGF3aXRodGhld2luIiwiaXNzIjoibWVtb3MiLCJzdWIiOiIxIiwiYXVkIjpbInVzZXIuYWNjZXNzLXRva2VuIl0sImV4cCI6MTc3MTM0Mjg2NywiaWF0IjoxNzY4NzUwODY3fQ.8-STI2MUqTA0jp1AowKfjyr1dkAYetb1NDz-YUzsDFc" 
};

const getConfig = (): OpenNoteConfig => {
  return {
    serverUrl: localStorage.getItem('phantasm_ledger_url') || HARDCODED_LEDGER_CONFIG.url,
    token: localStorage.getItem('phantasm_ledger_token') || HARDCODED_LEDGER_CONFIG.token
  };
};

// Helper to format URL
const getApiUrl = (baseUrl: string): string => {
  let url = baseUrl.trim();
  if (url.endsWith('/')) url = url.slice(0, -1);
  if (!url.startsWith('http')) url = `https://${url}`;
  
  if (!url.endsWith('/api/v1/memos')) {
    return `${url}/api/v1/memos`;
  }
  return url;
};

// Helper to handle Memos API response structure variation
// Some versions return [], others { memos: [] }, others { data: [] }
const getMemosList = (json: any): any[] => {
  if (!json) return [];
  if (Array.isArray(json)) return json;
  if (json.memos && Array.isArray(json.memos)) return json.memos;
  if (json.data && Array.isArray(json.data)) return json.data;
  return [];
};

export interface Whisper {
  id: number;
  content: string;
  createdTs: number;
}

export const fetchWhispers = async (courseCode: string): Promise<Whisper[]> => {
  const config = getConfig();
  if (!config.token) return [];

  const apiUrl = getApiUrl(config.serverUrl);
  const tag = courseCode.replace(/\s+/g, '');

  try {
    const response = await fetch(`${apiUrl}?limit=100`, {
      headers: {
        'Authorization': `Bearer ${config.token}`,
      }
    });

    if (!response.ok) return [];

    const rawData = await response.json();
    const data = getMemosList(rawData);
    
    const whispers = data.filter((memo: any) => 
      memo.content &&
      memo.content.includes('#Whisper') && 
      memo.content.includes(`#${tag}`)
    ).map((memo: any) => ({
      id: memo.id,
      content: memo.content
        .replace('#Whisper', '')
        .replace(`#${tag}`, '')
        .trim(),
      createdTs: memo.createdTs
    }));

    return whispers;
  } catch (error) {
    console.error("Failed to fetch whispers:", error);
    return [];
  }
};

export const saveWhisper = async (courseCode: string, content: string): Promise<void> => {
  const config = getConfig();
  if (!config.token) throw new Error("Ledger not connected");

  const apiUrl = getApiUrl(config.serverUrl);
  const tag = courseCode.replace(/\s+/g, '');
  
  const memoContent = `${content}\n\n#Whisper #${tag}`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.token}`,
      },
      body: JSON.stringify({
        content: memoContent,
        visibility: "PUBLIC" 
      })
    });

    if (!response.ok) {
      throw new Error(`Server Error: ${response.statusText}`);
    }
  } catch (error) {
    console.error("OpenNote Export Failed:", error);
    throw error;
  }
};

// --- CRAM TRAM (DOOMSDAY) METHODS ---

export const fetchSurvivalPlans = async (courseCode: string): Promise<CramPlan[]> => {
  const config = getConfig();
  if (!config.token) return [];

  const apiUrl = getApiUrl(config.serverUrl);
  const tag = courseCode.replace(/\s+/g, '');

  try {
    const response = await fetch(`${apiUrl}?limit=50`, {
      headers: { 'Authorization': `Bearer ${config.token}` }
    });

    if (!response.ok) return [];

    const rawData = await response.json();
    const data = getMemosList(rawData);
    
    // Filter for #SurvivalPlan
    const plans: CramPlan[] = data
      .filter((memo: any) => 
        memo.content &&
        memo.content.includes('#SurvivalPlan') && 
        memo.content.includes(`#${tag}`)
      )
      .map((memo: any) => {
        // Parse the JSON block inside the memo content
        // The memo format is: #SurvivalPlan #CourseCode\n```json\n{...}\n```
        const jsonMatch = memo.content.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch) {
            try {
                const plan = JSON.parse(jsonMatch[1]);
                return { ...plan, id: memo.id, createdTs: memo.createdTs };
            } catch (e) {
                return null;
            }
        }
        return null;
      })
      .filter((p: any) => p !== null);

    return plans;
  } catch (error) {
    console.error("Failed to fetch survival plans", error);
    return [];
  }
};

export const saveSurvivalPlan = async (courseCode: string, plan: CramPlan): Promise<void> => {
  const config = getConfig();
  if (!config.token) throw new Error("Ledger not connected");

  const apiUrl = getApiUrl(config.serverUrl);
  const tag = courseCode.replace(/\s+/g, '');

  // Wrap the plan in markdown code block for Memos to render nicely (and for us to parse back)
  const memoContent = `#SurvivalPlan #${tag}\n\n**Protocol: ${plan.examType} (${plan.totalHours})**\n> ${plan.strategy}\n\n\`\`\`json\n${JSON.stringify(plan, null, 2)}\n\`\`\``;

  try {
    await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.token}`,
      },
      body: JSON.stringify({
        content: memoContent,
        visibility: "PUBLIC"
      })
    });
  } catch (error) {
    console.error("Failed to save survival plan", error);
    throw error;
  }
};