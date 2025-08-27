// src/components/Projetos.tsx

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaBuilding, FaHome, FaRegBuilding } from 'react-icons/fa';
import { AiOutlineClose } from 'react-icons/ai'; 
import { MdOutlineArrowBackIos, MdOutlineArrowForwardIos } from "react-icons/md";

// Definições de tipo com base no seu schema.prisma e na API
interface ProjetoFoto {
  id: string;
  local: string;
  tipo: string;
  detalhes: string;
  img: string; // URL da imagem
}

interface Projeto {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  order: number;
  items: ProjetoFoto[];
}

const Projetos: React.FC = () => {
  const [projects, setProjects] = useState<Projeto[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('todos');
  const [showModal, setShowModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Projeto | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/crud/projetos", { method: "GET" });
      const data = await res.json();
      if (res.ok && data.success) {
        setProjects(data.projetos.sort((a: Projeto, b: Projeto) => a.order - b.order));
      } else {
        console.error("Erro ao carregar projetos:", data.message);
      }
    } catch (e) {
      console.error("Erro ao conectar com a API de projetos.", e);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (project: Projeto) => {
    setSelectedProject(project);
    setShowModal(true);
    setCurrentImageIndex(0); // Reinicia o slider
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProject(null);
  };
  
  const handleNextImage = () => {
    if (selectedProject) {
        setCurrentImageIndex((prevIndex) => 
            (prevIndex + 1) % selectedProject.items.length
        );
    }
  };

  const handlePrevImage = () => {
    if (selectedProject) {
        setCurrentImageIndex((prevIndex) => 
            (prevIndex - 1 + selectedProject.items.length) % selectedProject.items.length
        );
    }
  };

  // Extrai todas as categorias únicas do banco de dados para os botões de filtro
  const allCategories = Array.from(new Set(projects.flatMap(p => p.items.map(i => i.tipo))));

  const filteredProjects = activeCategory === 'todos'
    ? projects
    : projects.filter(projeto => projeto.items.some(item => item.tipo === activeCategory));

  // Função para mapear tipo para um ícone
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Residencial':
        return <FaHome size={20} className="mr-2" />;
      case 'Comercial':
        return <FaBuilding size={20} className="mr-2" />;
      case 'Público':
        return <FaRegBuilding size={20} className="mr-2" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-50 py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-8">
        
        {/* Título e Introdução */}
        <div className="md:text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-orange-500 mb-4 max-w-xs md:max-w-full mx-auto">Portfólio de Projetos</h1>
          <p className="max-w-4xl mx-auto text-lg md:text-xl text-gray-600 max-w-xs md:max-w-full mx-auto">
            Cada projeto é uma história de sucesso. Explore nossa galeria de trabalhos e veja como a Curva Engenharia e Arquitetura transforma ideias em realidade, com excelência e inovação.
          </p>
        </div>

        {/* Botões de Filtro */}
        <div className="flex flex-wrap justify-center gap-4 my-12">
          <button
            onClick={() => setActiveCategory('todos')}
            className={`px-6 py-2 rounded-full font-semibold transition-colors duration-300 flex items-center ${
              activeCategory === 'todos' ? 'bg-orange-500 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Todos
          </button>
          {allCategories.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-6 py-2 rounded-full font-semibold transition-colors duration-300 flex items-center ${
                activeCategory === category ? 'bg-orange-500 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {getCategoryIcon(category)} {category}
            </button>
          ))}
        </div>

        {/* Galeria de Projetos */}
        {loading ? (
          <p className="text-center text-gray-600 text-xl">Carregando projetos...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((projeto) => (
              <div key={projeto.id} className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-transform hover:scale-105 duration-300">
                <div className="relative h-60 w-full">
                  <Image
                    src={projeto.items[0].img} // Mostra a primeira foto
                    alt={projeto.title}
                    layout="fill"
                    objectFit="cover"
                    className="transition-transform duration-500 hover:scale-110"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 text-gray-800">{projeto.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">{projeto.subtitle}</p>
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
        )}
        
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
          <div className="bg-white rounded-lg shadow-xl p-6 md:p-8 max-w-4xl w-full max-h-[95vh] overflow-y-auto relative" onClick={e => e.stopPropagation()}>
            
            {/* Botão de fechar */}
            <button 
              onClick={closeModal} 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Fechar"
            >
              <AiOutlineClose size={24} />
            </button>
            
            {/* Slider de Imagens */}
            <div className="relative w-full h-80 md:h-96 mb-6 rounded-lg overflow-hidden flex items-center justify-center">
              <Image 
                src={selectedProject.items[currentImageIndex].img} 
                alt={selectedProject.items[currentImageIndex].detalhes} 
                layout="fill" 
                objectFit="cover" 
                className='h-[100px]'
              />
              
              {/* Botões do slider */}
              <button
                onClick={handlePrevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/50 text-gray-800 p-2 rounded-full hover:bg-white transition-colors z-10"
              >
                <MdOutlineArrowBackIos size={24} />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/50 text-gray-800 p-2 rounded-full hover:bg-white transition-colors z-10"
              >
                <MdOutlineArrowForwardIos size={24} />
              </button>
            </div>
            
            {/* Detalhes do Projeto */}
            <h2 className="text-2xl md:text-3xl font-bold text-orange-500 mb-2">
              {selectedProject.title}
            </h2>
            <p className="text-md md:text-lg text-gray-700 mb-4 font-semibold">
              {selectedProject.subtitle}
            </p>
            <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-4">
              {selectedProject.description}
            </p>

            {/* Detalhes da Foto Atual */}
            <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-gray-800 font-semibold mb-1">
                    Tipo: <span className="font-normal">{selectedProject.items[currentImageIndex].tipo}</span>
                </p>
                <p className="text-gray-800 font-semibold mb-1">
                    Local: <span className="font-normal">{selectedProject.items[currentImageIndex].local}</span>
                </p>
                <p className="text-gray-800 font-semibold">
                    Detalhes: <span className="font-normal">{selectedProject.items[currentImageIndex].detalhes}</span>
                </p>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
};

export default Projetos;