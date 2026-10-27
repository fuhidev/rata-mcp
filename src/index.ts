#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema
} from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';
import { GatewayClient } from './GatewayClient.js';

dotenv.config();

const gateway = new GatewayClient();

const server = new Server(
  {
    name: 'rata-mcp',
    version: '2.0.0'
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

/**
 * Danh sách tools tĩnh (RATA Core & Hệ thống - v2 với alias tương thích ngược v1)
 */
const staticTools = [
  {
    name: 'rata_health',
    description:
      'Check that the RATA Gateway (GHM Automate v2, port 1408) is running and reachable. / Kiểm tra kết nối và tình trạng hoạt động của RATA Gateway (cổng 1408)',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'ghm_health',
    description:
      '[Legacy v1 alias] Check that the GHM Automate app is running. Recommend using rata_health.',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'rata_list_profiles',
    description:
      'List antidetect browser profiles (GHM, GemLogin, etc.) managed by RATA to select a profile_name for automation tasks. / Lấy danh sách profile trình duyệt antidetect',
    inputSchema: {
      type: 'object',
      properties: {
        page: {
          type: 'number',
          description: 'Số trang cần lấy (mặc định: 1)'
        },
        limit: {
          type: 'number',
          description: 'Số lượng profile mỗi trang (mặc định: 50)'
        },
        name: {
          type: 'string',
          description: 'Lọc profile theo tên'
        }
      }
    }
  },
  {
    name: 'ghm_list_profiles',
    description:
      '[Legacy v1 alias] List antidetect browser profiles. Recommend using rata_list_profiles.',
    inputSchema: {
      type: 'object',
      properties: {
        page: {
          type: 'number',
          description: 'Số trang cần lấy (mặc định: 1)'
        },
        limit: {
          type: 'number',
          description: 'Số lượng profile mỗi trang (mặc định: 50)'
        },
        name: {
          type: 'string',
          description: 'Lọc profile theo tên'
        }
      }
    }
  },
  {
    name: 'rata_get_job_status',
    description:
      'Get status and detailed result of an automation job by jobId in RATA. / Kiểm tra trạng thái và kết quả của một job bằng jobId',
    inputSchema: {
      type: 'object',
      properties: {
        job_id: {
          type: 'string',
          description: 'Mã jobId của tác vụ cần kiểm tra'
        }
      },
      required: ['job_id']
    }
  },
  {
    name: 'ghm_get_job_status',
    description:
      '[Legacy v1 alias] Get job status by jobId. Recommend using rata_get_job_status.',
    inputSchema: {
      type: 'object',
      properties: {
        job_id: {
          type: 'string',
          description: 'Mã jobId của tác vụ cần kiểm tra'
        }
      },
      required: ['job_id']
    }
  }
];

// 1. Khai báo danh sách Tools cho LLM
server.setRequestHandler(ListToolsRequestSchema, async () => {
  // Lấy danh sách các MCP tools động (bao gồm rata_browser_* và các scripts v2)
  const dynamicTools = await gateway.getMcpTools();

  const formattedDynamicTools = dynamicTools.map((tool) => ({
    name: tool.name,
    description: tool.description,
    inputSchema: tool.inputSchema
  }));

  return {
    tools: [...staticTools, ...formattedDynamicTools]
  };
});

// 2. Xử lý khi LLM gọi một Tool
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;

  try {
    if (name === 'rata_health' || name === 'ghm_health') {
      const health = await gateway.health();
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(health, null, 2)
          }
        ]
      };
    }

    if (name === 'rata_list_profiles' || name === 'ghm_list_profiles') {
      const profiles = await gateway.getProfiles(args);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(profiles, null, 2)
          }
        ]
      };
    }

    if (name === 'rata_get_job_status' || name === 'ghm_get_job_status') {
      const jobId = (args.job_id || args.jobId) as string;
      if (!jobId) {
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: 'Thiếu tham số job_id'
            }
          ]
        };
      }
      const job = await gateway.getJob(jobId);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(job, null, 2)
          }
        ]
      };
    }

    // Các tools động (rata_browser_*, post_fanpage_facebook, v.v.)
    const result = await gateway.callMcpTool(name, args);
    if (result?.data?.content && Array.isArray(result.data.content)) {
      return {
        content: result.data.content,
        isError: result.data.isError
      };
    }
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }
      ]
    };
  } catch (error: any) {
    return {
      isError: true,
      content: [
        {
          type: 'text',
          text: error.message || 'Lỗi không xác định khi thực thi tool'
        }
      ]
    };
  }
});

async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('[RATA MCP Server] Đã kết nối qua Stdio transport thành công (v2.0.0).');
}

run().catch((error) => {
  console.error('[RATA MCP Server] Lỗi khởi động:', error);
  process.exit(1);
});
