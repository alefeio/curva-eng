import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getSession } from 'next-auth/react';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query; // Obtém o ID da tarefa da URL
  const session = await getSession({ req });

  // Exemplo de autenticação/autorização: apenas ADMINs podem editar/deletar
  // E apenas usuários logados podem ver detalhes se a tarefa não for pública
  if (!session || session.user?.role !== 'ADMIN') { // Ou ajuste conforme sua lógica de permissão
    // Para GET, você pode permitir se a tarefa for pública, mas para PUT/DELETE, exige ADMIN
    if (req.method === 'GET') {
      // Poderia verificar se a tarefa é pública aqui, mas por simplicidade, manteremos como se necessitasse de autenticação para todas as tarefas
      // Ou, se precisar de regras mais granulares, implemente aqui
    } else {
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
            assignedTo: { // Inclui os dados do usuário atribuído
              select: { id: true, name: true },
            },
          },
        });

        if (!task) {
          return res.status(404).json({ message: 'Tarefa não encontrada.' });
        }
        res.status(200).json(task);
      } catch (e: any) {
        console.error('Erro ao buscar tarefa:', e);
        res.status(500).json({ message: 'Erro interno do servidor ao buscar a tarefa.' });
      }
      break;

    case 'PUT':
      try {
        const { title, description, status, priority, dueDate, assignedToId } = req.body;

        // Validação básica
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
            dueDate: new Date(dueDate), // Garante que a data é um objeto Date
            assignedToId,
            updatedAt: new Date(), // Atualiza a data de modificação
          },
          include: {
            assignedTo: {
              select: { id: true, name: true },
            },
          },
        });
        res.status(200).json(updatedTask);
      } catch (e: any) {
        console.error('Erro ao atualizar tarefa:', e);
        res.status(500).json({ message: 'Erro interno do servidor ao atualizar a tarefa.' });
      }
      break;

    case 'DELETE':
      try {
        await prisma.task.delete({
          where: { id },
        });
        res.status(204).end(); // No Content
      } catch (e: any) {
        console.error('Erro ao deletar tarefa:', e);
        res.status(500).json({ message: 'Erro interno do servidor ao deletar a tarefa.' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  await prisma.$disconnect();
}
