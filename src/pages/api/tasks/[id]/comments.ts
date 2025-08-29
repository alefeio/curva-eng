// src/pages/api/tasks/[taskId]/comments.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";
import prisma from '../../../../../lib/prisma'; // ATENÇÃO: Ajuste este caminho

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { taskId } = req.query; // Pega o taskId da URL

  // Certifica-se de que taskId é uma string
  if (typeof taskId !== 'string') {
    return res.status(400).json({ message: 'ID da tarefa inválido.' });
  }

  // --- LOGS DE DEPURACAO ---
  console.log(`\n--- [API /api/tasks/${taskId}/comments] INICIO DA REQUISICAO ---`);
  console.log(`[API /api/tasks/${taskId}/comments] Método: ${req.method}`);
  console.log(`[API /api/tasks/${taskId}/comments] Requisição Host: ${req.headers.host}`);
  console.log(`[API /api/tasks/${taskId}/comments] Requisição Origin: ${req.headers.origin}`);
  console.log(`[API /api/tasks/${taskId}/comments] Variável de Ambiente NEXTAUTH_URL no runtime da API: ${process.env.NEXTAUTH_URL}`);
  console.log(`--- [API /api/tasks/${taskId}/comments] FIM DOS LOGS GERAIS ---\n`);

  switch (req.method) {
    case 'GET':
      // O GET para comentários pode ser acessado por qualquer ADMIN
      const sessionGet = await getServerSession(req, res, authOptions);
      if (!sessionGet || (sessionGet.user as any)?.role !== 'ADMIN') {
        console.warn(`[API /api/tasks/${taskId}/comments] Acesso NEGADO para GET. Motivo: ${!sessionGet ? 'Sessão Ausente' : `Role: ${(sessionGet?.user as any)?.role} (não é ADMIN)`}`);
        return res.status(401).json({ message: 'Acesso não autorizado. Apenas administradores podem visualizar comentários.' });
      }

      try {
        const comments = await prisma.comment.findMany({
          where: { taskId },
          include: {
            author: {
              select: { id: true, name: true }, // Inclui informações básicas do autor
            },
          },
          orderBy: {
            createdAt: 'asc', // Comentários mais antigos primeiro
          },
        });
        console.log(`[API /api/tasks/${taskId}/comments] GET executado. ${comments.length} comentários encontrados.`);
        return res.status(200).json(comments);
      } catch (e: any) {
        console.error(`[API /api/tasks/${taskId}/comments] Erro ao buscar comentários para a tarefa ${taskId}:`, e);
        return res.status(500).json({ message: 'Erro interno do servidor ao buscar comentários.' });
      }

    case 'POST':
      // O POST para criar comentários exige autenticação ADMIN
      const sessionPost = await getServerSession(req, res, authOptions);
      if (!sessionPost || (sessionPost.user as any)?.role !== 'ADMIN') {
        console.warn(`[API /api/tasks/${taskId}/comments] Acesso NEGADO para POST. Motivo: ${!sessionPost ? 'Sessão Ausente' : `Role: ${(sessionPost?.user as any)?.role} (não é ADMIN)`}`);
        return res.status(401).json({ message: 'Acesso não autorizado. Apenas administradores podem adicionar comentários.' });
      }

      const { message } = req.body;
      const authorId = sessionPost.user?.id; // O autor é o usuário logado

      if (!message || !authorId) {
        return res.status(400).json({ message: 'Mensagem e ID do autor são obrigatórios.' });
      }

      try {
        const newComment = await prisma.comment.create({
          data: {
            message,
            authorId,
            taskId,
            viewedBy: [], // Inicialmente, ninguém visualizou
          },
          include: {
            author: {
              select: { id: true, name: true },
            },
          },
        });
        console.log(`[API /api/tasks/${taskId}/comments] POST executado. Novo comentário ${newComment.id} criado.`);
        return res.status(201).json(newComment);
      } catch (e: any) {
        console.error(`[API /api/tasks/${taskId}/comments] Erro ao criar comentário para a tarefa ${taskId}:`, e);
        return res.status(500).json({ message: 'Erro interno do servidor ao criar comentário.' });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
