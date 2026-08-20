import { Request, Response } from 'express';

// A handler that responds with 'Hello World!' when called.
const test = async (req: Request, res: Response) => {
    try {
        const { num } = req.body;

        if (!num) {
            console.log('Resouce was not found');
            res.status(404).json({ msg: 'Not found' });
            return;
        }

        res.json({ num });
    } catch (error) {
        res.status(500).json({ msg: 'Internal Server Error' });
        console.error(error);
    }
};

export default test;
