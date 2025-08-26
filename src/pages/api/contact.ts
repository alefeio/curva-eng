// pages/api/contact.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { name, email, phone, serviceOfInterest, message } = req.body;

    // Validação básica dos campos obrigatórios
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Nome, e-mail e mensagem são obrigatórios.' });
    }

    try {
      const newContact = await prisma.contact.create({
        data: {
          name,
          email,
          phone,
          serviceOfInterest,
          message,
        },
      });
      res.status(201).json({ success: true, contact: newContact, message: 'Mensagem enviada com sucesso!' });
    } catch (error: any) {
      console.error('Erro ao salvar contato no banco de dados:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidor ao salvar sua mensagem.' });
    }
  } else {
    // Apenas permite requisições POST
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}