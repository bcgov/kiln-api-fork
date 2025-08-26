import 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import { ICMService } from '../server/api/services/icm.service';
import { ICMClient } from '../server/api/services/icm.client';

describe('ICMService', () => {
  let icmService: ICMService;
  let icmClientStub: sinon.SinonStubbedInstance<ICMClient>;

  beforeEach(() => {
    icmService = new ICMService();
    icmClientStub = sinon.createStubInstance(ICMClient);
    (icmService as any).icmClient = icmClientStub;
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('saveICMData', () => {
    it('should successfully save ICM data with all required fields', async () => {
      const testData = {
        attachmentId: 'test-123',
        OfficeName: 'Test Office',
        username: 'testuser',
        savedForm: { field1: 'value1', field2: 'value2' },
      };

      const mockResponse = {
        ok: true,
        json: sinon.stub().resolves({ id: 'saved-123', status: 'success' }),
      };

      icmClientStub.saveICMData.resolves(mockResponse as any);

      const result = await icmService.saveICMData(testData, 'test-token');

      expect(result.success).to.be.true;
      expect(result.data).to.deep.equal({ id: 'saved-123', status: 'success' });
      expect(icmClientStub.saveICMData.calledOnce).to.be.true;

      const calledPayload = icmClientStub.saveICMData.getCall(0).args[0];
      expect(calledPayload).to.deep.equal({
        attachmentId: 'test-123',
        OfficeName: 'Test Office',
        savedForm: { field1: 'value1', field2: 'value2' },
        token: 'test-token',
      });
    });
  });

  describe('loadICMData', () => {
    it('should successfully load ICM data with token', async () => {
      const testData = {
        username: 'testuser',
        formId: 'form-123',
        originalServer: 'https://original.example.com',
      };

      const mockResponse = {
        ok: true,
        json: sinon
          .stub()
          .resolves({ formData: { field1: 'value1' }, status: 'loaded' }),
      };

      icmClientStub.loadICMData.resolves(mockResponse as any);

      const result = await icmService.loadICMData(testData, 'test-token');

      expect(result.success).to.be.true;
      expect(result.data).to.deep.equal({
        formData: { field1: 'value1' },
        status: 'loaded',
      });
      expect(icmClientStub.loadICMData.calledOnce).to.be.true;

      const [calledPayload, originalServer] =
        icmClientStub.loadICMData.getCall(0).args;
      expect(calledPayload).to.deep.equal({
        formId: 'form-123',
        token: 'test-token',
      });
      expect(originalServer).to.equal('https://original.example.com');
    });

    it('should successfully load ICM data with username when no token provided', async () => {
      const testData = {
        username: 'testuser',
        formId: 'form-123',
      };

      const mockResponse = {
        ok: true,
        json: sinon.stub().resolves({ formData: { field1: 'value1' } }),
      };

      icmClientStub.loadICMData.resolves(mockResponse as any);

      const result = await icmService.loadICMData(testData);

      expect(result.success).to.be.true;
      expect(icmClientStub.loadICMData.calledOnce).to.be.true;

      const [calledPayload] = icmClientStub.loadICMData.getCall(0).args;
      expect(calledPayload).to.deep.equal({
        formId: 'form-123',
        username: 'testuser',
      });
    });

    it('should return error when neither token nor username is provided', async () => {
      const testData = {
        formId: 'form-123',
      };

      const result = await icmService.loadICMData(testData);

      expect(result.success).to.be.false;
      expect(result.error).to.equal(
        'Authentication required: either token or username must be provided'
      );
      expect(result.status).to.equal(401);
      expect(icmClientStub.loadICMData.called).to.be.false;
    });

    it('should return error when username is empty string', async () => {
      const testData = {
        username: '   ',
        formId: 'form-123',
      };

      const result = await icmService.loadICMData(testData);

      expect(result.success).to.be.false;
      expect(result.error).to.equal(
        'Authentication required: either token or username must be provided'
      );
      expect(result.status).to.equal(401);
    });

    it('should handle ICM client API error responses', async () => {
      const testData = {
        username: 'testuser',
        formId: 'form-123',
      };

      const mockResponse = {
        ok: false,
        status: 404,
        json: sinon.stub().resolves({ error: 'Form not found' }),
      };

      icmClientStub.loadICMData.resolves(mockResponse as any);

      const result = await icmService.loadICMData(testData);

      expect(result.success).to.be.false;
      expect(result.error).to.equal('Form not found');
      expect(result.status).to.equal(404);
    });

    it('should handle ICM client API error responses with default error message', async () => {
      const testData = {
        username: 'testuser',
        formId: 'form-123',
      };

      const mockResponse = {
        ok: false,
        status: 500,
        json: sinon.stub().resolves({}),
      };

      icmClientStub.loadICMData.resolves(mockResponse as any);

      const result = await icmService.loadICMData(testData);

      expect(result.success).to.be.false;
      expect(result.error).to.equal('Error loading form. Please try again.');
      expect(result.status).to.equal(500);
    });

    it('should handle ICM client exceptions', async () => {
      const testData = {
        username: 'testuser',
        formId: 'form-123',
      };

      const error = new Error('Network connection failed');
      icmClientStub.loadICMData.rejects(error);

      const result = await icmService.loadICMData(testData);

      expect(result.success).to.be.false;
      expect(result.error).to.equal(
        'Failed to load ICM data: Network connection failed'
      );
      expect(result.status).to.equal(500);
    });

    it('should handle unknown errors', async () => {
      const testData = {
        username: 'testuser',
        formId: 'form-123',
      };

      icmClientStub.loadICMData.rejects(new Error('Unknown error'));

      const result = await icmService.loadICMData(testData);

      expect(result.success).to.be.false;
      expect(result.error).to.equal('Failed to load ICM data: Unknown error');
      expect(result.status).to.equal(500);
    });
  });
});
