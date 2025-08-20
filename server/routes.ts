import { Application } from 'express';

// Routers
import defaultRouter from './api/controllers/router';

export default function routes(app: Application): void {

  app.use('/api', defaultRouter);

}

