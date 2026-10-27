import axios, { AxiosInstance } from 'axios';

export interface PublicMcpToolInfo {
  name: string;
  description: string;
  appId: string;
  parameters: Record<string, any>;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}

export class GatewayClient {
  private client: AxiosInstance;
  public readonly baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl =
      baseUrl ||
      process.env.RATA_GATEWAY_URL ||
      process.env.GHM_GATEWAY_URL ||
      'http://127.0.0.1:1408';

    const token =
      process.env.RATA_GATEWAY_TOKEN || process.env.GHM_GATEWAY_TOKEN;

    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 300_000, // 5 phút timeout cho request đồng bộ
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });
  }

  async health(): Promise<{ status: string; time: string }> {
    try {
      const res = await this.client.get('/api/v1/health');
      return res.data;
    } catch (err: any) {
      throw new Error(
        `Không thể kết nối đến RATA Gateway (${this.baseUrl}). Vui lòng đảm bảo ứng dụng RATA (GHM Automate v2) đang mở và cổng API 1408 đang bật.`
      );
    }
  }

  async getProfiles(params?: {
    page?: number;
    limit?: number;
    groupId?: number;
    name?: string;
  }): Promise<any> {
    const res = await this.client.get('/api/v1/profiles', { params });
    return res.data;
  }

  async getMcpTools(): Promise<PublicMcpToolInfo[]> {
    try {
      const res = await this.client.get('/api/v1/mcp/tools');
      return res.data?.data ?? [];
    } catch (err: any) {
      console.error(
        `[RATA GatewayClient] Chưa thể lấy danh sách MCP tools từ ${this.baseUrl}: ${err.message}`
      );
      return [];
    }
  }

  async callMcpTool(toolName: string, args: Record<string, any>): Promise<any> {
    try {
      const res = await this.client.post(
        `/api/v1/mcp/tools/${encodeURIComponent(toolName)}/call`,
        args
      );
      return res.data;
    } catch (err: any) {
      const message =
        err.response?.data?.error || err.response?.data?.message || err.message;
      throw new Error(`Lỗi khi gọi '${toolName}': ${message}`);
    }
  }

  async getJob(jobId: string): Promise<any> {
    const res = await this.client.get(
      `/api/v1/jobs/${encodeURIComponent(jobId)}`
    );
    return res.data?.data;
  }
}
