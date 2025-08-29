// src/types/task.ts

export enum TaskStatusEnum {
  PENDENTE = 'PENDENTE',
  EM_ANDAMENTO = 'EM_ANDAMENTO',
  CONCLUIDA = 'CONCLUIDA',
}

export interface User {
  id: string;
  name: string | null;
  role?: string | null;
}

// NOVO: Interface para Comentários
export interface Comment {
  id: string;
  message: string;
  createdAt: string; // Ou Date, dependendo de como você formata a data no frontend
  updatedAt: string; // Ou Date
  authorId: string;
  author?: User; // Opcional, para incluir os dados do autor
  taskId: string;
  viewedBy: string[]; // Array de IDs de usuários
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatusEnum;
  priority: number;
  dueDate: string | null;
  
  authorId: string;
  assignedToId: string;

  author?: User;
  assignedTo?: User;
  comments?: Comment[]; // NOVO: Comentários associados à tarefa
  
  createdAt: string;
  updatedAt: string;
}
