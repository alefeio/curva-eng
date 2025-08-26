// src/components/Projetos.tsx

import React, { useState } from 'react';
import Image from 'next/image';
import { FaBuilding, FaHome, FaRegBuilding } from 'react-icons/fa';
import { AiOutlineClose } from 'react-icons/ai'; // Ícone para o botão de fechar

// Observação: Se ainda não tiver, você precisa instalar a biblioteca de ícones:
// npm install react-icons

interface Projeto {
  id: number;
  title: string;
  description: string;
  category: 'residencial' | 'comercial' | 'governamental';
  imageUrl: string;
  // Adicionando um campo de descrição mais detalhada para o modal
  fullDescription: string;
}

const projectsData: Projeto[] = [
  {
    id: 1,
    title: 'Residência Moderna Belém',
    description: 'Um projeto residencial que integra design contemporâneo com a vegetação local.',
    fullDescription: 'Este projeto residencial em Belém, Pará, foi concebido para se harmonizar com a paisagem natural da região. A arquitetura moderna valoriza o uso de materiais locais e a iluminação natural, criando um ambiente aberto e arejado. O design de interiores integra o exterior com o interior, com grandes janelas e áreas de convivência que se abrem para o jardim, proporcionando conforto e bem-estar para os moradores.',
    category: 'residencial',
    imageUrl: 'https://images.unsplash.com/photo-1613545325278-f24b0cae1224?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: 2,
    title: 'Edifício Comercial Rio de Janeiro',
    description: 'Um edifício corporativo com fachada de vidro e estrutura metálica.',
    fullDescription: 'Com uma arquitetura arrojada e contemporânea, este edifício no Rio de Janeiro foi projetado para ser um novo polo de negócios. A fachada de vidro maximiza a entrada de luz natural e oferece vistas panorâmicas da cidade. O projeto estrutural otimizou o espaço interno, permitindo flexibilidade para a configuração de escritórios, e as soluções de eficiência energética garantem um baixo custo operacional.',
    category: 'comercial',
    imageUrl: 'https://images.unsplash.com/photo-1594950328224-118e7c2e9a59?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: 3,
    title: 'Reforma de Escola Pública',
    description: 'Reforma completa de uma escola pública para modernizar a infraestrutura.',
    fullDescription: 'Este projeto foi uma reforma abrangente em uma escola pública para proporcionar um ambiente de aprendizado mais seguro e moderno. A reestruturação incluiu a reforma das salas de aula, a construção de uma nova quadra poliesportiva e a readequação da área externa. Nossa equipe trabalhou em estreita colaboração com as autoridades para garantir que a obra fosse concluída dentro do prazo e do orçamento, sem comprometer a qualidade e a segurança.',
    category: 'governamental',
    imageUrl: 'https://images.unsplash.com/photo-1543269829-2d58546b12a8?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: 4,
    title: 'Residência Urbana Curitiba',
    description: 'Projeto de uma casa em lote estreito, focado em otimizar o espaço.',
    fullDescription: 'Projetada para um lote urbano estreito em Curitiba, esta casa é um exemplo de como a arquitetura inteligente pode maximizar o espaço e a funcionalidade. O design minimalista e as soluções de iluminação estratégica criam uma sensação de amplitude. A integração das áreas sociais e a otimização dos ambientes internos resultam em um lar confortável e moderno, perfeito para a vida urbana.',
    category: 'residencial',
    imageUrl: 'https://images.unsplash.com/photo-1560518883-ce0972591603?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: 5,
    title: 'Sede de Startup de Tecnologia',
    description: 'Criação de um ambiente de trabalho moderno e colaborativo.',
    fullDescription: 'A sede desta startup de tecnologia foi pensada para refletir sua cultura jovem e inovadora. O projeto de interiores criou espaços abertos, áreas de descompressão e salas de reunião modulares, incentivando a colaboração e a criatividade. A infraestrutura tecnológica foi completamente modernizada, garantindo um ambiente de trabalho de alta performance e bem-estar para os colaboradores.',
    category: 'comercial',
    imageUrl: 'https://images.unsplash.com/photo-1517048676732-d65bc9c55421?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: 6,
    title: 'Posto de Saúde Comunitário',
    description: 'Projeto e construção de um novo posto de saúde para a comunidade.',
    fullDescription: 'Com foco na saúde e no bem-estar da população, este posto de saúde foi construído com base em princípios de sustentabilidade e acessibilidade. O design funcional facilita o fluxo de pacientes e equipe, e os materiais utilizados garantem durabilidade e baixa manutenção. A obra, executada com transparência e eficiência, contribuiu para a melhoria da infraestrutura de saúde local.',
    category: 'governamental',
    imageUrl: 'https://images.unsplash.com/photo-1579684385153-61b4632b6e15?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
];

const Projetos: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'todos' | 'residencial' | 'comercial' | 'governamental'>('todos');
  const [showModal, setShowModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Projeto | null>(null);

  const filteredProjects = activeCategory === 'todos'
    ? projectsData
    : projectsData.filter(projeto => projeto.category === activeCategory);

  const openModal = (project: Projeto) => {
    setSelectedProject(project);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProject(null);
  };

  return (
    <div className="bg-gray-50 py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-8">
        
        {/* Título e Introdução */}
        <div className="text-center my-16">
          <h1 className="text-4xl md:text-5xl font-bold font-serif text-orange-500 mb-4">Portfólio de Projetos</h1>
          <p className="max-w-4xl mx-auto text-lg md:text-xl text-gray-600">
            Cada projeto é uma história de sucesso. Explore nossa galeria de trabalhos e veja como a Curva Engenharia e Arquitetura transforma ideias em realidade, com excelência e inovação.
          </p>
        </div>

        {/* Botões de Filtro */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <button
            onClick={() => setActiveCategory('todos')}
            className={`px-6 py-2 rounded-full font-semibold transition-colors duration-300 ${
              activeCategory === 'todos' ? 'bg-orange-500 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setActiveCategory('residencial')}
            className={`px-6 py-2 rounded-full font-semibold transition-colors duration-300 ${
              activeCategory === 'residencial' ? 'bg-orange-500 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Residenciais
          </button>
          <button
            onClick={() => setActiveCategory('comercial')}
            className={`px-6 py-2 rounded-full font-semibold transition-colors duration-300 ${
              activeCategory === 'comercial' ? 'bg-orange-500 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Comerciais
          </button>
          <button
            onClick={() => setActiveCategory('governamental')}
            className={`px-6 py-2 rounded-full font-semibold transition-colors duration-300 ${
              activeCategory === 'governamental' ? 'bg-orange-500 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Governamentais
          </button>
        </div>

        {/* Galeria de Projetos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((projeto) => (
            <div key={projeto.id} className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-transform hover:scale-105 duration-300">
              <div className="relative h-60 w-full">
                <Image
                  src={projeto.imageUrl}
                  alt={projeto.title}
                  layout="fill"
                  objectFit="cover"
                  className="transition-transform duration-500 hover:scale-110"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-gray-800">{projeto.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">{projeto.description}</p>
                <button 
                  onClick={() => openModal(projeto)} 
                  className="text-orange-500 font-semibold hover:underline"
                >
                  Ver Projeto <span aria-hidden="true">&rarr;</span>
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {/* Chamada para Ação (Call to Action) */}
        <div className="text-center mt-16">
          <p className="text-lg md:text-xl text-gray-600 mb-6">
            Não encontrou o que procura? Nós criamos uma solução sob medida para você.
          </p>
          <a
            href="/contato"
            className="inline-block bg-orange-500 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-orange-600 transition-colors duration-300"
          >
            Fale Conosco
          </a>
        </div>

      </div>

      {/* Modal do Projeto */}
      {showModal && selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm p-4" onClick={closeModal}>
          <div className="bg-white rounded-lg shadow-xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative" onClick={e => e.stopPropagation()}>
            
            {/* Botão de fechar */}
            <button 
              onClick={closeModal} 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Fechar"
            >
              <AiOutlineClose size={24} />
            </button>
            
            <div className="relative w-full h-64 md:h-80 mb-6 rounded-lg overflow-hidden">
              <Image 
                src={selectedProject.imageUrl} 
                alt={selectedProject.title} 
                layout="fill" 
                objectFit="cover" 
              />
            </div>
            
            <h2 className="text-2xl md:text-3xl font-bold text-orange-500 mb-2">
              {selectedProject.title}
            </h2>
            <p className="text-sm md:text-base text-gray-700 leading-relaxed">
              {selectedProject.fullDescription}
            </p>
            
          </div>
        </div>
      )}
    </div>
  );
};

export default Projetos;