import { Router } from 'express';
import prisma from '../prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;

    let tasks;

    if (role === 'ADMIN') {
      tasks = await prisma.task.findMany({
        where: { assigneeId: userId }
      });
    } else {
      tasks = await prisma.task.findMany({
        where: { assigneeId: userId }
      });
    }

    const totalTasks = tasks.length;
    const todoTasks = tasks.filter(t => t.status === 'TODO').length;
    const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS').length;
    const doneTasks = tasks.filter(t => t.status === 'DONE').length;
    const overdueTasks = tasks.filter(t => {
      if (!t.dueDate) return false;
      return t.status !== 'DONE' && new Date(t.dueDate) < new Date();
    }).length;

    res.json({
      totalTasks,
      todoTasks,
      inProgressTasks,
      doneTasks,
      overdueTasks,
      recentTasks: tasks.slice(0, 5) // just an example
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
