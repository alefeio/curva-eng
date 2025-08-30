import React, { useEffect, useState, FormEvent, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Task, Comment, TaskStatusEnum, User } from 'types/task';

export interface File {
  id: string;
  url: string;
  filename: string;
  mimetype: string;
  uploadedById: string;
  taskId?: string | null;
  projetoId?: string | null;
  createdAt: string;
  uploadedBy?: { id: string; name: string } | null;
  task?: { id: string; title: string } | null;
  projeto?: { id: string; title: string } | null;
}

export interface ExtendedTask extends Task {
  files?: File[];
  projetoId?: string | null;
}

interface CommentWithViewers extends Comment {
  viewedByUsers?: { id: string; name: string }[];
}

interface TaskDetailModalProps {
  task: ExtendedTask;
  onClose: () => void;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, onClose }) => {
  const { data: session } = useSession();
  const [comments, setComments] = useState<CommentWithViewers[]>([]);
  const [newCommentMessage, setNewCommentMessage] = useState<string>('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [hasViewed, setHasViewed] = useState(false);

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [fileToUpload, setFileToUpload] = useState<globalThis.File | null>(null);
  const [isFileUploading, setIsFileUploading] = useState(false);
  const [isFileSavingMetadata, setIsFileSavingMetadata] = useState(false);
  const [fileUploadError, setFileUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showTooltip, setShowTooltip] = useState<string | null>(null);

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
        const data: CommentWithViewers[] = await response.json();
        setComments(data);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao carregar comentários.');
      }
    } catch (error) {
      console.error("Erro ao buscar comentários:", error);
      setCommentError(error instanceof Error ? error.message : 'Erro ao carregar comentários.');
    }
  }, [task?.id]);

  const fetchFiles = useCallback(async () => {
    if (!task?.id) {
      console.warn("Task ID is missing, cannot fetch files.");
      setFileUploadError('Não foi possível carregar arquivos: ID da tarefa ausente.');
      return;
    }
    setFileUploadError(null);
    try {
      const response = await fetch(`/api/files?taskId=${task.id}`);
      if (response.ok) {
        const data: File[] = await response.json();
        setUploadedFiles(data);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao carregar arquivos.');
      }
    } catch (error) {
      console.error("Erro ao buscar arquivos:", error);
      setFileUploadError(error instanceof Error ? error.message : 'Erro ao carregar arquivos.');
    }
  }, [task?.id]);

  const markAsViewed = useCallback(async () => {
    if (!task?.id || !session?.user?.id || hasViewed) return;

    try {
      const response = await fetch(`/api/tasks/${task.id}/mark-viewed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setHasViewed(true);
        console.log(`Tarefa ${task.id} marcada como visualizada pelo usuário ${session.user.id}`);
        fetchComments();
      } else {
        const errorData = await response.json();
        console.error('Erro ao marcar como visualizado:', errorData.message);
      }
    } catch (error) {
      console.error("Erro ao chamar API de visualização:", error);
    }
  }, [task?.id, session?.user?.id, hasViewed, fetchComments]);

  useEffect(() => {
    if (task?.id) {
      fetchComments();
      fetchFiles();
      markAsViewed();
    }
  }, [task?.id, fetchComments, fetchFiles, markAsViewed]);

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
        fetchComments();
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileToUpload(e.target.files[0]);
      setFileUploadError(null);
    } else {
      setFileToUpload(null);
    }
  };

  const handleFileUpload = async (e: FormEvent) => {
    e.preventDefault();
    if (!fileToUpload || !task?.id) {
      setFileUploadError('Nenhum arquivo selecionado ou ID da tarefa ausente.');
      return;
    }

    setIsFileUploading(true);
    setFileUploadError(null);

    const formData = new FormData();
    formData.append('file', fileToUpload);

    let uploadedFileDetails: { url: string; filename: string; mimetype: string };

    try {
      // 1. Fazer o upload físico do arquivo (para Cloudinary, S3, etc.)
      console.log('--- Iniciando upload físico do arquivo para /api/upload ---');
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      console.log('Resposta bruta do /api/upload:', uploadResponse);

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        console.error('Erro na resposta do /api/upload:', errorData);
        throw new Error(errorData.message || 'Falha ao fazer upload físico do arquivo.');
      }
      uploadedFileDetails = await uploadResponse.json();
      console.log('Detalhes do arquivo após upload físico (de /api/upload):', uploadedFileDetails);

      // VERIFICAÇÃO CRÍTICA AQUI: Garante que os campos necessários estão presentes
      if (!uploadedFileDetails.url || !uploadedFileDetails.filename || !uploadedFileDetails.mimetype) {
        throw new Error('O endpoint /api/upload não retornou URL, filename ou mimetype válidos.');
      }


      // 2. Salvar os metadados do arquivo no seu banco de dados via /api/files
      setIsFileUploading(false);
      setIsFileSavingMetadata(true);
      console.log('--- Iniciando salvamento de metadados do arquivo para /api/files ---');
      console.log('Payload enviado para /api/files:', {
          url: uploadedFileDetails.url,
          filename: uploadedFileDetails.filename,
          mimetype: uploadedFileDetails.mimetype,
          taskId: task.id,
          projetoId: task.projetoId || null,
      });

      const saveMetadataResponse = await fetch('/api/files', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: uploadedFileDetails.url,
          filename: uploadedFileDetails.filename,
          mimetype: uploadedFileDetails.mimetype,
          taskId: task.id,
          projetoId: task.projetoId || null,
        }),
      });

      console.log('Resposta bruta do /api/files:', saveMetadataResponse);


      if (!saveMetadataResponse.ok) {
        const errorData = await saveMetadataResponse.json();
        console.error('Erro na resposta do /api/files (salvamento de metadados):', errorData);
        throw new Error(errorData.message || 'Falha ao salvar metadados do arquivo.');
      }

      // Se ambos os passos foram bem-sucedidos
      setFileToUpload(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      fetchFiles();
      console.log('Upload e salvamento de metadados do arquivo concluídos com sucesso!');

    } catch (error) {
      console.error("Erro no processo de upload/salvamento do arquivo:", error);
      setFileUploadError(error instanceof Error ? error.message : 'Erro ao processar o arquivo.');
    } finally {
      setIsFileUploading(false);
      setIsFileSavingMetadata(false);
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

  const getFileIcon = (mimetype: string) => {
    if (mimetype.startsWith('image/')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L20 16m-2-6a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      );
    }
    if (mimetype === 'application/pdf') {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    }
    if (mimetype.includes('spreadsheet') || mimetype.includes('excel')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    }
    if (mimetype.includes('document') || mimetype.includes('word')) {
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      }
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0011.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    );
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

  const isProcessingFile = isFileUploading || isFileSavingMetadata;

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

        {/* Seção de Upload de Arquivos */}
        <h3 className="text-xl font-bold mb-3 text-orange-600">Arquivos ({uploadedFiles.length})</h3>
        {(session?.user as any)?.role === 'ADMIN' && (
          <form onSubmit={handleFileUpload} className="mb-6 p-4 border rounded-md bg-gray-50">
            <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2">Anexar Arquivo</label>
            <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3">
              <input
                id="file-upload"
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500
                                  file:mr-4 file:py-2 file:px-4
                                  file:rounded-md file:border-0
                                  file:text-sm file:font-semibold
                                  file:bg-orange-50 file:text-orange-700
                                  hover:file:bg-orange-100"
                disabled={isProcessingFile}
              />
              <button
                type="submit"
                disabled={isProcessingFile || !fileToUpload}
                className={`py-2 px-4 rounded-md font-bold transition duration-300 w-full sm:w-auto ${
                  isProcessingFile || !fileToUpload ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'
                } text-white`}
              >
                {isFileUploading ? 'Enviando...' : isFileSavingMetadata ? 'Salvando...' : 'Enviar'}
              </button>
            </div>
            {fileUploadError && (
              <p className="text-red-600 text-sm mt-2">{fileUploadError}</p>
            )}
          </form>
        )}

        {/* Lista de Arquivos */}
        <div className="mb-6 flex flex-wrap gap-3">
          {uploadedFiles.length === 0 ? (
            <p className="text-gray-600">Nenhum arquivo anexado ainda.</p>
          ) : (
            uploadedFiles.map((file) => (
              <a
                key={file.id}
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 p-2 border rounded-md shadow-sm hover:shadow-md transition-shadow duration-200 bg-white group"
              >
                {getFileIcon(file.mimetype)}
                <span className="text-sm font-medium text-gray-700 group-hover:text-orange-600 truncate max-w-[150px]">
                  {file.filename}
                </span>
              </a>
            ))
          )}
        </div>

        <h3 className="text-xl font-bold mb-3 text-orange-600">Comentários ({comments.length})</h3>
        {commentError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Erro:</strong>
            <span className="block sm:inline"> {commentError}</span>
          </div>
        )}
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
                <div
                  className="relative inline-block z-10"
                  onMouseEnter={() => setShowTooltip(comment.id)}
                  onMouseLeave={() => setShowTooltip(null)}
                >
                  <div className="text-right text-xs text-gray-500 mt-2 cursor-pointer hover:underline">
                    Visualizações: {comment.viewedBy.length}
                  </div>
                  {showTooltip === comment.id && comment.viewedBy.length > 0 && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-max p-2 bg-gray-800 text-white text-xs rounded-md shadow-lg z-20">
                      <p className="font-bold mb-1 text-white">Visualizado por:</p>
                      <ul className="list-disc list-inside">
                        {comment.viewedByUsers && comment.viewedByUsers.length > 0 ? (
                          comment.viewedByUsers.map((viewer) => (
                            <li key={viewer.id} className="text-white">{viewer.name || viewer.id}</li>
                          ))
                        ) : (
                          comment.viewedBy.map((viewerId) => (
                            <li key={viewerId} className="text-white">{viewerId}</li>
                          ))
                        )}
                      </ul>
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
