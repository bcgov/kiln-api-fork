import 'mocha';
import { expect } from 'chai';
import request from 'supertest';
import Server from '../server';

describe('Kiln Controller', () => {
  it('should respond to GET /view', () =>
    request(Server)
      .get('/view')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(res => {
        expect(res.body).to.have.property('endpoint', 'view');
        expect(res.body.message).to.include('view-only');
      }));

  it('should respond to GET /edit', () =>
    request(Server)
      .get('/edit')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(res => {
        expect(res.body).to.have.property('endpoint', 'edit');
        expect(res.body.message).to.include('editable');
      }));
});
