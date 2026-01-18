import { RedditResponse } from '../types';

const MOCK_REVIEWS = [
  "The midterm is identical to the practice exam. Don't waste time on the textbook, just grind the past papers.",
  "Warning: The professor loves trick questions on 'exceptions to the rule'. Memorize the edge cases.",
  "The group project is 40% of the grade. If you get bad teammates, go to office hours immediately.",
  "Lectures are recorded but the audio is terrible. You actually have to go to class to hear the examples.",
  "Avoid the 8am section, the TA for the afternoon slot is way more helpful with the labs.",
  "They curve the final heavily because the average is usually around 55%. Don't panic if you fail the first quiz.",
  "The textbook PDF is in the class Discord. Do not buy it.",
  "Week 7 is the 'Panic Zone'. The workload triples out of nowhere."
];

const getMockData = (university: string, courseCode: string, professor?: string): string => {
  const profString = professor ? ` taught by ${professor}` : '';
  const header = `[SIMULATION MODE ACTIVE] Could not reach Reddit. Generated realistic student chatter for ${courseCode} at ${university}${profString}:`;
  
  const comments = MOCK_REVIEWS.map(review => {
    // Randomize slightly to make it feel less static
    return `- [r/${university}Student] ${review}`;
  }).join('\n');

  return `${header}\n\n${comments}`;
};

// Helper to process raw JSON into our string format
const processRedditJson = (json: any): string => {
  if (!json.data || !json.data.children || json.data.children.length === 0) {
    throw new Error("No results found for this course.");
  }

  return json.data.children.map((child: any) => {
    const sub = child.data.subreddit_name_prefixed || child.data.subreddit || 'r/college';
    const title = child.data.title;
    const text = child.data.selftext ? child.data.selftext.substring(0, 500) + "..." : "(No text content)";
    return `[Source: ${sub}] Title: ${title}\nDiscussion: ${text}`;
  }).join('\n\n');
};

export const fetchRedditData = async (university: string, courseCode: string, professor?: string): Promise<{ data: string; source: 'LIVE' | 'MOCK' }> => {
  // Construct Query
  const queryParts = [university, courseCode];
  if (professor && professor.trim()) queryParts.push(professor);
  const query = queryParts.join(' ');
  
  // Reddit API Endpoint
  const redditUrl = `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&sort=relevance&limit=10&type=link`;

  // Proxy List - We try them in order
  const proxies = [
    // Proxy 1: corsproxy.io (Generally fast and reliable)
    { 
      url: `https://corsproxy.io/?${encodeURIComponent(redditUrl)}`,
      transform: async (res: Response) => await res.json()
    },
    // Proxy 2: allorigins.win (Reliable fallback, but needs JSON parsing of 'contents')
    { 
      url: `https://api.allorigins.win/get?url=${encodeURIComponent(redditUrl)}`,
      transform: async (res: Response) => {
        const wrapper = await res.json();
        return JSON.parse(wrapper.contents);
      }
    }
  ];

  for (const proxy of proxies) {
    try {
      console.log(`Attempting fetch via proxy...`);
      const response = await fetch(proxy.url);
      
      if (!response.ok) throw new Error(`Status ${response.status}`);
      
      const json = await proxy.transform(response);
      const data = processRedditJson(json);
      
      return { data, source: 'LIVE' };
    } catch (e) {
      console.warn(`Proxy failed:`, e);
      // Continue to next proxy loop
    }
  }

  // If all proxies fail:
  console.warn("All proxies failed. Switching to Mock Data.");
  return { data: getMockData(university, courseCode, professor), source: 'MOCK' };
};