import { Request, Response } from 'express';

// A handler that responds with 'Hello World!' when called.
const getHello = async (req: Request, res: Response) => {
    res.json({ message: 'Hello World' });
};

export default getHello;
