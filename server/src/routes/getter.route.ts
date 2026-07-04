import express from 'express';
import getHello from '../controllers/getter.controller.js';

const router = express.Router();

// Defines a router with a GET endpoint.
router.get('', getHello);

export default router;
