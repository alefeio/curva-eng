// src/pages/api/tasks/[id]/comments.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";
import prisma from '../../../../../lib/prisma'; // ATENÇÃO: Ajuste este caminho

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let { id } = req.query; // AGORA PEGA O 'id' DA URL

  // Garante que 'id' é uma string. Se for um array, pega o primeiro elemento.
  if (Array.isArray(id)) {
    id = id[0];
  }

  // Certifica-se de que 'id' é uma string válida
  if (typeof id !== 'string' || !id) {
    return res.status(400).json({ message: 'ID da tarefa inválido ou ausente.' });
  }

  // --- LOGS DE DEPURACAO ---
  console.log(`\n--- [API /api/tasks/${id}/comments] INICIO DA REQUISICAO ---`);
  console.log(`[API /api/tasks/${id}/comments] Método: ${req.method}`);
  console.log(`[API /api/tasks/${id}/comments] Requisição Host: ${req.headers.host}`);
  console.log(`[API /api/tasks/${id}/comments] Requisição Origin: ${req.headers.origin}`);
  console.log(`[API /api/tasks/${id}/comments] Variável de Ambiente NEXTAUTH_URL no runtime da API: ${process.env.NEXTAUTH_URL}`);
  console.log(`--- [API /api/tasks/${id}/comments] FIM DOS LOGS GERAIS ---\n`);

  switch (req.method) {
    case 'GET':
      const sessionGet = await getServerSession(req, res, authOptions);
      if (!sessionGet || (sessionGet.user as any)?.role !== 'ADMIN') {
        console.warn(`[API /api/tasks/${id}/comments] Acesso NEGADO para GET. Motivo: ${!sessionGet ? 'Sessão Ausente' : `Role: ${(sessionGet?.user as any)?.role} (não é ADMIN)`}`);
        return res.status(401).json({ message: 'Acesso não autorizado. Apenas administradores podem visualizar comentários.' });
      }

      try {
        const comments = await prisma.comment.findMany({
          where: { taskId: id }, // Usa 'id' aqui
          include: {
            author: {
              select: { id: true, name: true },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        });
        console.log(`[API /api/tasks/${id}/comments] GET executado. ${comments.length} comentários encontrados.`);
        return res.status(200).json(comments);
      } catch (e: any) {
        console.error(`[API /api/tasks/${id}/comments] Erro ao buscar comentários para a tarefa ${id}:`, e);
        return res.status(500).json({ message: 'Erro interno do servidor ao buscar comentários.' });
      }

    case 'POST':
      const sessionPost = await getServerSession(req, res, authOptions);
      if (!sessionPost || (sessionPost.user as any)?.role !== 'ADMIN') {
        console.warn(`[API /api/tasks/${id}/comments] Acesso NEGADO para POST. Motivo: ${!sessionPost ? 'Sessão Ausente' : `Role: ${(sessionPost?.user as any)?.role} (não é ADMIN)`}`);
        return res.status(401).json({ message: 'Acesso não autorizado. Apenas administradores podem adicionar comentários.' });
      }

      const { message } = req.body;
      const authorId = sessionPost.user?.id;

      if (!message || !authorId) {
        return res.status(400).json({ message: 'Mensagem e ID do autor são obrigatórios.' });
      }

      try {
        const newComment = await prisma.comment.create({
          data: {
            message,
            authorId,
            taskId: id, // Usa 'id' aqui
            viewedBy: [],
          },
          include: {
            author: {
              select: { id: true, name: true },
            },
          },
        });
        console.log(`[API /api/tasks/${id}/comments] POST executado. Novo comentário ${newComment.id} criado.`);
        return res.status(201).json(newComment);
      } catch (e: any) {
        console.error(`[API /api/tasks/${id}/comments] Erro ao criar comentário para a tarefa ${id}:`, e);
        return res.status(500).json({ message: 'Erro interno do servidor ao criar comentário.' });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
