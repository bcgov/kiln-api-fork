import { Request, Response } from 'express';

export class DefaultController {
  all(_: Request, res: Response): void {
    res.json({ status: 'Kiln API Gateway is running.' });
  }

  byId(req: Request, res: Response): void {
    const id = req.params['id'];
    res.json({ message: `Received request for ID: ${id}` });
  }

  create(req: Request, res: Response): void {
    res.status(201).json({ message: 'Create endpoint hit', data: req.body });
  }
}

export default new DefaultController();
