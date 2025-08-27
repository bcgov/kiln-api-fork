import L from '../../common/logger';
import { ICMClient } from './icm.client';

interface SaveICMDataPayload {
  attachmentId: string;
  OfficeName: string;
  savedForm: any;
  token?: string;
  username?: string;
}

interface SaveICMDataRequest {
  attachmentId: string;
  OfficeName: string;
  username?: string;
  savedForm: any;
}

interface SaveICMDataResult {
  success: boolean;
  data?: any;
  error?: string;
  status?: number;
}

interface LoadICMDataPayload {
  token?: string;
  username?: string;
  originalServer?: string;
  [key: string]: any;
}

interface LoadICMDataRequest {
  username?: string;
  originalServer?: string;
  [key: string]: any;
}

interface UnlockICMDataPayload {
  token?: string;
  username?: string;
  [key: string]: any;
}

interface UnlockICMDataRequest {
  username?: string;
  [key: string]: any;
}

interface ICMDataResult {
  success: boolean;
  data?: any;
  error?: string;
  status?: number;
}

export class ICMService {
  private icmClient: ICMClient;

  constructor() {
    this.icmClient = new ICMClient();
  }

  private handleError(
    error: unknown,
    operation: string
  ): SaveICMDataResult | ICMDataResult {
    const errorMessage =
      error instanceof Error
        ? error.message
        : typeof error === 'string'
        ? error
        : 'Unknown error occurred';

    L.error(`Error ${operation} ICM data:`, error);

    return {
      success: false,
      error: `Failed to ${operation} ICM data: ${errorMessage}`,
      status: 500,
    };
  }

  async saveICMData(
    data: SaveICMDataRequest,
    token?: string
  ): Promise<SaveICMDataResult> {
    try {
      const { attachmentId, OfficeName, username, savedForm } = data;

      if (!attachmentId || !OfficeName || !savedForm) {
        return {
          success: false,
          error:
            'Missing required fields: attachmentId, OfficeName, or savedForm',
          status: 400,
        };
      }

      const payload: SaveICMDataPayload = {
        attachmentId,
        OfficeName,
        savedForm,
      };

      if (token) {
        payload.token = token;
      } else if (username?.trim()) {
        payload.username = username;
      } else {
        L.warn('No authentication provided for ICM data save');
      }

      const response = await this.icmClient.saveICMData(payload);

      if (response.ok) {
        const result = await response.json();
        L.info('ICM Data saved successfully:', result);
        return {
          success: true,
          data: result,
        };
      } else {
        const errorData = (await response.json().catch(() => ({}))) as any;
        const errorMessage =
          errorData?.error || 'Error saving form. Please try again.';
        L.error('ICMClient API Error:', errorMessage);
        return {
          success: false,
          error: errorMessage,
          status: response.status,
        };
      }
    } catch (error) {
      return this.handleError(error, 'saving');
    }
  }

  async loadICMData(
    data: LoadICMDataRequest,
    token?: string
  ): Promise<ICMDataResult> {
    try {
      const { username, originalServer, ...params } = data;

      const payload: LoadICMDataPayload = {
        ...params,
      };

      if (token) {
        payload.token = token;
      } else if (username?.trim()) {
        payload.username = username;
      } else {
        L.warn('No authentication provided for ICM data load');
        return {
          success: false,
          error:
            'Authentication required: either token or username must be provided',
          status: 401,
        };
      }

      const response = await this.icmClient.loadICMData(
        payload,
        originalServer
      );

      if (response.ok) {
        const result = await response.json();
        L.info('ICM Data loaded successfully');
        return {
          success: true,
          data: result,
        };
      } else {
        const errorData = (await response.json().catch(() => ({}))) as any;
        const errorMessage =
          errorData?.error || 'Error loading form. Please try again.';
        L.error('ICMClient API Error:', errorMessage);
        return {
          success: false,
          error: errorMessage,
          status: response.status,
        };
      }
    } catch (error) {
      return this.handleError(error, 'loading');
    }
  }

  async unlockICMData(
    data: UnlockICMDataRequest,
    token?: string
  ): Promise<ICMDataResult> {
    try {
      const { username, ...params } = data;

      const payload: UnlockICMDataPayload = {
        ...params,
      };

      if (token) {
        payload.token = token;
      } else if (username?.trim()) {
        payload.username = username;
      } else {
        L.warn('No authentication provided for ICM unlock operation');
        return {
          success: false,
          error:
            'Authentication required: either token or username must be provided',
          status: 401,
        };
      }

      const response = await this.icmClient.unlockICMData(payload);

      if (response.ok) {
        const result = await response.json();
        L.info('ICM Data unlocked successfully');
        return {
          success: true,
          data: result,
        };
      } else {
        const errorData = (await response.json().catch(() => ({}))) as any;
        const errorMessage =
          errorData?.error || 'Error unlocking ICM form. Please try again.';
        L.error('ICMClient API Error:', errorMessage);
        return {
          success: false,
          error: errorMessage,
          status: response.status,
        };
      }
    } catch (error) {
      return this.handleError(error, 'unlocking');
    }
  }
}

export default new ICMService();
