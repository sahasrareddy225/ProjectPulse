import type { ChatMessage } from '../types/ai';

// Purely demo/mock responses for UI testing.
// DO NOT use this to simulate real intelligence.

const DEMO_WARNING = "\n\n[Demo Mode: The AI service is not connected. This is a mock response.]";

export const getMockResponse = async (query: string): Promise<ChatMessage> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  const lowerQuery = query.toLowerCase();
  let content = "I am the ProjectPulse AI Assistant frontend UI. I am not currently connected to the backend intelligence service, so I cannot analyze your project data yet.";
  
  if (lowerQuery.includes('overdue')) {
    content = "The AI Assistant will analyze your project task data and identify overdue work, explaining the root causes and impacted dependencies.";
  } else if (lowerQuery.includes('risk') || lowerQuery.includes('blocked')) {
    content = "The AI Assistant will use ProjectPulse workflow intelligence and task priority metrics to assess project health and highlight areas at risk.";
  } else if (lowerQuery.includes('workload') || lowerQuery.includes('team')) {
    content = "The AI Assistant will compute assignee distribution and highlight any team members who are overallocated or facing bottlenecks.";
  } else if (lowerQuery.includes('error')) {
    // Hidden command for UI testing
    throw new Error('Simulated AI connection failure.');
  }

  return {
    id: `msg-mock-${Date.now()}`,
    role: 'assistant',
    content: content + DEMO_WARNING,
    timestamp: new Date().toISOString(),
    isDemo: true,
  };
};
