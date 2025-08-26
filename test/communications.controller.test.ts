import 'mocha';
import { expect } from 'chai';
import request from 'supertest';
import sinon from 'sinon';
import Server from '../server';
import ICMService from '../server/api/services/icm.service';

describe('Communications Controller', () => {
  let loadICMDataStub: sinon.SinonStub;

  beforeEach(() => {
    loadICMDataStub = sinon.stub(ICMService, 'loadICMData');
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

  it('should respond to POST /api/generateForm', () =>
    request(Server)
      .post('/api/generateForm')
      .send({ test: true })
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        expect(res.body).to.have.property('endpoint', 'generateForm');
        expect(res.body.payload).to.have.property('test', true);
      }));

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
});
