import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import AdminLayout from 'components/admin/AdminLayout';

// Defina a interface para a tarefa, correspondendo ao seu modelo do Prisma
interface Task {
  id: string;
  title: string;
  description: string;
  status: 'PENDENTE' | 'EM_ANDAMENTO' | 'CONCLUIDA';
  priority: number;
  dueDate: string | null;
  author: { id: string; name: string };
  assignedTo: { id: string; name: string };
  createdAt: string;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/tasks');
        if (!response.ok) {
          throw new Error('Falha ao buscar as tarefas.');
        }
        const data = await response.json();
        setTasks(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Um erro inesperado ocorreu.');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'PENDENTE':
        return 'bg-red-200 text-red-800';
      case 'EM_ANDAMENTO':
        return 'bg-yellow-200 text-yellow-800';
      case 'CONCLUIDA':
        return 'bg-green-200 text-green-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-screen">
          <p>Carregando tarefas...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-screen">
          <p className="text-red-500">Erro: {error}</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto p-4 md:p-8">
        <Head>
          <title>Gerenciador de Tarefas</title>
        </Head>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Minhas Tarefas</h1>
          <Link href="/admin/tasks/new" className="bg-accent hover:bg-accent-dark text-white font-bold py-2 px-4 rounded-md transition duration-300">
            + Nova Tarefa
          </Link>
        </div>

        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {tasks.length === 0 ? (
            <p className="p-6 text-gray-500 text-center">Nenhuma tarefa encontrada.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {tasks.map((task) => (
                <li key={task.id} className="p-4 md:p-6 hover:bg-gray-50 transition duration-150 ease-in-out">
                  <Link href={`/tasks/${task.id}`}>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                      <div className="flex-1 min-w-0">
                        <div className="text-lg font-semibold text-gray-900 truncate">
                          {task.title}
                        </div>
                        <div className="text-sm text-gray-500 truncate mt-1">
                          Responsável: {task.assignedTo.name}
                        </div>
                      </div>
                      <div className="mt-2 md:mt-0 md:ml-4 flex items-center space-x-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(task.status)}`}>
                          {task.status.replace(/_/g, ' ')}
                        </span>
                        {task.dueDate && (
                          <span className="text-sm text-gray-500">
                            Vencimento: {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
