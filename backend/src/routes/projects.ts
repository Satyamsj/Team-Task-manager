import { Router } from 'express';
import prisma from '../prisma';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

// Get projects for current user
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;

    let projects;
    if (role === 'ADMIN') {
      projects = await prisma.project.findMany({
        include: {
          creator: { select: { id: true, name: true, email: true } },
          _count: { select: { members: true, tasks: true } }
        }
      });
    } else {
      projects = await prisma.project.findMany({
        where: {
          members: {
            some: { userId }
          }
        },
        include: {
          creator: { select: { id: true, name: true, email: true } },
          _count: { select: { members: true, tasks: true } }
        }
      });
    }

    res.json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create project (Admin only)
router.post('/', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { name, description } = req.body;
    const creatorId = req.user!.id;

    const project = await prisma.project.create({
      data: {
        name,
        description,
        creatorId,
        members: {
          create: { userId: creatorId }
        }
      }
    });

    res.status(201).json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get project details
router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const userId = req.user!.id;
    const role = req.user!.role;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, role: true } }
          }
        },
        creator: { select: { id: true, name: true, email: true } }
      }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check access
    if (role !== 'ADMIN' && !project.members.some(m => m.userId === userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add member to project (Admin only)
router.post('/:id/members', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const existingMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: { projectId, userId: user.id }
      }
    });

    if (existingMember) {
      return res.status(400).json({ error: 'User is already a member' });
    }

    const member = await prisma.projectMember.create({
      data: {
        projectId,
        userId: user.id
      }
    });

    res.status(201).json({ message: 'Member added successfully', member });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
