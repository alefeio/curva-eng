import { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import AdminLayout from 'components/admin/AdminLayout';
import TaskDetailModal from 'components/admin/TaskDetailModal';
import TaskEditForm from 'components/admin/TaskEditForm';

// Interfaces (consistentes com o modelo do Prisma e os componentes de modal)
interface User {
  id: string;
  name: string | null; // Corrigido para aceitar null
}

interface Task {
  id: string;
  title: string;
  description: string | null; // Pode ser null
  status: 'PENDENTE' | 'EM_ANDAMENTO' | 'CONCLUIDA';
  priority: number;
  dueDate: string | null; // Pode ser null
  
  // IDs das relações (chaves estrangeiras do DB)
  authorId: string;
  assignedToId: string;

  // Objetos de relação populados pelo Prisma (opcionais na interface, mas esperados na exibição)
  author?: User; 
  assignedTo?: User; 
  
  createdAt: string;
  updatedAt: string;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');

  // Estados para controlar os modais
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tasks');
      if (!response.ok) {
        throw new Error('Falha ao buscar as tarefas.');
      }
      const data: Task[] = await response.json(); 
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Um erro inesperado ocorreu.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Funções para abrir/fechar modais
  const openDetailModal = (task: Task) => {
    setSelectedTask(task);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedTask(null);
  };

  const openEditModal = (task: Task) => {
    setSelectedTask(task);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedTask(null);
  };

  // Função para atualizar a tarefa na lista após a edição
  const handleTaskUpdated = (updatedTask: Task) => {
    setTasks(prevTasks => prevTasks.map(task => 
      task.id === updatedTask.id ? { ...updatedTask, assignedTo: updatedTask.assignedTo } : task 
    ));
    closeEditModal(); // Fecha o modal de edição após a atualização
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'PENDENTE':
        return 'bg-red-100 text-red-800';
      case 'EM_ANDAMENTO':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONCLUIDA':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 2:
        return 'bg-red-500 text-white'; // Alta
      case 1:
        return 'bg-yellow-500 text-white'; // Normal
      case 0:
        return 'bg-blue-500 text-white'; // Baixa
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getPriorityText = (priority: number) => {
    switch (priority) {
      case 2:
        return 'Alta';
      case 1:
        return 'Normal';
      case 0:
        return 'Baixa';
      default:
        return 'N/A';
    }
  };

  const kanbanColumns = {
    'PENDENTE': tasks.filter(task => task.status === 'PENDENTE'),
    'EM_ANDAMENTO': tasks.filter(task => task.status === 'EM_ANDAMENTO'),
    'CONCLUIDA': tasks.filter(task => task.status === 'CONCLUIDA'),
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

        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Minhas Tarefas</h1>
          <div className="flex space-x-4">
            <button
              onClick={() => setViewMode('table')}
              className={`py-2 px-4 rounded-md font-bold transition duration-300 shadow-md ${
                viewMode === 'table' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Tabela
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`py-2 px-4 rounded-md font-bold transition duration-300 shadow-md ${
                viewMode === 'kanban' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Kanban
            </button>
            <Link href="/admin/tasks/new" className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-md transition duration-300 shadow-md">
              + Nova Tarefa
            </Link>
          </div>
        </div>

        {viewMode === 'table' ? (
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            {tasks.length === 0 ? (
              <p className="p-6 text-gray-500 text-center">Nenhuma tarefa encontrada.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Título
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Prioridade
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Responsável
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vencimento
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Ações</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tasks.map((task) => (
                      <tr key={task.id} className="hover:bg-gray-100 transition duration-150 ease-in-out">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                              {task.title}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(task.status)}`}>
                            {task.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                            {getPriorityText(task.priority)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {task.assignedTo?.name || 'N/A'} {/* Acessa name com safe navigation */}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button onClick={() => openDetailModal(task)} className="text-orange-600 hover:text-orange-900 mr-4">
                            Ver Detalhes
                          </button>
                          <button onClick={() => openEditModal(task)} className="text-blue-600 hover:text-blue-900">
                            Editar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(kanbanColumns).map(([status, tasksForColumn]) => (
              <div key={status} className="bg-gray-100 p-4 rounded-lg shadow-md">
                <h2 className="text-lg font-bold text-gray-700 mb-4">{status.replace(/_/g, ' ')} ({tasksForColumn.length})</h2>
                <div className="space-y-4">
                  {tasksForColumn.length === 0 ? (
                    <div className="text-center text-gray-500">
                      Nenhuma tarefa nesta coluna.
                    </div>
                  ) : (
                    tasksForColumn.map(task => (
                      <div key={task.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-lg transition-shadow duration-200">
                        <h3 className="text-base font-semibold text-gray-900 truncate">{task.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">Responsável: {task.assignedTo?.name || 'N/A'}</p> {/* Acessa name com safe navigation */}
                        {task.dueDate && (
                          <p className="text-xs text-gray-400 mt-1">Vencimento: {new Date(task.dueDate).toLocaleDateString()}</p>
                        )}
                        <div className="flex flex-wrap items-center mt-2 space-x-2">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(task.status)}`}>
                            {task.status.replace(/_/g, ' ')}
                          </span>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getPriorityColor(task.priority)}`}>
                            {getPriorityText(task.priority)}
                          </span>
                        </div>
                        <div className="flex justify-end mt-4 space-x-2">
                          <button onClick={() => openDetailModal(task)} className="text-sm text-orange-600 hover:text-orange-900">
                            Detalhes
                          </button>
                          <button onClick={() => openEditModal(task)} className="text-sm text-blue-600 hover:text-blue-900">
                            Editar
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Detalhes da Tarefa */}
      {showDetailModal && selectedTask && (
        <TaskDetailModal 
          task={selectedTask} 
          onClose={closeDetailModal} 
        />
      )}

      {/* Modal de Edição da Tarefa */}
      {showEditModal && selectedTask && (
        <TaskEditForm
          taskId={selectedTask.id}
          onClose={closeEditModal}
          onTaskUpdated={handleTaskUpdated}
        />
      )}
    </AdminLayout>
  );
}
