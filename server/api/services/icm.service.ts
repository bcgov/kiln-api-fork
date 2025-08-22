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

export class ICMService {
  private icmClient: ICMClient;

  constructor() {
    this.icmClient = new ICMClient();
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

      // Use the ICMClient saveICMData method instead of direct fetch
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
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      L.error('Error saving ICM data:', error);
      return {
        success: false,
        error: `Failed to save ICM data: ${errorMessage}`,
        status: 500,
      };
    }
  }
}

export default new ICMService();
