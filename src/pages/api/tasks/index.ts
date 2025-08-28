import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getSession } from 'next-auth/react';
import { Task } from '../../../types/task'; // Importa a interface Task do arquivo central

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });

  // Apenas usuários autenticados (e talvez ADMINs) podem ver a lista de tarefas
  if (!session) { // || session.user?.role !== 'ADMIN' se quiser restringir mais
    return res.status(401).json({ message: 'Não autorizado.' });
  }

  if (req.method === 'GET') {
    try {
      const tasks = await prisma.task.findMany({
        include: {
          author: {
            select: { id: true, name: true },
          },
          assignedTo: {
            select: { id: true, name: true },
          },
        },
        orderBy: {
          createdAt: 'desc', // Ou sua ordem preferida
        },
      });
      res.status(200).json(tasks);
    } catch (e: any) {
      console.error('Erro ao buscar tarefas:', e);
      res.status(500).json({ message: 'Erro interno do servidor ao buscar as tarefas.' });
    }
  } else if (req.method === 'POST') { // Lógica para criar nova tarefa
    try {
      if (session.user?.role !== 'ADMIN') { // Apenas ADMIN pode criar
        return res.status(403).json({ message: 'Proibido. Apenas administradores podem criar tarefas.' });
      }
      const { title, description, status, priority, dueDate, assignedToId, authorId } = req.body;

      if (!title || !status || priority === undefined || !dueDate || !assignedToId || !authorId) {
        return res.status(400).json({ message: 'Campos obrigatórios faltando.' });
      }

      const newTask = await prisma.task.create({
        data: {
          title,
          description,
          status,
          priority,
          dueDate: new Date(dueDate),
          assignedToId,
          authorId,
        },
        include: {
            author: {
                select: { id: true, name: true }
            },
            assignedTo: {
                select: { id: true, name: true }
            }
        }
      });
      res.status(201).json(newTask);
    } catch (e: any) {
      console.error('Erro ao criar tarefa:', e);
      res.status(500).json({ message: 'Erro interno do servidor ao criar a tarefa.' });
    }
  }
  else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  await prisma.$disconnect();
}
