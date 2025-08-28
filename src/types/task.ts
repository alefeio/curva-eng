// src/types/task.ts

export interface User {
  id: string;
  name: string | null;
  role?: string | null; // Adicionado para consistência, assumindo que User tem uma role
}

export interface Task {
  id: string;
  title: string;
  description: string | null; // Pode ser null
  status: 'PENDENTE' | 'EM_ANDAMENTO' | 'CONCLUIDA';
  priority: number;
  dueDate: string | null; // Pode ser null
  
  // IDs das relações (chaves estrangeiras do DB)
  authorId: string;
  assignedToId: string;

  // Objetos de relação populados pelo Prisma (opcionais, dependendo da query)
  author?: User; 
  assignedTo?: User; 
  
  createdAt: string;
  updatedAt: string;
}
