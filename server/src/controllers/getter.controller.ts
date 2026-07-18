import { Request, Response } from 'express';

// A handler that responds with 'Hello World!' when called.
const getHello = async (req: Request, res: Response) => {
    res.json({
        app: 'B_APP',
        version: '0.0.0',
        greeting: 'Welcome to B_APP!',
    });
};

export default getHello;
