// pages/api/tasks/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from "../../../../lib/prisma";
import { TaskStatus } from '@prisma/client'; // Importe o enum TaskStatus do Prisma

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  // Lógica para criar uma nova tarefa (POST)
  if (req.method === 'POST') {
    const { title, description, priority, dueDate, authorId, assignedToId } = req.body;

    if (!title || !authorId || !assignedToId) {
      return res.status(400).json({ message: "Dados obrigatórios faltando." });
    }

    try {
      const newTask = await prisma.task.create({
        data: {
          title,
          description,
          priority: priority ? parseInt(priority as string) : 0,
          dueDate: dueDate ? new Date(dueDate) : null,
          author: { connect: { id: authorId } },
          assignedTo: { connect: { id: assignedToId } },
        },
      });

      return res.status(201).json(newTask);
    } catch (error) {
      console.error("Falha ao criar tarefa:", error);
      return res.status(500).json({ message: "Erro ao criar a tarefa." });
    }
  }

  // Lógica para ler todas as tarefas (GET)
  if (req.method === 'GET') {
    const { status, assignedToId } = req.query;

    const filters: any = {
      deletedAt: null, // Ignora tarefas logicamente deletadas
    };

    if (status) {
      // Converte a string de status da query para o tipo TaskStatus do Prisma
      if (Object.values(TaskStatus).includes(status.toString() as TaskStatus)) {
        filters.status = status.toString();
      }
    }

    if (assignedToId) {
      filters.assignedToId = assignedToId.toString();
    }

    try {
      const tasks = await prisma.task.findMany({
        where: filters,
        include: {
          author: {
            select: {
              id: true,
              name: true,
            },
          },
          assignedTo: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return res.status(200).json(tasks);
    } catch (error) {
      console.error("Falha ao buscar tarefas:", error);
      return res.status(500).json({ message: "Erro ao buscar as tarefas." });
    }
  }

  // Se o método não for POST ou GET, retorne 405 Method Not Allowed
  res.setHeader('Allow', ['POST', 'GET']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}