import 'mocha';
import { expect } from 'chai';
import request from 'supertest';
import Server from '../server';

describe('Communications Controller', () => {
  const endpoints = [
    'saveData',
    'generate',
    'edit',
    'saveICMData',
    'loadICMData',
    'clearICMLockedFlag',
    'loadSavedJson',
    'pdfRender',
    'generatePDFFromJson',
    'generateNewTemplate'
  ];

  endpoints.forEach(endpoint => {
    it(`should respond to POST /${endpoint}`, () =>
      request(Server)
        .post(`/${endpoint}`)
        .send({ test: true })
        .expect('Content-Type', /json/)
        .expect(200)
        .then(res => {
          expect(res.body).to.have.property('endpoint', endpoint);
          expect(res.body.payload).to.have.property('test', true);
        }));
  });
});
