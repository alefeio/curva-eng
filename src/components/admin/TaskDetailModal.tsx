import React from 'react';
import { MdClose, MdPerson, MdCalendarToday, MdOutlineDescription, MdLabel, MdPriorityHigh } from 'react-icons/md';
import { Task } from 'types/task';

interface TaskDetailModalProps {
  task: Task;
  onClose: () => void;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, onClose }) => {
  // Função auxiliar para formatar a data
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Mapeamento de status para classes Tailwind
  const getStatusBadge = (status: Task['status']) => {
    switch (status) {
      case 'PENDENTE': return 'bg-yellow-100 text-yellow-800';
      case 'EM_ANDAMENTO': return 'bg-blue-100 text-blue-800';
      case 'CONCLUIDA': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Mapeamento de prioridade para classes Tailwind e texto
  const getPriorityBadge = (priority: Task['priority']) => {
    switch (priority) {
      case 0: return { text: 'Baixa', class: 'bg-blue-100 text-blue-800' };
      case 1: return { text: 'Normal', class: 'bg-yellow-100 text-yellow-800' };
      case 2: return { text: 'Alta', class: 'bg-red-100 text-red-800' };
      default: return { text: 'N/A', class: 'bg-gray-100 text-gray-800' };
    }
  };

  const priorityInfo = getPriorityBadge(task.priority);

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
        
        <h2 className="text-3xl font-extrabold text-gray-800 mb-6 border-b pb-4">Detalhes da Tarefa</h2>

        <div className="space-y-4">
          {/* Título */}
          <div>
            <p className="text-gray-500 text-sm font-medium mb-1">Título</p>
            <p className="text-gray-900 text-xl font-semibold">{task.title}</p>
          </div>

          {/* Descrição */}
          {task.description && (
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1 flex items-center"><MdOutlineDescription className="mr-2" />Descrição</p>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{task.description}</p>
            </div>
          )}

          {/* Status, Prioridade, Responsável e Data de Vencimento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t mt-4">
            {/* Status */}
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1 flex items-center"><MdLabel className="mr-2" />Status</p>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadge(task.status)}`}>
                {task.status.replace('_', ' ')}
              </span>
            </div>

            {/* Prioridade */}
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1 flex items-center"><MdPriorityHigh className="mr-2" />Prioridade</p>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${priorityInfo.class}`}>
                {priorityInfo.text}
              </span>
            </div>

            {/* Responsável */}
            {task.assignedTo && (
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1 flex items-center"><MdPerson className="mr-2" />Responsável</p>
                <p className="text-gray-700 font-medium">{task.assignedTo.name || 'Não atribuído'}</p>
              </div>
            )}

            {/* Data de Vencimento */}
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1 flex items-center"><MdCalendarToday className="mr-2" />Vencimento</p>
              <p className="text-gray-700 font-medium">{formatDate(task.dueDate)}</p>
            </div>
          </div>

          {/* Datas de Criação e Atualização */}
          <div className="pt-4 border-t text-sm text-gray-500">
            <p>Criado em: {formatDate(task.createdAt)}</p>
            <p>Última atualização: {formatDate(task.updatedAt)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;
