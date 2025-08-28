import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getSession } from 'next-auth/react';
import { Task } from '../../../types/task'; // Importa a interface Task do arquivo central

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query; 
  const session = await getSession({ req });

  // LOGS DE DEPURACAO DA SESSAO NO SERVIDOR (MAIS DETALHADOS)
  console.log(`\n--- [API /api/tasks/${id}] INICIO DA REQUISICAO ---`);
  console.log(`[API /api/tasks/${id}] Método: ${req.method}`);
  console.log(`[API /api/tasks/${id}] Requisição Host: ${req.headers.host}`);
  console.log(`[API /api/tasks/${id}] Requisição Origin: ${req.headers.origin}`);
  console.log(`[API /api/tasks/${id}] Variável de Ambiente NEXTAUTH_URL no runtime da API: ${process.env.NEXTAUTH_URL}`);
  console.log(`[API /api/tasks/${id}] Cookies da Requisição: ${req.headers.cookie || 'Nenhum cookie presente'}`);
  console.log(`[API /api/tasks/${id}] Sessão Recebida (JSON):`, JSON.stringify(session, null, 2));
  if (session) {
    console.log(`[API /api/tasks/${id}] User ID na sessão:`, session.user?.id);
    console.log(`[API /api/tasks/${id}] User Role na sessão:`, (session.user as any)?.role);
    console.log(`[API /api/tasks/${id}] Tipo da User Role:`, typeof (session.user as any)?.role);
  } else {
    console.log(`[API /api/tasks/${id}] Sessão ausente para a requisição.`);
  }
  console.log(`--- [API /api/tasks/${id}] FIM DOS LOGS DE SESSAO ---\n`);
  // FIM DOS LOGS DE DEPURACAO


  // Autorização genérica: exige ADMIN para PUT/DELETE. GET exige sessão para tarefas do admin.
  if (req.method !== 'GET') { // Para PUT e DELETE
    if (!session || (session.user as any)?.role !== 'ADMIN') { 
      console.warn(`[API /api/tasks/${id}] Acesso NEGADO para ${req.method}. Motivo: ${!session ? 'Sessão Ausente' : `Role: ${(session?.user as any)?.role} (não é ADMIN)`}`);
      return res.status(401).json({ message: 'Não autorizado. Apenas administradores podem realizar esta operação.' });
    }
  } else { // Para GET
      // Para GET, se não houver sessão, não autoriza (já que as tarefas não são públicas neste contexto de admin)
      if (!session) { 
           console.warn(`[API /api/tasks/${id}] Acesso NEGADO para GET. Motivo: Sessão Ausente.`);
           return res.status(401).json({ message: 'Não autorizado para visualização sem autenticação.' });
      }
      // Se quiser que APENAS ADMIN veja QUALQUER tarefa, adicione:
      // if ((session.user as any)?.role !== 'ADMIN') {
      //   console.warn(`[API /api/tasks/${id}] Acesso NEGADO para GET. Role: ${(session?.user as any)?.role}`);
      //   return res.status(403).json({ message: 'Proibido. Apenas administradores podem visualizar todas as tarefas.' });
      // }
  }


  if (typeof id !== 'string') {
    return res.status(400).json({ message: 'ID da tarefa inválido.' });
  }

  switch (req.method) {
    case 'GET':
      try {
        const task = await prisma.task.findUnique({
          where: { id },
          include: {
            assignedTo: { 
              select: { id: true, name: true },
            },
            author: { 
              select: { id: true, name: true },
            }
          },
        });

        if (!task) {
          return res.status(404).json({ message: 'Tarefa não encontrada.' });
        }
        res.status(200).json(task);
      } catch (e: any) {
        console.error(`[API /api/tasks/${id}] Erro ao buscar tarefa:`, e);
        res.status(500).json({ message: 'Erro interno do servidor ao buscar a tarefa.' });
      }
      break;

    case 'PUT':
      try {
        const { title, description, status, priority, dueDate, assignedToId } = req.body;

        if (!title || !status || priority === undefined || !dueDate || !assignedToId) {
          return res.status(400).json({ message: 'Campos obrigatórios faltando.' });
        }

        const updatedTask = await prisma.task.update({
          where: { id },
          data: {
            title,
            description,
            status,
            priority,
            dueDate: new Date(dueDate), 
            assignedToId,
            updatedAt: new Date(), 
          },
          include: {
            assignedTo: {
              select: { id: true, name: true },
            },
            author: { 
                select: { id: true, name: true },
            }
          },
        });
        res.status(200).json(updatedTask);
      } catch (e: any) {
        console.error(`[API /api/tasks/${id}] Erro ao atualizar tarefa:`, e);
        res.status(500).json({ message: 'Erro interno do servidor ao atualizar a tarefa.' });
      }
      break;

    case 'DELETE':
      try {
        await prisma.task.delete({
          where: { id },
        });
        res.status(204).end(); 
      } catch (e: any) {
        console.error(`[API /api/tasks/${id}] Erro ao deletar tarefa:`, e);
        res.status(500).json({ message: 'Erro interno do servidor ao deletar a tarefa.' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  await prisma.$disconnect();
}
