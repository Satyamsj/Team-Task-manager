import { Router } from 'express';
import prisma from '../prisma';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

// Create a task
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { title, description, status, dueDate, projectId, assigneeId } = req.body;
    const creatorId = req.user!.id;

    // Verify user has access to this project
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { members: true }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (req.user!.role !== 'ADMIN' && !project.members.some(m => m.userId === creatorId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: status || 'TODO',
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId,
        assigneeId,
        creatorId
      },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true, email: true } }
      }
    });

    res.status(201).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get tasks for a project
router.get('/project/:projectId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const userId = req.user!.id;
    const role = req.user!.role;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { members: true }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (role !== 'ADMIN' && !project.members.some(m => m.userId === userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const tasks = await prisma.task.findMany({
      where: { projectId },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update a task
router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const { title, description, status, dueDate, assigneeId } = req.body;
    const userId = req.user!.id;
    const role = req.user!.role;

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: { include: { members: true } } }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (role !== 'ADMIN' && !task.project.members.some(m => m.userId === userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        title,
        description,
        status,
        dueDate: dueDate ? new Date(dueDate) : null,
        assigneeId
      },
      include: {
        assignee: { select: { id: true, name: true, email: true } }
      }
    });

    res.json(updatedTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a task (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const taskId = parseInt(req.params.id);
    await prisma.task.delete({ where: { id: taskId } });
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
