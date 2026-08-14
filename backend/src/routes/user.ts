import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { dbService } from '../db';
import { authenticate } from '../auth';

const router = Router();

// GET /user/profile
router.get('/profile', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const user = await dbService.findUserById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({ id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// GET /user/contacts
router.get('/contacts', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const contacts = await dbService.getTrustedContacts(userId);
    return res.json(contacts);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

// POST /user/contacts
router.post('/contacts', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { name, relationship, contact, enabled } = req.body;
    if (!name || !contact) return res.status(400).json({ error: 'Name and contact required' });
    const newContact = {
      id: `tc-${uuidv4()}`,
      userId,
      name,
      relationship: relationship || 'Contact',
      contact,
      enabled: enabled !== false,
    };
    const created = await dbService.addTrustedContact(newContact);
    return res.status(201).json(created);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create contact' });
  }
});

// PUT /user/contacts/:id
router.put('/contacts/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const updated = await dbService.updateTrustedContact(req.params.id, userId, req.body);
    if (!updated) return res.status(404).json({ error: 'Contact not found' });
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update contact' });
  }
});

// DELETE /user/contacts/:id
router.delete('/contacts/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const success = await dbService.deleteTrustedContact(req.params.id, userId);
    if (!success) return res.status(404).json({ error: 'Contact not found' });
    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete contact' });
  }
});

export default router;
