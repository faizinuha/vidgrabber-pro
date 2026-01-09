// API Client untuk VidGrabber Pro Backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface DownloadRequest {
  url: string;
  quality?: string;
  format?: string;
  previewOnly?: boolean;
}

export interface VideoMetadata {
  title?: string;
  author?: string;
  videoId?: string;
  duration?: number;
  description?: string;
  sourceUrl?: string;
  musicInfo?: {
    title?: string;
    author?: string;
  } | null;
}

export interface DownloadResponse {
  success: boolean;
  downloadUrl?: string;
  metadata?: VideoMetadata;
  thumbnail?: string;
  platform?: string;
  filename?: string;
  error?: string;
  type?: string;
  options?: Array<{
    id: number;
    url: string;
    thumbnail?: string;
    type: string;
  }>;
}

class VideoDownloadAPI {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async downloadVideo(request: DownloadRequest): Promise<DownloadResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/download-video`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const data: DownloadResponse = await response.json();
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async previewVideo(url: string): Promise<DownloadResponse> {
    return this.downloadVideo({
      url,
      previewOnly: true,
    });
  }

  async healthCheck(): Promise<{ status: string; service: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/health`);
      if (!response.ok) {
        throw new Error('Health check failed');
      }
      return await response.json();
    } catch (error) {
      console.error('Health check error:', error);
      throw error;
    }
  }
}

export const videoAPI = new VideoDownloadAPI();
