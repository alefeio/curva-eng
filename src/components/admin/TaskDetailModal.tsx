import React, { useEffect, useState, FormEvent } from 'react';
import { useSession } from 'next-auth/react';
import { Task, Comment, TaskStatusEnum } from 'types/task';

interface TaskDetailModalProps {
  task: Task;
  onClose: () => void;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, onClose }) => {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>(task.comments || []);
  const [newCommentMessage, setNewCommentMessage] = useState<string>('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);

  // Função para buscar comentários (útil se a tarefa não vier com eles inicialmente)
  const fetchComments = async () => {
    if (!task?.id) return;
    try {
      const response = await fetch(`/api/tasks/${task.id}/comments`);
      if (response.ok) {
        const data: Comment[] = await response.json();
        setComments(data);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao carregar comentários.');
      }
    } catch (error) {
      console.error("Erro ao buscar comentários:", error);
      setCommentError(error instanceof Error ? error.message : 'Erro ao carregar comentários.');
    }
  };

  // Registrar visualizações de comentários quando o modal é aberto
  useEffect(() => {
    if (session?.user?.id && comments.length > 0) {
      comments.forEach(comment => {
        // Verifica se o usuário logado ainda não visualizou este comentário
        if (!comment.viewedBy.includes(session.user!.id)) {
          fetch(`/api/comments/${comment.id}/view`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ viewerId: session.user!.id }) // Enviando explicitamente o ID, embora a API o pegue da sessão
          })
          .then(res => res.json())
          .then(data => {
            if (!data.success) {
              console.error(`Erro ao registrar visualização para o comentário ${comment.id}:`, data.message);
            } else {
                // Atualiza o estado do comentário localmente para refletir a nova visualização
                setComments(prevComments => 
                    prevComments.map(c => 
                        c.id === comment.id && !c.viewedBy.includes(session.user!.id)
                            ? { ...c, viewedBy: [...c.viewedBy, session.user!.id] }
                            : c
                    )
                );
            }
          })
          .catch(error => console.error(`Erro na requisição de visualização para o comentário ${comment.id}:`, error));
        }
      });
    }
    // Inicialmente carrega os comentários (se a task já não os tiver)
    if (!task.comments || task.comments.length === 0) {
        fetchComments();
    }
  }, [task.id, session?.user?.id, comments]); // Dependências do useEffect

  const handleAddComment = async (e: FormEvent) => {
    e.preventDefault();
    if (!newCommentMessage.trim() || !session?.user?.id || (session.user as any)?.role !== 'ADMIN') {
      setCommentError('Você precisa estar logado como ADMIN e digitar uma mensagem.');
      return;
    }

    setCommentLoading(true);
    setCommentError(null);

    try {
      const response = await fetch(`/api/tasks/${task.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newCommentMessage, authorId: session.user.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao adicionar comentário.');
      }

      const addedComment: Comment = await response.json();
      setComments(prev => [...prev, addedComment]);
      setNewCommentMessage('');
    } catch (error) {
      setCommentError(error instanceof Error ? error.message : 'Erro ao adicionar comentário.');
    } finally {
      setCommentLoading(false);
    }
  };

  const getStatusColor = (status: TaskStatusEnum) => {
    switch (status) {
      case TaskStatusEnum.PENDENTE: return 'bg-red-100 text-red-800';
      case TaskStatusEnum.EM_ANDAMENTO: return 'bg-yellow-100 text-yellow-800';
      case TaskStatusEnum.CONCLUIDA: return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityText = (priority: number) => {
    switch (priority) {
      case 2: return 'Alta';
      case 1: return 'Normal';
      case 0: return 'Baixa';
      default: return 'N/A';
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 2: return 'bg-red-500 text-white';
      case 1: return 'bg-yellow-500 text-white';
      case 0: return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl p-6 md:p-8 max-w-2xl w-full max-h-[95vh] overflow-y-auto relative" onClick={e => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          &times;
        </button>

        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">{task.title}</h2>
        <p className="text-gray-600 mb-6">{task.description || 'Sem descrição.'}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm font-medium text-gray-500">Status</p>
            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(task.status)}`}>
              {task.status.replace(/_/g, ' ')}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Prioridade</p>
            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
              {getPriorityText(task.priority)}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Responsável</p>
            <p className="text-gray-800 font-semibold">{task.assignedTo?.name || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Autor</p>
            <p className="text-gray-800 font-semibold">{task.author?.name || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Vencimento</p>
            <p className="text-gray-800 font-semibold">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Criado em</p>
            <p className="text-gray-800 font-semibold">{new Date(task.createdAt).toLocaleDateString()} {new Date(task.createdAt).toLocaleTimeString()}</p>
          </div>
        </div>

        {/* Seção de Comentários */}
        <h3 className="text-xl font-bold text-gray-800 mb-4 border-t pt-4 mt-6">Comentários ({comments.length})</h3>
        {commentError && <div className="text-red-500 text-sm mb-4">{commentError}</div>}
        
        <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
          {comments.length === 0 ? (
            <p className="text-gray-500">Nenhum comentário ainda.</p>
          ) : (
            comments.map(comment => (
              <div key={comment.id} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div className="flex justify-between items-center mb-1">
                  <p className="font-semibold text-gray-700">{comment.author?.name || 'Usuário Desconhecido'}</p>
                  <span className="text-xs text-gray-400">
                    {new Date(comment.createdAt).toLocaleDateString()} {new Date(comment.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-gray-700 text-sm">{comment.message}</p>
                <div className="text-right text-xs text-gray-500 mt-2">
                    Visualizações: {comment.viewedBy.length}
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
