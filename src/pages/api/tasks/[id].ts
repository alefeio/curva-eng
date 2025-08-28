import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getSession } from 'next-auth/react';
import { Task } from '../../../types/task'; // Importa a interface Task do arquivo central

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query; 
  const session = await getSession({ req });

  // LOGS DE DEPURACAO DA SESSAO NO SERVIDOR
  console.log(`[API /api/tasks/${id}] Método: ${req.method}`);
  console.log(`[API /api/tasks/${id}] Sessão recebida:`, session ? 'Presente' : 'Ausente');
  if (session) {
    console.log(`[API /api/tasks/${id}] User ID na sessão:`, session.user?.id);
    console.log(`[API /api/tasks/${id}] User Role na sessão:`, (session.user as any)?.role);
  }
  // FIM DOS LOGS DE DEPURACAO

  // Exemplo de autenticação/autorização: apenas ADMINs podem editar/deletar
  if (!session || session.user?.role !== 'ADMIN') { 
    if (req.method === 'GET') {
        // Permitir GET para qualquer usuário autenticado (ou até não autenticado se a tarefa for pública)
        // Por enquanto, manteremos a necessidade de sessão para todas as tarefas do admin
        // No entanto, para GET, o erro 401 só será retornado se a sessão for nula, mas não se a role for diferente de ADMIN.
        // Se desejar restringir GET para ADMIN também, mude esta lógica.
        if (!session) { // Apenas um exemplo de restrição para GET
             return res.status(401).json({ message: 'Não autorizado para visualização sem autenticação.' });
        }
    } else {
      // Esta é a linha que está disparando o erro para PUT (e DELETE)
      console.warn(`[API /api/tasks/${id}] Acesso negado. Sessão: ${session ? 'presente' : 'ausente'}, Role: ${(session?.user as any)?.role}`);
      return res.status(401).json({ message: 'Não autorizado. Apenas administradores podem realizar esta operação.' });
    }
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
            author: { // Incluindo o autor também para consistência se necessário
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
            author: { // Incluindo autor no retorno da atualização
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
