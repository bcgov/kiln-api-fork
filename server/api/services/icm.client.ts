import axios from 'axios';
import L from '../../common/logger';
import * as process from 'node:process';

interface ICMApiResponse {
  ok: boolean;
  status: number;
  json(): Promise<any>;
}

export class ICMClient {
  async saveICMData(payload: any): Promise<ICMApiResponse> {
    try {
      const url = process.env.COMM_API_SAVEDATA_ICM_ENDPOINT_URL;

      if (!url) {
        throw new Error(
          'COMM_API_SAVEDATA_ICM_ENDPOINT_URL environment variable is required'
        );
      }

      const timeout = process.env.COMM_API_TIMEOUT
        ? parseInt(process.env.COMM_API_TIMEOUT, 10)
        : 30000;

      const response = await axios.post(url, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout,
      });

      return {
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        json: async () => response.data,
      };
    } catch (error) {
      L.error('ICMClient saveICMData request failed:', error);

      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as any;
        const status = axiosError.response?.status || 500;
        return {
          ok: false,
          status,
          json: async () => axiosError.response?.data || {},
        };
      }

      throw error;
    }
  }
}
