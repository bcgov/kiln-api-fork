import { Request, Response } from 'express';
import ICMService from '../services/icm.service';

export class CommunicationsController {
  saveData(req: Request, res: Response): void {
    res.json({ endpoint: 'saveForm', payload: req.body });
  }

  generateForm(req: Request, res: Response): void {
    res.json({ endpoint: 'generateForm', payload: req.body });
  }

  editFormData(req: Request, res: Response): void {
    res.json({ endpoint: 'editForm', payload: req.body });
  }

  async saveICMData(req: Request, res: Response): Promise<void> {
    const { attachmentId, OfficeName, username, savedForm } = req.body;

    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.substring(7)
      : authHeader;

    // TODO: Implement authentication/authorization when available

    const result = await ICMService.saveICMData(
      { attachmentId, OfficeName, username, savedForm },
      token
    );

    if (result.success) {
      res.status(200).json({ message: 'success' });
    } else {
      res.status(result.status || 500).json({ error: result.error });
    }
  }

  loadICMData(req: Request, res: Response): void {
    res.json({ endpoint: 'loadICMData', payload: req.body });
  }

  clearICMLockedFlag(req: Request, res: Response): void {
    res.json({ endpoint: 'clearICMLockedFlag', payload: req.body });
  }

  loadSavedJson(req: Request, res: Response): void {
    res.json({ endpoint: 'loadSavedJson', payload: req.body });
  }

  pdfRender(req: Request, res: Response): void {
    res.json({ endpoint: 'pdfRender', payload: req.body });
  }

  generatePDFFromJson(req: Request, res: Response): void {
    res.json({ endpoint: 'generatePDFFromJson', payload: req.body });
  }

  generateNewTemplate(req: Request, res: Response): void {
    res.json({ endpoint: 'generateNewTemplate', payload: req.body });
  }
}

export default new CommunicationsController();
