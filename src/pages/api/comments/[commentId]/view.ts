// src/pages/api/comments/[commentId]/view.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";
import prisma from '../../../../../lib/prisma'; // ATENÇÃO: Ajuste este caminho

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { commentId } = req.query; // Pega o commentId da URL

  // Certifica-se de que commentId é uma string
  if (typeof commentId !== 'string') {
    return res.status(400).json({ message: 'ID do comentário inválido.' });
  }

  // --- LOGS DE DEPURACAO ---
  console.log(`\n--- [API /api/comments/${commentId}/view] INICIO DA REQUISICAO ---`);
  console.log(`[API /api/comments/${commentId}/view] Método: ${req.method}`);
  console.log(`[API /api/comments/${commentId}/view] Requisição Host: ${req.headers.host}`);
  console.log(`[API /api/comments/${commentId}/view] Requisição Origin: ${req.headers.origin}`);
  console.log(`[API /api/comments/${commentId}/view] Variável de Ambiente NEXTAUTH_URL no runtime da API: ${process.env.NEXTAUTH_URL}`);
  console.log(`--- [API /api/comments/${commentId}/view] FIM DOS LOGS GERAIS ---\n`);

  // Esta rota requer autenticação para registrar a visualização, mas não necessariamente ADMIN
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user?.id) {
    console.warn(`[API /api/comments/${commentId}/view] Acesso NEGADO. Motivo: Sessão ausente ou ID do usuário ausente.`);
    return res.status(401).json({ message: 'Acesso não autorizado. É necessário estar logado para registrar visualizações.' });
  }

  const viewerId = session.user.id;

  if (req.method === 'POST') {
    try {
      // Busca o comentário atual para verificar se o usuário já o visualizou
      const existingComment = await prisma.comment.findUnique({
        where: { id: commentId },
        select: { viewedBy: true },
      });

      if (!existingComment) {
        return res.status(404).json({ message: 'Comentário não encontrado.' });
      }

      // Se o usuário já visualizou, não faz nada
      if (existingComment.viewedBy.includes(viewerId)) {
        console.log(`[API /api/comments/${commentId}/view] Usuário ${viewerId} já visualizou este comentário.`);
        return res.status(200).json({ message: 'Visualização já registrada.' });
      }

      // Adiciona o ID do usuário ao array viewedBy
      const updatedComment = await prisma.comment.update({
        where: { id: commentId },
        data: {
          viewedBy: {
            push: viewerId,
          },
        },
      });
      console.log(`[API /api/comments/${commentId}/view] POST executado. Visualização de ${viewerId} adicionada ao comentário ${commentId}.`);
      return res.status(200).json({ success: true, message: 'Visualização registrada com sucesso.', comment: updatedComment });
    } catch (e: any) {
      console.error(`[API /api/comments/${commentId}/view] Erro ao registrar visualização para o comentário ${commentId}:`, e);
      return res.status(500).json({ message: 'Erro interno do servidor ao registrar visualização.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
