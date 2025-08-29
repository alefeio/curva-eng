import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { Task, TaskStatusEnum } from '../../../types/task';
import prisma from '../../../../lib/prisma'; // ATENÇÃO: Ajuste este caminho se seu lib/prisma.ts estiver em outro lugar

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const session = await getServerSession(req, res, authOptions);

  console.log(`\n--- [API /api/tasks/${id}] INICIO DA REQUISICAO ---`);
  console.log(`[API /api/tasks/${id}] Método: ${req.method}`);
  console.log(`[API /api/tasks/${id}] Requisição Host: ${req.headers.host}`);
  console.log(`[API /api/tasks/${id}] Requisição Origin: ${req.headers.origin}`);
  console.log(`[API /api/tasks/${id}] Variável de Ambiente NEXTAUTH_URL no runtime da API: ${process.env.NEXTAUTH_URL}`);
  console.log(`[API /api/tasks/${id}] Variável de Ambiente NEXTAUTH_SECRET no runtime da API (início/fim): ${process.env.NEXTAUTH_SECRET ? `${process.env.NEXTAUTH_SECRET.substring(0, 5)}...${process.env.NEXTAUTH_SECRET.slice(-5)}` : "NÃO DEFINIDO"}`);
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


  if (!session || (session.user as any)?.role !== 'ADMIN') {
    console.warn(`[API /api/tasks/${id}] Acesso NEGADO para ${req.method}. Motivo: ${!session ? 'Sessão Ausente' : `Role: ${(session?.user as any)?.role} (não é ADMIN)`}`);
    return res.status(401).json({ message: 'Acesso não autorizado. Apenas administradores podem realizar esta operação.' });
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

        if (!Object.values(TaskStatusEnum).includes(status)) {
            return res.status(400).json({ message: 'Status da tarefa inválido.' });
        }
        const validatedStatus = status as TaskStatusEnum;

        const updatedTask = await prisma.task.update({
          where: { id },
          data: {
            title,
            description,
            status: validatedStatus as any, // Adicionado 'as any' para compatibilidade com o tipo do Prisma
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
}
