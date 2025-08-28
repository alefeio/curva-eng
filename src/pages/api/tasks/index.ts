import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getSession } from 'next-auth/react';
import { Task } from '../../../types/task'; // Importa a interface Task do arquivo central

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });

  // LOGS DE DEPURACAO DA SESSAO NO SERVIDOR
  console.log(`[API /api/tasks/index] Método: ${req.method}`);
  console.log(`[API /api/tasks/index] Sessão recebida:`, session ? 'Presente' : 'Ausente');
  if (session) {
    console.log(`[API /api/tasks/index] User ID na sessão:`, session.user?.id);
    console.log(`[API /api/tasks/index] User Role na sessão:`, (session.user as any)?.role);
  } else {
    console.log(`[API /api/tasks/index] Sessão vazia para a requisição.`);
  }
  // FIM DOS LOGS DE DEPURACAO


  // Autorização genérica: exige ADMIN para POST, e sessão para GET
  if (req.method === 'POST') {
    if (!session || (session.user as any)?.role !== 'ADMIN') { 
      console.warn(`[API /api/tasks/index] Acesso negado para POST. Sessão: ${session ? 'presente' : 'ausente'}, Role: ${(session?.user as any)?.role}`);
      return res.status(401).json({ message: 'Não autorizado. Apenas administradores podem realizar esta operação.' });
    }
  } else if (req.method === 'GET') {
      if (!session) { // Para GET, se não houver sessão, não autoriza (tarefas do admin não são públicas)
          console.warn(`[API /api/tasks/index] Acesso negado para GET. Sessão ausente.`);
          return res.status(401).json({ message: 'Não autorizado para visualização sem autenticação.' });
      }
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
      console.error(`[API /api/tasks/index] Erro ao buscar tarefas:`, e);
      res.status(500).json({ message: 'Erro interno do servidor ao buscar as tarefas.' });
    }
  } else if (req.method === 'POST') { 
    try {
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
      console.error(`[API /api/tasks/index] Erro ao criar tarefa:`, e);
      res.status(500).json({ message: 'Erro interno do servidor ao criar a tarefa.' });
    }
  }
  else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  await prisma.$disconnect();
}
