import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import AdminLayout from 'components/admin/AdminLayout';

// Defina as interfaces para o formulário
interface TaskFormData {
  title: string;
  description: string;
  status: 'PENDENTE' | 'EM_ANDAMENTO' | 'CONCLUIDA';
  priority: number; // Agora o estado guarda o valor numérico
  dueDate: string;
  assignedToId: string;
}

interface User {
  id: string;
  name: string;
}

export default function NewTaskPage() {
  const router = useRouter();
  const { data: session } = useSession(); // Obtenha a sessão do usuário
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    status: 'PENDENTE',
    priority: 1, // Valor inicial para a prioridade (Normal)
    dueDate: '',
    assignedToId: '',
  });
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usersLoading, setUsersLoading] = useState(true);

  // Busca a lista de usuários da sua API /api/users
  useEffect(() => {
    const fetchUsers = async () => {
      setUsersLoading(true);
      try {
        const response = await fetch('/api/users');
        if (!response.ok) {
          throw new Error('Failed to load users.');
        }
        const data = await response.json();
        setUsers(data.users);
      } catch (err) {
        console.error('Falha ao buscar usuários:', err);
        setError('Falha ao carregar a lista de usuários.');
      } finally {
        setUsersLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    // Converte o valor de prioridade para número
    const updatedValue = name === 'priority' ? parseInt(value) : value;
    setFormData(prev => ({ ...prev, [name]: updatedValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Adicionando validação do lado do cliente
    if (!formData.title || !formData.assignedToId || !formData.dueDate) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    
    // Obter o autorId da sessão
    const authorId = session?.user?.id;
    if (!authorId) {
      setError('Não foi possível obter o ID do autor. Por favor, faça login novamente.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, authorId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao criar a tarefa.');
      }

      const newTask = await response.json();
      console.log('Tarefa criada com sucesso:', newTask);

      router.push('/admin/tasks'); // Redireciona para a lista de tarefas após o sucesso
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Um erro inesperado ocorreu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto p-4 md:p-8">
        <Head>
          <title>Nova Tarefa</title>
        </Head>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Criar Nova Tarefa</h1>
          <p className="text-gray-500">
            <Link href="/admin/tasks" className="text-accent hover:underline">Voltar para a lista de tarefas</Link>
          </p>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="text-red-500 text-sm">{error}</div>}

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">Título</label>
              <input
                type="text"
                name="title"
                id="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descrição</label>
              <textarea
                name="description"
                id="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  name="status"
                  id="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm"
                >
                  <option value="PENDENTE">Pendente</option>
                  <option value="EM_ANDAMENTO">Em Andamento</option>
                  <option value="CONCLUIDA">Concluída</option>
                </select>
              </div>

              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700">Prioridade</label>
                <select
                  name="priority"
                  id="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm"
                >
                  <option value={0}>Baixa</option>
                  <option value={1}>Normal</option>
                  <option value={2}>Alta</option>
                </select>
              </div>

              <div>
                <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">Data de Vencimento</label>
                <input
                  type="date"
                  name="dueDate"
                  id="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="assignedToId" className="block text-sm font-medium text-gray-700">Responsável</label>
                {usersLoading ? (
                  <p className="mt-1 text-gray-500">Carregando usuários...</p>
                ) : (
                  <select
                    name="assignedToId"
                    id="assignedToId"
                    value={formData.assignedToId}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm"
                  >
                    <option value="">Selecione um usuário...</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>{user.name}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading || usersLoading}
                className={`py-2 px-4 rounded-md font-bold transition duration-300 ${loading || usersLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-accent hover:bg-accent-dark'} text-white`}
              >
                {loading ? 'Criando...' : 'Criar Tarefa'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
