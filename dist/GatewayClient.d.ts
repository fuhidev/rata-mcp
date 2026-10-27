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
export declare class GatewayClient {
    private client;
    readonly baseUrl: string;
    constructor(baseUrl?: string);
    health(): Promise<{
        status: string;
        time: string;
    }>;
    getProfiles(params?: {
        page?: number;
        limit?: number;
        groupId?: number;
        name?: string;
    }): Promise<any>;
    getMcpTools(): Promise<PublicMcpToolInfo[]>;
    callMcpTool(toolName: string, args: Record<string, any>): Promise<any>;
    getJob(jobId: string): Promise<any>;
}
