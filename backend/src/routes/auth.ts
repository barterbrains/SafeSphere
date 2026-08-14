import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { dbService } from '../db';
import { generateToken } from '../auth';

const router = Router();

// POST /auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Check institution first
    const institution = await dbService.findInstitutionByEmail(email);
    if (institution) {
      const valid = await bcrypt.compare(password, institution.passwordHash);
      if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
      const token = generateToken(institution.id, 'institution');
      return res.json({
        token,
        user: { id: institution.id, name: institution.name, email: institution.email, role: 'institution' },
      });
    }

    const user = await dbService.findUserByEmail(email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = generateToken(user.id, user.role);
    return res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ error: err.message || 'Login failed' });
  }
});

// POST /auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password required' });
    }
    const existing = await dbService.findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = {
      id: `user-${uuidv4()}`,
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: 'user' as const,
      createdAt: new Date().toISOString(),
    };
    await dbService.createUser(newUser);

    // Add default trusted contact for new users — non-fatal if it fails
    try {
      await dbService.addTrustedContact({
        id: `tc-${uuidv4()}`,
        userId: newUser.id,
        name: 'Mom',
        relationship: 'Mother',
        contact: '+91 98765 43210',
        enabled: true,
      });
    } catch (tcErr: any) {
      // Non-critical: user is already created. Log and continue.
      console.warn('Could not add default trusted contact (non-fatal):', tcErr?.message);
    }

    const token = generateToken(newUser.id, newUser.role);
    return res.status(201).json({
      token,
      user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: err.message || 'Registration failed' });
  }
});

// POST /auth/demo - instant demo login
router.post('/demo', async (req: Request, res: Response) => {
  try {
    let user = await dbService.findUserByEmail('demo@safesphere.ai');
    if (!user) {
      // Fallback demo user if database was modified
      const demoPasswordHash = await bcrypt.hash('demo1234', 10);
      user = await dbService.createUser({
        id: 'user-demo',
        name: 'Priya Sharma',
        email: 'demo@safesphere.ai',
        passwordHash: demoPasswordHash,
        role: 'user',
        createdAt: new Date().toISOString(),
      });
    }
    const token = generateToken(user.id, user.role);
    return res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    return res.status(500).json({ error: 'Demo login failed' });
  }
});

export default router;
