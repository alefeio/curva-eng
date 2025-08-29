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
  
  createdAt: string;
  updatedAt: string;
}
