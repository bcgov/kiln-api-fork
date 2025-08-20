import express from 'express';

// Controllers
import DefaultController from './default.controller';
import CommunicationsController from './communications.controller';
import RendererController from './renderer.controller';

const router = express.Router();

// Default / Health Check Routes
router.get('/', DefaultController.all);
router.post('/', DefaultController.create);
router.get('/:id', DefaultController.byId);

// Communications Layer Routes
router.post('/saveData', CommunicationsController.saveData);
router.post('/generate', CommunicationsController.generateForm);
router.post('/edit', CommunicationsController.editFormData);
router.post('/saveICMData', CommunicationsController.saveICMData);
router.post('/loadICMData', CommunicationsController.loadICMData);
router.post('/clearICMLockedFlag', CommunicationsController.clearICMLockedFlag);
router.post('/loadSavedJson', CommunicationsController.loadSavedJson);
router.post('/pdfRender', CommunicationsController.pdfRender);
router.post('/generatePDFFromJson', CommunicationsController.generatePDFFromJson);
router.post('/generateNewTemplate', CommunicationsController.generateNewTemplate);

// Kiln Renderer Routes
router.get('/view', RendererController.viewForm);
router.get('/edit', RendererController.editForm);

export default router;
