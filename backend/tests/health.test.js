const request = require('supertest');
const app = require('../src/app')


describe('GET /api/health',() => {
    it('renvoie stutus ok ', async () => {
        const response = await request(app).get('/api/health');
        
        expect(response.status).toBe(200);
        expect(response.body).toEqual({status :'ok'});
    });
});