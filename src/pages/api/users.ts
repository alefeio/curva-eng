import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { User } from '../../types/task'; // Importa a interface User do arquivo central

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const prismaUsers = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
        },
      });

      const users: User[] = prismaUsers.map(user => ({
        id: user.id,
        name: user.name,
      }));

      res.status(200).json({ users });
    } catch (e: any) {
      console.error('Erro ao buscar usuários:', e);
      res.status(500).json({ success: false, message: 'Falha ao carregar a lista de usuários do banco de dados.' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  await prisma.$disconnect(); 
}
