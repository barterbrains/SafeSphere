import { Router, Request, Response } from 'express';
import { dbService } from '../db';

const router = Router();

// GET /safety-events
router.get('/', async (req: Request, res: Response) => {
  try {
    const activeOnly = req.query.active === 'true';
    const events = await dbService.getSafetyEvents(activeOnly);
    return res.json(events);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch safety events' });
  }
});

export default router;
