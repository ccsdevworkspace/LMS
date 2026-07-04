import express from 'express';
import request from 'supertest';
import getHello from '../src/controllers/getter.controller.js';

const app = express();
app.get('/', getHello);

describe('GET /', () => {
    it('should return "Hello World"', async () => {
        const res = await request(app).get('/');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ message: 'Hello World' });
    });
});
