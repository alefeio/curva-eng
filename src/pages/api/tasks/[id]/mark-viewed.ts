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
      // Atualiza todos os comentários da tarefa que AINDA NÃO possuem este userId em 'viewedBy'.
      // Então, para esses comentários, adiciona o userId ao array 'viewedBy'.
      const updatedCommentsCount = await prisma.comment.updateMany({
        where: {
          taskId: id, // Procura comentários associados à tarefa
          NOT: { // O usuário NÃO visualizou este comentário ainda
            viewedBy: {
              has: userId // Verifica se o userId está presente no array
            }
          }
        },
        data: {
          viewedBy: {
            push: userId // Adiciona o userId ao array
          }
        }
      });

      console.log(`[API /api/tasks/${id}/mark-viewed] ${updatedCommentsCount.count} comentários atualizados.`);
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
