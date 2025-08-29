import React, { useEffect, useState, FormEvent, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Task, Comment, TaskStatusEnum, User } from 'types/task'; // Adicionado User aqui para o tipo viewedByUsers

// Estenda a interface Comment para incluir 'viewedByUsers'
interface CommentWithViewers extends Comment {
  viewedByUsers?: { id: string; name: string }[];
}

interface TaskDetailModalProps {
  task: Task;
  onClose: () => void;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, onClose }) => {
  const { data: session } = useSession();
  const [comments, setComments] = useState<CommentWithViewers[]>([]); // Usa a interface estendida
  const [newCommentMessage, setNewCommentMessage] = useState<string>('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [hasViewed, setHasViewed] = useState(false);

  // Estado para controlar a visibilidade do tooltip
  const [showTooltip, setShowTooltip] = useState<string | null>(null); // Armazena o ID do comentário para qual o tooltip está ativo

  // Helper para formatar a data
  const formatDate = (dateString: string | Date) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };

  // Função para buscar comentários
  const fetchComments = useCallback(async () => {
    if (!task?.id) {
      console.warn("Task ID is missing, cannot fetch comments.");
      setCommentError('Não foi possível carregar comentários: ID da tarefa ausente.');
      return;
    }
    setCommentError(null);
    try {
      const response = await fetch(`/api/tasks/${task.id}/comments`);
      if (response.ok) {
        const data: CommentWithViewers[] = await response.json(); // Espera o novo formato
        setComments(data);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao carregar comentários.');
      }
    } catch (error) {
      console.error("Erro ao buscar comentários:", error);
      setCommentError(error instanceof Error ? error.message : 'Erro ao carregar comentários.');
    }
  }, [task?.id]); // Dependência: task.id

  // Função para marcar como visualizado
  const markAsViewed = useCallback(async () => {
    if (!task?.id || !session?.user?.id || hasViewed) return;

    try {
      const response = await fetch(`/api/tasks/${task.id}/mark-viewed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // O backend deve pegar o userId da sessão.
      });

      if (response.ok) {
        setHasViewed(true);
        console.log(`Tarefa ${task.id} marcada como visualizada pelo usuário ${session.user.id}`);
        fetchComments(); // Recarrega os comentários para atualizar a contagem de visualizações em tempo real
      } else {
        const errorData = await response.json();
        console.error('Erro ao marcar como visualizado:', errorData.message);
      }
    } catch (error) {
      console.error("Erro ao chamar API de visualização:", error);
    }
  }, [task?.id, session?.user?.id, hasViewed, fetchComments]);


  // Efeito para carregar comentários e marcar como visualizado na montagem
  useEffect(() => {
    if (task?.id) {
      fetchComments();
      markAsViewed();
    }
  }, [task?.id, fetchComments, markAsViewed]);

  // Adicionar comentário
  const handleAddComment = async (e: FormEvent) => {
    e.preventDefault();
    if (!newCommentMessage.trim() || !task?.id) return;

    setCommentLoading(true);
    setCommentError(null);

    try {
      const response = await fetch(`/api/tasks/${task.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: newCommentMessage }),
      });

      if (response.ok) {
        setNewCommentMessage('');
        fetchComments(); // Recarrega os comentários para incluir o novo
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao adicionar comentário.');
      }
    } catch (error) {
      console.error("Erro ao adicionar comentário:", error);
      setCommentError(error instanceof Error ? error.message : 'Erro ao adicionar comentário.');
    } finally {
      setCommentLoading(false);
    }
  };

  const getStatusColor = (status: TaskStatusEnum) => {
    switch (status) {
      case 'PENDENTE':
        return 'bg-yellow-100 text-yellow-800';
      case 'EM_ANDAMENTO':
        return 'bg-blue-100 text-blue-800';
      case 'CONCLUIDA':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 3) return 'bg-red-100 text-red-800';
    if (priority === 2) return 'bg-orange-100 text-orange-800';
    return 'bg-green-100 text-green-800';
  };

  const getPriorityText = (priority: number) => {
    if (priority >= 3) return 'Alta';
    if (priority === 2) return 'Média';
    return 'Baixa';
  };

  if (!task) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center p-4">
        <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full">
          <p>Carregando detalhes da tarefa...</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600">Fechar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center p-4 z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
        <h2 className="text-2xl font-bold mb-4 text-orange-600">Detalhes da Tarefa: {task.title}</h2>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl"
        >
          &times;
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm font-medium text-gray-500">Descrição:</p>
            <p className="mt-1 text-gray-900">{task.description}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Status:</p>
            <span className={`mt-1 px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(task.status)}`}>
              {task.status.replace(/_/g, ' ')}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Prioridade:</p>
            <span className={`mt-1 px-3 py-1 rounded-full text-sm font-semibold ${getPriorityColor(task.priority)}`}>
              {getPriorityText(task.priority)}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Vencimento:</p>
            <p className="mt-1 text-gray-900">{task.dueDate ? formatDate(task.dueDate) : 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Responsável:</p>
            <p className="mt-1 text-gray-900">{task.assignedTo?.name || 'Não atribuído'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Criada em:</p>
            <p className="mt-1 text-gray-900">{formatDate(task.createdAt)}</p>
          </div>
          {task.updatedAt && (
            <div>
              <p className="text-sm font-medium text-gray-500">Última atualização:</p>
              <p className="mt-1 text-gray-900">{formatDate(task.updatedAt)}</p>
            </div>
          )}
        </div>

        <h3 className="text-xl font-bold mb-3 text-orange-600">Comentários ({comments.length})</h3>
        {commentError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Erro:</strong>
            <span className="block sm:inline"> {commentError}</span>
          </div>
        )}
        {/* Adicione overflow-visible aqui para o contêiner de comentários se necessário */}
        <div className="space-y-4 mb-6 max-h-60 overflow-y-auto border p-3 rounded-md bg-gray-50">
          {comments.length === 0 ? (
            <p className="text-gray-600">Nenhum comentário ainda.</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                <div className="flex justify-between items-center text-sm mb-1">
                  <span className="font-semibold text-gray-800">{comment.author?.name || 'Usuário Desconhecido'}</span>
                  <span className="text-gray-500">{formatDate(comment.createdAt)}</span>
                </div>
                <p className="text-gray-700">{comment.message}</p>
                {/* Div para o tooltip */}
                <div
                  className="relative inline-block z-10" // Adicionado z-10 para o contêiner do tooltip
                  onMouseEnter={() => setShowTooltip(comment.id)}
                  onMouseLeave={() => setShowTooltip(null)}
                >
                  <div className="text-right text-xs text-gray-500 mt-2 cursor-pointer hover:underline">
                    Visualizações: {comment.viewedBy.length}
                  </div>
                  {showTooltip === comment.id && comment.viewedBy.length > 0 && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-max p-2 bg-gray-800 text-white text-xs rounded-md shadow-lg z-20">
                      <p className="font-bold mb-1 text-white">Visualizado por:</p> {/* Cor do texto ajustada */}
                      <ul className="list-disc list-inside">
                        {comment.viewedByUsers && comment.viewedByUsers.length > 0 ? (
                          comment.viewedByUsers.map((viewer) => (
                            <li key={viewer.id} className="text-white">{viewer.name || viewer.id}</li> // Mostra o nome ou o ID como fallback
                          ))
                        ) : (
                          comment.viewedBy.map((viewerId) => (
                            <li key={viewerId} className="text-white">{viewerId}</li> // Fallback para IDs se viewedByUsers não estiver disponível
                          ))
                        )}
                      </ul>
                      {/* Triângulo do tooltip */}
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-800 rotate-45 transform -translate-y-1/2"></div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Formulário para Adicionar Comentário */}
        {(session?.user as any)?.role === 'ADMIN' && (
          <form onSubmit={handleAddComment} className="border-t pt-4 mt-4">
            <label htmlFor="newComment" className="block text-sm font-medium text-gray-700 mb-2">Adicionar novo comentário</label>
            <textarea
              id="newComment"
              value={newCommentMessage}
              onChange={(e) => setNewCommentMessage(e.target.value)}
              rows={3}
              className="w-full p-2 border rounded-md focus:ring-orange-500 focus:border-orange-500 mb-3"
              placeholder="Digite seu comentário..."
              disabled={commentLoading}
            ></textarea>
            <button
              type="submit"
              disabled={commentLoading || !newCommentMessage.trim()}
              className={`py-2 px-4 rounded-md font-bold transition duration-300 ${
                commentLoading || !newCommentMessage.trim() ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'
              } text-white`}
            >
              {commentLoading ? 'Enviando...' : 'Comentar'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default TaskDetailModal;
