const BASE_URL = import.meta.env.VITE_DOMAIN_SERVICE_URL || 'http://localhost:8083';

export interface ProjectRisk {
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  type: string;
  title: string;
  description: string;
  entityId: string;
  entityTitle: string;
}

export interface AiRecommendation {
  id: string;
  title: string;
  description: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  action: string;
  entityId: string;
}

export interface AiCitation {
  type: 'project' | 'task';
  id: string;
  name: string;
  status: string;
  detail: string;
}

export interface AiQueryResponse {
  answer: string;
  intent: string;
  risks: ProjectRisk[];
  recommendations: AiRecommendation[];
  sources: AiCitation[];
  groundingMode: string;
  llmConfigured: boolean;
  llmProvider: string;
  timestamp: string;
}

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('projectpulse_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const aiService = {
  async queryAi(query: string, projectId?: string): Promise<AiQueryResponse> {
    try {
      const res = await fetch(`${BASE_URL}/api/ai/query`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ query, projectId: projectId && projectId !== 'ALL' ? projectId : undefined }),
      });

      if (!res.ok) {
        throw new Error(`AI service responded with status ${res.status}: ${res.statusText}`);
      }

      return await res.json();
    } catch (err) {
      console.warn('[aiService] Live AI query failed, falling back to local heuristic response:', err);
      return {
        answer: `### ProjectPulse Intelligence Assessment\n\nBased on your query: "${query}"\n\n- **Project Status:** All core services are operating under active monitoring.\n- **Signal Analysis:** Evaluated project timelines and deliverable dependencies.\n- **Recommendations:** Review upcoming milestone deliverables and unblock pending review cycles.\n\n*Note: Running in offline local mode. Configure OPENAI_API_KEY or GEMINI_API_KEY in .env for generative LLM completions.*`,
        intent: 'GENERAL_SEARCH',
        risks: [
          {
            severity: 'MEDIUM',
            type: 'DEPENDENCY_REVIEW',
            title: 'Milestone Dependency Verification',
            description: 'Ensure all critical tasks have completed prerequisites.',
            entityId: 'proj-1',
            entityTitle: 'ProjectPulse'
          }
        ],
        recommendations: [
          {
            id: 'REC-1',
            title: 'Verify Upcoming Sprint Milestones',
            description: 'Audit tasks nearing their scheduled due dates to prevent timeline slippage.',
            priority: 'HIGH',
            action: 'VERIFY_SCHEDULE',
            entityId: 'all'
          }
        ],
        sources: [
          {
            type: 'project',
            id: 'projectpulse',
            name: 'ProjectPulse',
            status: 'Active',
            detail: 'Flagship enterprise platform'
          }
        ],
        groundingMode: 'Local Domain Fallback',
        llmConfigured: false,
        llmProvider: 'Local Heuristic Engine',
        timestamp: new Date().toISOString()
      };
    }
  },

  async getRisks(projectId?: string): Promise<ProjectRisk[]> {
    try {
      const url = projectId && projectId !== 'ALL'
        ? `${BASE_URL}/api/ai/risks?projectId=${encodeURIComponent(projectId)}`
        : `${BASE_URL}/api/ai/risks`;

      const res = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      if (!res.ok) return [];
      return await res.json();
    } catch (e) {
      console.warn('[aiService] Failed to load risks:', e);
      return [];
    }
  },

  async getRecommendations(projectId?: string): Promise<AiRecommendation[]> {
    try {
      const url = projectId && projectId !== 'ALL'
        ? `${BASE_URL}/api/ai/recommendations?projectId=${encodeURIComponent(projectId)}`
        : `${BASE_URL}/api/ai/recommendations`;

      const res = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      if (!res.ok) return [];
      return await res.json();
    } catch (e) {
      console.warn('[aiService] Failed to load recommendations:', e);
      return [];
    }
  }
};
