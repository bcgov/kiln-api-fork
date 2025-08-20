import { Request, Response } from 'express';

export class RendererController {
  viewForm(_req: Request, res: Response): void {
    res.json({ endpoint: 'view', message: 'Rendering view-only form' });
  }

  editForm(_req: Request, res: Response): void {
    res.json({ endpoint: 'edit', message: 'Rendering editable form' });
  }
}

export default new RendererController();
