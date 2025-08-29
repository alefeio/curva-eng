// src/pages/api/tasks/[id]/mark-viewed.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";
import prisma from '../../../../../lib/prisma'; // ATENÇÃO: Ajuste este caminho

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let { id } = req.query; // PEGA O 'id' DA URL

  if (Array.isArray(id)) {
    id = id[0];
  }

  if (typeof id !== 'string' || !id) {
    return res.status(400).json({ message: 'ID da tarefa inválido ou ausente.' });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return res.status(401).json({ message: 'Acesso não autorizado.' });
  }

  const userId = session.user?.id;
  if (!userId) {
    return res.status(400).json({ message: 'ID do usuário ausente.' });
  }

  if (req.method === 'POST') {
    try {
      // Busca a tarefa e seus comentários para garantir que o comentário existe
      // Esta linha agora deve funcionar se o schema.prisma estiver correto
      const task = await prisma.task.findUnique({
        where: { id: id },
        include: { comments: true },
      });

      if (!task) {
        return res.status(404).json({ message: 'Tarefa não encontrada.' });
      }

      let updatedCount = 0;
      // Itera sobre cada comentário e atualiza APENAS se o userId não estiver lá
      for (const comment of task.comments) {
        if (!comment.viewedBy.includes(userId)) {
          await prisma.comment.update({
            where: { id: comment.id },
            data: {
              viewedBy: {
                push: userId
              }
            }
          });
          updatedCount++;
        }
      }

      console.log(`[API /api/tasks/${id}/mark-viewed] ${updatedCount} comentários atualizados.`);
      return res.status(200).json({ message: 'Visualização registrada com sucesso.' });
    } catch (error) {
      console.error(`Erro ao registrar visualização para a tarefa ${id} pelo usuário ${userId}:`, error);
      return res.status(500).json({ message: 'Erro interno do servidor ao registrar visualização.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
