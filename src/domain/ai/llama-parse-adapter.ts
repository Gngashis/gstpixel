import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { LlamaParseOptions } from './types';

const LLAMA_CLOUD_V2_BASE_URL = 'https://api.cloud.llamaindex.ai/api/v2';

export function resolveLlamaCloudApiKey(overrideKey?: string): string | null {
  if (overrideKey && overrideKey.trim()) return overrideKey.trim();
  if (process.env.LLAMA_CLOUD_API_KEY && process.env.LLAMA_CLOUD_API_KEY.trim()) {
    return process.env.LLAMA_CLOUD_API_KEY.trim();
  }

  // Fallback to secure local config file
  try {
    const configPath = path.join(os.homedir(), '.config', 'llamaindex', 'env');
    if (fs.existsSync(configPath)) {
      const content = fs.readFileSync(configPath, 'utf8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (trimmed.startsWith('LLAMA_CLOUD_API_KEY=')) {
          let key = trimmed.split('=')[1]?.trim();
          if (key) {
            key = key.replace(/^["']|["']$/g, '');
            return key;
          }
        }
      }
    }
  } catch {
    // Fail silently without exposing environment errors
  }

  return null;
}

export interface ParsingUploadResponse {
  id: string;
  status: string;
  name?: string;
  tier?: string;
}

export interface ParsingStatusResponse {
  id: string;
  status: 'PENDING' | 'COMPLETED' | 'ERROR';
  error_message?: string;
  markdown_full?: string;
}

export interface LlamaParseClient {
  uploadFile(fileBuffer: Buffer, fileName: string, options?: LlamaParseOptions): Promise<ParsingUploadResponse>;
  checkJobStatus(jobId: string, options?: LlamaParseOptions): Promise<ParsingStatusResponse>;
  getJobMarkdown(jobId: string, options?: LlamaParseOptions): Promise<string>;
}

export function createLlamaParseClient(customKey?: string): LlamaParseClient {
  const apiKey = resolveLlamaCloudApiKey(customKey);

  const getHeaders = (opts?: LlamaParseOptions) => {
    const effectiveKey = opts?.apiKey || apiKey;
    if (!effectiveKey) {
      throw new Error('LLAMA_CLOUD_API_KEY is not configured.');
    }
    return {
      Authorization: `Bearer ${effectiveKey}`,
    };
  };

  return {
    async uploadFile(fileBuffer: Buffer, fileName: string, options?: LlamaParseOptions): Promise<ParsingUploadResponse> {
      const headers = getHeaders(options);
      const boundary = '----LlamaParseFormBoundary' + Math.random().toString(36).substring(2);

      const tier = options?.tier === 'premium' ? 'agentic' : 'cost_effective';
      const configJson = JSON.stringify({
        tier,
        version: 'latest',
        language: options?.language || 'en',
      });

      const parts: Buffer[] = [
        Buffer.from(
          `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${fileName}"\r\nContent-Type: application/octet-stream\r\n\r\n`
        ),
        fileBuffer,
        Buffer.from(
          `\r\n--${boundary}\r\nContent-Disposition: form-data; name="configuration"\r\n\r\n${configJson}\r\n--${boundary}--\r\n`
        ),
      ];
      const payload = Buffer.concat(parts);

      const res = await fetch(`${LLAMA_CLOUD_V2_BASE_URL}/parse/upload`, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
        },
        body: payload,
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`LlamaParse v2 upload failed HTTP ${res.status}: ${errorText.slice(0, 200)}`);
      }

      const data = (await res.json()) as { id: string; status: string; name?: string; tier?: string };
      return {
        id: data.id,
        status: data.status,
        name: data.name,
        tier: data.tier,
      };
    },

    async checkJobStatus(jobId: string, options?: LlamaParseOptions): Promise<ParsingStatusResponse> {
      const headers = getHeaders(options);
      const res = await fetch(`${LLAMA_CLOUD_V2_BASE_URL}/parse/${encodeURIComponent(jobId)}?expand=markdown_full`, {
        method: 'GET',
        headers,
      });

      if (!res.ok) {
        throw new Error(`LlamaParse v2 check failed HTTP ${res.status}`);
      }

      const data = (await res.json()) as {
        job?: { id: string; status: string; error_message?: string };
        markdown_full?: string;
      };

      const job = data.job || { id: jobId, status: 'PENDING' };
      return {
        id: job.id,
        status: (job.status === 'COMPLETED' ? 'COMPLETED' : job.status === 'ERROR' ? 'ERROR' : 'PENDING') as ParsingStatusResponse['status'],
        error_message: job.error_message,
        markdown_full: data.markdown_full,
      };
    },

    async getJobMarkdown(jobId: string, options?: LlamaParseOptions): Promise<string> {
      const statusRes = await this.checkJobStatus(jobId, options);
      if (statusRes.markdown_full) {
        return statusRes.markdown_full;
      }
      return '';
    },
  };
}
