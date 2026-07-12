import express from 'express';
import test from '../controllers/test.controller.js';

const router = express.Router();

// Defines a router with a GET endpoint.
router.post('', test);

export default router;
