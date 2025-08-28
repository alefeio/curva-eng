import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { MdClose } from 'react-icons/md';
import { useSession } from 'next-auth/react';
import { Task, User } from 'types/task';

interface TaskEditFormProps {
  taskId: string;
  onClose: () => void;
  onTaskUpdated: (updatedTask: Task) => void;
}

const TaskEditForm: React.FC<TaskEditFormProps> = ({ taskId, onClose, onTaskUpdated }) => {
  const { data: session, status } = useSession(); 
  const [formData, setFormData] = useState<Task | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // LOG PARA DEPURAR A SESSÃO NO NAVEGADOR (CLIENT-SIDE)
  useEffect(() => {
    console.log("[TaskEditForm CLIENT] Sessão:", session, "Status:", status);
    if (session) {
      console.log("[TaskEditForm CLIENT] User ID:", session.user?.id);
      console.log("[TaskEditForm CLIENT] User Role:", (session.user as any)?.role);
    }
  }, [session, status]);


  // Busca a tarefa existente e a lista de usuários
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Busca a tarefa existente
        const taskRes = await fetch(`/api/tasks/${taskId}`);
        if (!taskRes.ok) {
          const errorText = await taskRes.text();
          throw new Error(`Falha ao carregar a tarefa: ${taskRes.status} ${taskRes.statusText} - ${errorText}`);
        }
        const taskData: Task = await taskRes.json();
        setFormData({ 
          ...taskData,
          dueDate: taskData.dueDate ? new Date(taskData.dueDate).toISOString().split('T')[0] : ''
        });

        // Busca a lista de usuários
        const usersRes = await fetch('/api/users');
        if (!usersRes.ok) {
          throw new Error('Falha ao carregar usuários.');
        }
        const usersData = await usersRes.json();
        setUsers(usersData.users);

      } catch (err) {
        console.error('Erro ao buscar dados:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar dados da tarefa ou usuários.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [taskId]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (formData) {
      setFormData(prev => ({ 
        ...prev!, 
        [name]: name === 'priority' ? parseInt(value) : value 
      }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    // Verificação de autenticação e role antes de enviar a requisição PUT
    if (status !== 'authenticated' || !session?.user?.id) {
        setError('Você precisa estar logado para editar tarefas.');
        return;
    }
    if ((session.user as any)?.role !== 'ADMIN') {
        setError('Acesso negado. Apenas administradores podem editar tarefas.');
        return;
    }


    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData), 
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao atualizar a tarefa.');
      }

      const updatedTask: Task = await response.json();
      onTaskUpdated(updatedTask); 
      onClose(); 
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Um erro inesperado ocorreu.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-xl w-full text-center">
          <p className="text-gray-700 text-lg">Carregando detalhes da tarefa...</p>
        </div>
      </div>
    );
  }

  // Se houver um erro, exibe-o no modal
  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm p-4" onClick={onClose}>
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-xl w-full text-center relative" onClick={e => e.stopPropagation()}>
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            aria-label="Fechar"
          >
            <MdClose size={28} />
          </button>
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">Entendido</button>
        </div>
      </div>
    );
  }

  if (!formData) return null;

  // Lógica para determinar se o botão deve ser desabilitado
  const isDisabled = submitting || 
                     status === 'loading' || 
                     status === 'unauthenticated' || 
                     (session?.user?.role !== 'ADMIN'); // Verifica diretamente a role

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative transform transition-all scale-100 opacity-100" onClick={e => e.stopPropagation()}>
        
        {/* Botão de fechar */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          aria-label="Fechar"
        >
          <MdClose size={28} />
        </button>
        
        <h2 className="text-3xl font-extrabold text-gray-800 mb-6 border-b pb-4">Editar Tarefa</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Título</label>
            <input
              type="text"
              name="title"
              id="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm p-2"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <textarea
              name="description"
              id="description"
              value={formData.description || ''}
              onChange={handleChange}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm p-2"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                name="status"
                id="status"
                value={formData.status}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm p-2"
              >
                <option value="PENDENTE">Pendente</option>
                <option value="EM_ANDAMENTO">Em Andamento</option>
                <option value="CONCLUIDA">Concluída</option>
              </select>
            </div>

            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
              <select
                name="priority"
                id="priority"
                value={formData.priority}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm p-2"
              >
                <option value={0}>Baixa</option>
                <option value={1}>Normal</option>
                <option value={2}>Alta</option>
              </select>
            </div>

            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">Data de Vencimento</label>
              <input
                type="date"
                name="dueDate"
                id="dueDate"
                value={formData.dueDate || ''} // Pode ser null ou string vazia
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm p-2"
              />
            </div>

            <div>
              <label htmlFor="assignedToId" className="block text-sm font-medium text-gray-700 mb-1">Responsável</label>
              <select
                name="assignedToId"
                id="assignedToId"
                value={formData.assignedToId}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm p-2"
              >
                <option value="">Selecione um usuário...</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t mt-6">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 rounded-md font-bold transition duration-300 bg-gray-200 text-gray-700 hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isDisabled} 
              className={`py-2 px-4 rounded-md font-bold transition duration-300 ${isDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'} text-white`}
            >
              {submitting ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskEditForm;
