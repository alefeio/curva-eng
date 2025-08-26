import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const projetos = await prisma.projetos.findMany({
          include: {
            items: true,
          },
        });
        res.status(200).json({ success: true, projetos });
      } catch (e: any) {
        res.status(500).json({ success: false, message: e.message });
      }
      break;

    case 'POST':
      try {
        const { title, subtitle, description, order, items } = req.body;
        const novoProjeto = await prisma.projetos.create({
          data: {
            title,
            subtitle,
            description,
            order,
            items: {
              createMany: {
                data: items.map((item: any) => ({
                  local: item.local,
                  tipo: item.tipo,
                  detalhes: item.detalhes,
                  img: item.img,
                })),
              },
            },
          },
        });
        res.status(201).json({ success: true, projeto: novoProjeto });
      } catch (e: any) {
        res.status(500).json({ success: false, message: e.message });
      }
      break;

    case 'PUT':
      try {
        const { id, title, subtitle, description, order, items } = req.body;
        
        // Exclui todas as fotos existentes para o projeto antes de criar as novas
        // Essa é uma estratégia simples para garantir que a atualização funcione corretamente
        // em relacionamentos 1:N no Prisma.
        await prisma.projetoFoto.deleteMany({
            where: { projetoId: id },
        });

        const projetoAtualizado = await prisma.projetos.update({
          where: { id },
          data: {
            title,
            subtitle,
            description,
            order,
            items: {
              createMany: {
                data: items.map((item: any) => ({
                  local: item.local,
                  tipo: item.tipo,
                  detalhes: item.detalhes,
                  img: item.img,
                })),
              },
            },
          },
        });
        res.status(200).json({ success: true, projeto: projetoAtualizado });
      } catch (e: any) {
        res.status(500).json({ success: false, message: e.message });
      }
      break;

    case 'DELETE':
      try {
        const { id, isItem } = req.body;
        if (isItem) {
          await prisma.projetoFoto.delete({ where: { id } });
          res.status(200).json({ success: true, message: "Foto excluída com sucesso." });
        } else {
          await prisma.projetos.delete({ where: { id } });
          res.status(200).json({ success: true, message: "Projeto excluído com sucesso." });
        }
      } catch (e: any) {
        res.status(500).json({ success: false, message: e.message });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}