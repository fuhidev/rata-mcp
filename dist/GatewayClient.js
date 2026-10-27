import axios from 'axios';
export class GatewayClient {
    client;
    baseUrl;
    constructor(baseUrl) {
        this.baseUrl =
            baseUrl ||
                process.env.RATA_GATEWAY_URL ||
                process.env.GHM_GATEWAY_URL ||
                'http://127.0.0.1:1408';
        const token = process.env.RATA_GATEWAY_TOKEN || process.env.GHM_GATEWAY_TOKEN;
        this.client = axios.create({
            baseURL: this.baseUrl,
            timeout: 300_000, // 5 phút timeout cho request đồng bộ
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {})
            }
        });
    }
    async health() {
        try {
            const res = await this.client.get('/api/v1/health');
            return res.data;
        }
        catch (err) {
            throw new Error(`Không thể kết nối đến RATA Gateway (${this.baseUrl}). Vui lòng đảm bảo ứng dụng RATA (GHM Automate v2) đang mở và cổng API 1408 đang bật.`);
        }
    }
    async getProfiles(params) {
        const res = await this.client.get('/api/v1/profiles', { params });
        return res.data;
    }
    async getMcpTools() {
        try {
            const res = await this.client.get('/api/v1/mcp/tools');
            return res.data?.data ?? [];
        }
        catch (err) {
            console.error(`[RATA GatewayClient] Chưa thể lấy danh sách MCP tools từ ${this.baseUrl}: ${err.message}`);
            return [];
        }
    }
    async callMcpTool(toolName, args) {
        try {
            const res = await this.client.post(`/api/v1/mcp/tools/${encodeURIComponent(toolName)}/call`, args);
            return res.data;
        }
        catch (err) {
            const message = err.response?.data?.error || err.response?.data?.message || err.message;
            throw new Error(`Lỗi khi gọi '${toolName}': ${message}`);
        }
    }
    async getJob(jobId) {
        const res = await this.client.get(`/api/v1/jobs/${encodeURIComponent(jobId)}`);
        return res.data?.data;
    }
}
