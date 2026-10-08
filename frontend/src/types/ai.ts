// AI Assistant UI Models
// These models represent the frontend interface only.
// They are structured to eventually consume the backend AI Service payload.

export type ChatRole = 'user' | 'assistant';

export interface EvidenceItem {
  id: string;
  type: 'project' | 'task' | 'document' | 'workflow';
  title: string;
  url?: string; // Potential future navigation link
  snippet?: string; // Highlighted context from RAG
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: string; // ISO date string
  
  // Future fields preparing for AI Service Integration:
  isDemo?: boolean; // Temporary flag to clearly mark demo responses
  evidence?: EvidenceItem[]; // Grounded context returned from Vector Search / Aggregation
  isError?: boolean;
}

// Future conceptual API request payload
export interface AIQueryRequest {
  message: string;
  projectId: string; // 'ALL' or specific project ID
}
