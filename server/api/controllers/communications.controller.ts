import { Request, Response } from 'express';

export class CommunicationsController {
  saveData(req: Request, res: Response): void {
    res.json({ endpoint: 'saveData', payload: req.body });
  }

  generateForm(req: Request, res: Response): void {
    res.json({ endpoint: 'generate', payload: req.body });
  }

  editFormData(req: Request, res: Response): void {
    res.json({ endpoint: 'edit', payload: req.body });
  }

  saveICMData(req: Request, res: Response): void {
    res.json({ endpoint: 'saveICMData', payload: req.body });
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
