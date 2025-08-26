// pages/api/tasks/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  const taskId = req.query.id as string;

  if (!taskId) {
    return res.status(400).json({ message: "ID da tarefa não fornecido." });
  }

  // Lógica para ler uma tarefa específica (GET)
  if (req.method === 'GET') {
    try {
      const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: {
          author: { select: { id: true, name: true } },
          assignedTo: { select: { id: true, name: true } },
          files: true,
        },
      });

      if (!task) {
        return res.status(404).json({ message: "Tarefa não encontrada." });
      }

      return res.status(200).json(task);
    } catch (error) {
      console.error("Falha ao buscar tarefa:", error);
      return res.status(500).json({ message: "Erro ao buscar a tarefa." });
    }
  }

  // Lógica para atualizar uma tarefa (PUT)
  if (req.method === 'PUT') {
    const { title, description, status, priority, dueDate, assignedToId } = req.body;

    try {
      const updatedTask = await prisma.task.update({
        where: { id: taskId },
        data: {
          title,
          description,
          status,
          priority: priority ? parseInt(priority) : undefined,
          dueDate: dueDate ? new Date(dueDate) : undefined,
          assignedToId,
        },
      });

      return res.status(200).json(updatedTask);
    } catch (error) {
      console.error("Falha ao atualizar tarefa:", error);
      return res.status(500).json({ message: "Erro ao atualizar a tarefa." });
    }
  }

  // Lógica para deletar uma tarefa (DELETE - deleção lógica)
  if (req.method === 'DELETE') {
    try {
      const deletedTask = await prisma.task.update({
        where: { id: taskId },
        data: {
          deletedAt: new Date(),
        },
      });

      return res.status(204).end();
    } catch (error) {
      console.error("Falha ao deletar tarefa:", error);
      return res.status(500).json({ message: "Erro ao deletar a tarefa." });
    }
  }

  // Se o método não for suportado, retorna 405 Method Not Allowed
  res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}