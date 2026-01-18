
export interface SyllabusData {
  courseCode: string;
  content: string;
  source: 'LIVE' | 'MOCK';
  timestamp: string;
}

export enum FetchStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface RedditResponse {
  data: {
    children: Array<{
      data: {
        title: string;
        selftext: string;
        subreddit?: string;
      }
    }>
  }
}

export interface ProfessorRating {
  found: boolean;
  quality: string;
  difficulty: string;
  takeAgain: string;
  summary: string;
  name?: string;
}

// --- DOOMSDAY PROTOCOL TYPES ---

export interface CramItem {
  timeblock: string;
  action: string;
  priority: string;
  notes: string;
  videoSuggestion?: {
    title: string;
    url: string;
  };
}

export interface CramPlan {
  id?: number; // From OpenNote
  examType: string; // Midterm, Final, etc.
  totalHours: string;
  strategy: string; // The "Surgeon's" overall advice
  schedule: CramItem[];
  createdTs?: number;
}