import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getSession } from 'next-auth/react';
import { Task } from '../../../types/task'; 

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });

  // LOGS DE DEPURACAO DA SESSAO NO SERVIDOR (MAIS DETALHADOS)
  console.log(`\n--- [API /api/tasks/index] INICIO DA REQUISICAO ---`);
  console.log(`[API /api/tasks/index] Método: ${req.method}`);
  console.log(`[API /api/tasks/index] Sessão Recebida (JSON):`, JSON.stringify(session, null, 2));
  if (session) {
    console.log(`[API /api/tasks/index] User ID na sessão:`, session.user?.id);
    console.log(`[API /api/tasks/index] User Role na sessão:`, (session.user as any)?.role);
    // Adiciona uma verificação explícita do tipo da role
    console.log(`[API /api/tasks/index] Tipo da User Role:`, typeof (session.user as any)?.role);
  } else {
    console.log(`[API /api/tasks/index] Sessão ausente para a requisição.`);
  }
  console.log(`--- [API /api/tasks/index] FIM DOS LOGS DE SESSAO ---\n`);
  // FIM DOS LOGS DE DEPURACAO


  // Autorização genérica: exige ADMIN para POST. GET exige sessão para tarefas do admin.
  if (req.method === 'POST') {
    if (!session || (session.user as any)?.role !== 'ADMIN') { 
      console.warn(`[API /api/tasks/index] Acesso NEGADO para POST. Motivo: ${!session ? 'Sessão Ausente' : `Role: ${(session?.user as any)?.role} (não é ADMIN)`}`);
      return res.status(401).json({ message: 'Não autorizado. Apenas administradores podem realizar esta operação.' });
    }
  } else if (req.method === 'GET') {
      if (!session) { 
          console.warn(`[API /api/tasks/index] Acesso NEGADO para GET. Motivo: Sessão Ausente.`);
          return res.status(401).json({ message: 'Não autorizado para visualização sem autenticação.' });
      }
      // Se quiser que APENAS ADMIN veja todas as tarefas na lista, adicione:
      // if ((session.user as any)?.role !== 'ADMIN') {
      //   console.warn(`[API /api/tasks/index] Acesso NEGADO para GET. Role: ${(session?.user as any)?.role}`);
      //   return res.status(403).json({ message: 'Proibido. Apenas administradores podem visualizar todas as tarefas.' });
      // }
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
          createdAt: 'desc', 
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
