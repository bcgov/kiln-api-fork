import 'mocha';
import { expect } from 'chai';
import request from 'supertest';
import sinon from 'sinon';
import Server from '../server';
import ICMService from '../server/api/services/icm.service';

describe('Communications Controller', () => {
  let loadICMDataStub: sinon.SinonStub;
  let unlockICMDataStub: sinon.SinonStub;
  let loadSavedJsonStub: sinon.SinonStub;
  let generateFormStub: sinon.SinonStub;

  beforeEach(() => {
    loadICMDataStub = sinon.stub(ICMService, 'loadICMData');
    unlockICMDataStub = sinon.stub(ICMService, 'unlockICMData');
    loadSavedJsonStub = sinon.stub(ICMService, 'loadSavedJson');
    generateFormStub = sinon.stub(ICMService, 'generateForm');
  });

  afterEach(() => {
    sinon.restore();
  });

  // Test sample of placeholder endpoints to verify basic connectivity
  it('should respond to POST /api/saveForm', () =>
    request(Server)
      .post('/api/saveForm')
      .send({ test: true })
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        expect(res.body).to.have.property('endpoint', 'saveForm');
        expect(res.body.payload).to.have.property('test', true);
      }));

  it('should respond to POST /api/generateForm', async () => {
    const testData = {
      test: true,
      username: 'testuser',
      formType: 'registration'
    };

    generateFormStub.resolves({
      success: true,
      data: { formId: 'generated-123', success: true },
    });

    const response = await request(Server)
      .post('/api/generateForm')
      .send(testData)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).to.deep.equal({ formId: 'generated-123', success: true });

    expect(generateFormStub.calledOnce).to.be.true;
    const [data, token] = generateFormStub.getCall(0).args;
    expect(data).to.deep.equal({
      test: true,
      formType: 'registration',
      username: 'testuser',
      originalServer: undefined,
    });
    expect(token).to.be.undefined;
  });

  describe('loadICMData endpoint', () => {
    it('should successfully load ICM data with username', async () => {
      const testData = {
        username: 'testuser',
        formId: 'form-123',
      };

      loadICMDataStub.resolves({
        success: true,
        data: { formData: { field1: 'value1' }, status: 'loaded' },
      });

      const response = await request(Server)
        .post('/api/loadICMData')
        .send(testData)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).to.deep.equal({
        formData: { field1: 'value1' },
        status: 'loaded',
      });

      expect(loadICMDataStub.calledOnce).to.be.true;
      const [data, token] = loadICMDataStub.getCall(0).args;
      expect(data).to.deep.equal({
        formId: 'form-123',
        username: 'testuser',
        originalServer: undefined,
      });
      expect(token).to.be.undefined;
    });

    it('should successfully load ICM data with token in Authorization header', async () => {
      const testData = {
        formId: 'form-123',
      };

      loadICMDataStub.resolves({
        success: true,
        data: { formData: { field1: 'value1' } },
      });

      const response = await request(Server)
        .post('/api/loadICMData')
        .set('Authorization', 'Bearer test-token-123')
        .send(testData)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).to.deep.equal({ formData: { field1: 'value1' } });

      const [data, token] = loadICMDataStub.getCall(0).args;
      expect(data).to.deep.equal({
        formId: 'form-123',
        username: undefined,
        originalServer: undefined,
      });
      expect(token).to.equal('test-token-123');
    });

    it('should pass through originalServer from headers', async () => {
      const testData = {
        username: 'testuser',
        formId: 'form-123',
      };

      loadICMDataStub.resolves({
        success: true,
        data: { formData: { field1: 'value1' } },
      });

      await request(Server)
        .post('/api/loadICMData')
        .set('x-original-server', 'https://original.example.com')
        .send(testData)
        .expect(200);

      const [data] = loadICMDataStub.getCall(0).args;
      expect(data.originalServer).to.equal('https://original.example.com');
    });

    it('should handle ICM service error responses', async () => {
      const testData = {
        username: 'testuser',
        formId: 'form-123',
      };

      loadICMDataStub.resolves({
        success: false,
        error: 'Form not found',
        status: 404,
      });

      const response = await request(Server)
        .post('/api/loadICMData')
        .send(testData)
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).to.deep.equal({ error: 'Form not found' });
    });

    it('should handle ICM service error with default status 500', async () => {
      const testData = {
        username: 'testuser',
        formId: 'form-123',
      };

      loadICMDataStub.resolves({
        success: false,
        error: 'Internal server error',
      });

      const response = await request(Server)
        .post('/api/loadICMData')
        .send(testData)
        .expect('Content-Type', /json/)
        .expect(500);

      expect(response.body).to.deep.equal({ error: 'Internal server error' });
    });
  });

  describe('clearICMLockedFlag endpoint', () => {
    it('should successfully clear ICM locked flag with username', async () => {
      const testData = {
        username: 'testuser',
        formId: 'form-123',
        lockId: 'lock-456',
      };

      unlockICMDataStub.resolves({
        success: true,
        data: { unlocked: true, formId: 'form-123', status: 'unlocked' },
      });

      const response = await request(Server)
        .post('/api/clearICMLockedFlag')
        .send(testData)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).to.deep.equal({
        unlocked: true,
        formId: 'form-123',
        status: 'unlocked',
      });

      expect(unlockICMDataStub.calledOnce).to.be.true;
      const [data, token] = unlockICMDataStub.getCall(0).args;
      expect(data).to.deep.equal({
        formId: 'form-123',
        lockId: 'lock-456',
        username: 'testuser',
      });
      expect(token).to.be.undefined;
    });

    it('should successfully clear ICM locked flag with token in Authorization header', async () => {
      const testData = {
        formId: 'form-123',
        lockId: 'lock-456',
      };

      unlockICMDataStub.resolves({
        success: true,
        data: { unlocked: true, formId: 'form-123' },
      });

      const response = await request(Server)
        .post('/api/clearICMLockedFlag')
        .set('Authorization', 'Bearer test-token-456')
        .send(testData)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).to.deep.equal({
        unlocked: true,
        formId: 'form-123',
      });

      const [data, token] = unlockICMDataStub.getCall(0).args;
      expect(data).to.deep.equal({
        formId: 'form-123',
        lockId: 'lock-456',
        username: undefined,
      });
      expect(token).to.equal('test-token-456');
    });

    it('should successfully clear ICM locked flag with token in request body', async () => {
      const testData = {
        token: 'body-token-789',
        formId: 'form-123',
        lockId: 'lock-456',
      };

      unlockICMDataStub.resolves({
        success: true,
        data: { unlocked: true },
      });

      const response = await request(Server)
        .post('/api/clearICMLockedFlag')
        .send(testData)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).to.deep.equal({ unlocked: true });

      const [data, token] = unlockICMDataStub.getCall(0).args;
      expect(data).to.deep.equal({
        formId: 'form-123',
        lockId: 'lock-456',
        username: undefined,
      });
      expect(token).to.equal('body-token-789');
    });

    it('should handle ICM service error responses', async () => {
      const testData = {
        username: 'testuser',
        formId: 'form-123',
        lockId: 'lock-456',
      };

      unlockICMDataStub.resolves({
        success: false,
        error: 'Insufficient permissions',
        status: 403,
      });

      const response = await request(Server)
        .post('/api/clearICMLockedFlag')
        .send(testData)
        .expect('Content-Type', /json/)
        .expect(403);

      expect(response.body).to.deep.equal({
        error: 'Insufficient permissions',
      });
    });

    it('should handle ICM service error with default status 500', async () => {
      const testData = {
        username: 'testuser',
        formId: 'form-123',
        lockId: 'lock-456',
      };

      unlockICMDataStub.resolves({
        success: false,
        error: 'Internal unlock error',
      });

      const response = await request(Server)
        .post('/api/clearICMLockedFlag')
        .send(testData)
        .expect('Content-Type', /json/)
        .expect(500);

      expect(response.body).to.deep.equal({ error: 'Internal unlock error' });
    });
  });

  describe('loadSavedJson endpoint', () => {
    it('should successfully load saved JSON data', async () => {
      const testData = {
        formId: 'form-123',
        version: '1.0',
      };

      loadSavedJsonStub.resolves({
        success: true,
        data: {
          success: true,
          data: {
            savedJson: { field1: 'value1', field2: 'value2' },
            version: '1.0',
            formId: 'form-123',
          },
        },
      });

      const response = await request(Server)
        .post('/api/loadSavedJson')
        .send(testData)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).to.deep.equal({
        success: true,
        data: {
          savedJson: { field1: 'value1', field2: 'value2' },
          version: '1.0',
          formId: 'form-123',
        },
      });

      expect(loadSavedJsonStub.calledOnce).to.be.true;
      const params = loadSavedJsonStub.getCall(0).args[0];
      expect(params).to.deep.equal({
        formId: 'form-123',
        version: '1.0',
      });
    });

    it('should handle ICM service error responses', async () => {
      const testData = {
        formId: 'form-123',
      };

      loadSavedJsonStub.resolves({
        success: false,
        error: 'Saved JSON not found',
        status: 404,
      });

      const response = await request(Server)
        .post('/api/loadSavedJson')
        .send(testData)
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).to.deep.equal({ error: 'Saved JSON not found' });
    });

    it('should handle ICM service error with default status 500', async () => {
      const testData = {
        formId: 'form-123',
      };

      loadSavedJsonStub.resolves({
        success: false,
        error: 'Internal server error loading saved JSON',
      });

      const response = await request(Server)
        .post('/api/loadSavedJson')
        .send(testData)
        .expect('Content-Type', /json/)
        .expect(500);

      expect(response.body).to.deep.equal({
        error: 'Internal server error loading saved JSON',
      });
    });

    it('should pass through all request body parameters', async () => {
      const testData = {
        formId: 'form-456',
        version: '2.1',
        includeMetadata: true,
        userId: 'user-789',
      };

      loadSavedJsonStub.resolves({
        success: true,
        data: { savedJson: { data: 'test' } },
      });

      await request(Server)
        .post('/api/loadSavedJson')
        .send(testData)
        .expect(200);

      const params = loadSavedJsonStub.getCall(0).args[0];
      expect(params).to.deep.equal({
        formId: 'form-456',
        version: '2.1',
        includeMetadata: true,
        userId: 'user-789',
      });
    });
  });
});
