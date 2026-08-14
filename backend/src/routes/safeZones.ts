import { Router, Request, Response } from 'express';
import { dbService } from '../db';

const router = Router();

// GET /safe-zones
router.get('/', async (req: Request, res: Response) => {
  try {
    const zones = await dbService.getSafeZones();
    return res.json(zones);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch safe zones' });
  }
});

export default router;
