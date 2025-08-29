// API client for Interview Simulator Backend
const API_BASE_URL = 'http://localhost:8000/api';

// Types matching backend models
export interface InterviewConfig {
  persona_id: string;
  interview_type: string; 
  interview_length: string;
  job_description: string;
  cv_text?: string;
}

export interface InterviewSession {
  session_id: string;
  initial_greeting: string;
  status: string;
}

export interface PersonaInfo {
  id: string;
  name: string;
  description: string;
  style: string;
  difficulty: string;
  voice_id: string;
}

export interface InterviewFeedback {
  session_id: string;
  scores: {
    confidence: number;
    clarity: number;
    overall_fit: number;
  };
  improvements: string[];
  conversation_summary: string;
  duration: string;
  total_questions: number;
}

export interface CVExtractionResponse {
  success: boolean;
  extracted_text: string;
  error_message?: string;
}

export interface MessageResponse {
  response: string;
  question_count: number;
  session_status: string;
}

// API Client
class APIClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // CV Upload
  async extractCV(file: File): Promise<CVExtractionResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseURL}/cv/extract`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'CV extraction failed');
    }

    return await response.json();
  }

  // Personas
  async getPersonas(): Promise<PersonaInfo[]> {
    return this.request<PersonaInfo[]>('/personas');
  }

  // Interview Management
  async startInterview(config: InterviewConfig): Promise<InterviewSession> {
    return this.request<InterviewSession>('/interview/start', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  async getInterviewStatus(sessionId: string) {
    return this.request(`/interview/status/${sessionId}`);
  }

  async sendMessage(sessionId: string, content: string): Promise<MessageResponse> {
    return this.request<MessageResponse>(`/interview/message/${sessionId}`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  async stopInterview(sessionId: string): Promise<InterviewFeedback> {
    return this.request<InterviewFeedback>(`/interview/stop/${sessionId}`, {
      method: 'POST',
    });
  }

  // Health Check
  async healthCheck() {
    return this.request('/health');
  }
}

// WebSocket Manager for Voice Communication
export class VoiceWebSocketManager {
  private ws: WebSocket | null = null;
  private sessionId: string;
  private onMessage: (data: any) => void;
  private onError: (error: Event) => void;

  constructor(
    sessionId: string,
    onMessage: (data: any) => void,
    onError: (error: Event) => void
  ) {
    this.sessionId = sessionId;
    this.onMessage = onMessage;
    this.onError = onError;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const wsUrl = `ws://localhost:8000/api/interview/voice/${this.sessionId}`;
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        resolve();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.onMessage(data);
        } catch (error) {
          console.error('WebSocket message parse error:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.onError(error);
        reject(error);
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
      };
    });
  }

  sendAudio(audioData: ArrayBuffer) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      // Convert ArrayBuffer to base64
      const base64Audio = btoa(
        String.fromCharCode(...new Uint8Array(audioData))
      );
      
      this.ws.send(JSON.stringify({
        type: 'audio_chunk',
        audio_data: base64Audio,
      }));
    }
  }

  sendText(content: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'text_message',
        content,
      }));
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// Export API client instance
export const apiClient = new APIClient(API_BASE_URL);

// Export convenience functions
export const interviewAPI = {
  extractCV: (file: File) => apiClient.extractCV(file),
  getPersonas: () => apiClient.getPersonas(),
  startInterview: (config: InterviewConfig) => apiClient.startInterview(config),
  sendMessage: (sessionId: string, content: string) => apiClient.sendMessage(sessionId, content),
  stopInterview: (sessionId: string) => apiClient.stopInterview(sessionId),
  healthCheck: () => apiClient.healthCheck(),
};