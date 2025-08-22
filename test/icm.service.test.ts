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
        savedForm: { field1: 'value1', field2: 'value2' }
      };

      const mockResponse = {
        ok: true,
        json: sinon.stub().resolves({ id: 'saved-123', status: 'success' })
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
        token: 'test-token'
      });
    });
  });
});