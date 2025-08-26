// src/components/Servicos.tsx

import React from 'react';
import { FaBuilding, FaHome, FaRegBuilding, FaHardHat } from 'react-icons/fa';

// Observação: Certifique-se de que 'react-icons' está instalado.
// Se não estiver: npm install react-icons

const Servicos: React.FC = () => {
  return (
    <div className="bg-white text-gray-800 py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-8">
        
        {/* Seção Principal de Título e Introdução */}
        <div className="text-center my-16">
          <h1 className="text-4xl md:text-5xl font-bold font-serif text-orange-500 mb-4">Soluções Completas para o Seu Projeto</h1>
          <p className="max-w-4xl mx-auto text-lg md:text-xl text-gray-600">
            Na Curva Engenharia e Arquitetura, unimos expertise técnica e inovação para entregar projetos que transformam ambientes e superam expectativas. Atuamos em múltiplos segmentos, garantindo soluções personalizadas e de alta qualidade para cada necessidade.
          </p>
        </div>

        {/* Serviços Residenciais */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16 md:mb-24">
          <div className="order-2 md:order-1">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 flex items-center">
              <FaHome className="text-orange-500 mr-4" /> Projetos Residenciais
            </h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              Transformamos sonhos em lares. Seja para construir sua casa do zero, reformar um apartamento ou revitalizar um condomínio, nossa equipe de engenheiros e arquitetos se dedica a criar espaços que combinam conforto, funcionalidade e a sua personalidade. 
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 text-lg leading-relaxed">
              <li>
                <span className="font-semibold text-orange-500">Arquitetura e Design:</span> Do conceito inicial ao projeto final, soluções inovadoras que otimizam cada metro quadrado.
              </li>
              <li>
                <span className="font-semibold text-orange-500">Gestão de Obras:</span> Acompanhamento completo da execução, garantindo a qualidade, o cumprimento de prazos e a transparência em cada etapa.
              </li>
              <li>
                <span className="font-semibold text-orange-500">Projetos de Interiores e Paisagismo:</span> Criamos ambientes internos e externos que inspiram e oferecem bem-estar.
              </li>
            </ul>
          </div>
          <div className="order-1 md:order-2">
            <div className="bg-gray-200 rounded-lg shadow-lg overflow-hidden">
              <img
                src="/images/serv1.jpg"
                alt="Projeto de arquitetura residencial"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>

        {/* Serviços Comerciais */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16 md:mb-24">
          <div>
            <div className="bg-gray-200 rounded-lg shadow-lg overflow-hidden">
              <img
                src="/images/serv2.jpg"
                alt="Projeto de arquitetura comercial"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 flex items-center">
              <FaRegBuilding className="text-orange-500 mr-4" /> Soluções para Empresas e Construtoras
            </h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              Atendemos a demanda de empresas e construtoras, oferecendo serviços técnicos especializados que garantem a viabilidade e a excelência de grandes projetos. Nossa expertise se estende à construção de edifícios, condomínios e complexos habitacionais.
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 text-lg leading-relaxed">
              <li>
                <span className="font-semibold text-orange-500">Projetos Estruturais:</span> Elaboração de projetos técnicos sólidos, eficientes e seguros para qualquer tipo de edificação.
              </li>
              <li>
                <span className="font-semibold text-orange-500">Urbanização e Loteamento:</span> Planejamento e execução de obras de urbanização, transformando espaços em áreas de desenvolvimento.
              </li>
              <li>
                <span className="font-semibold text-orange-500">Consultoria Técnica:</span> Suporte especializado para otimização de projetos e análise de viabilidade.
              </li>
            </ul>
          </div>
        </div>

        {/* Serviços Públicos */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 flex items-center">
              <FaBuilding className="text-orange-500 mr-4" /> Obras Governamentais e Públicas
            </h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              Possuímos experiência comprovada no desenvolvimento de projetos e execução de obras para o setor público. Atuamos com rigor e transparência na construção e reforma de prédios governamentais, escolas, hospitais e delegacias, contribuindo para a infraestrutura do país.
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 text-lg leading-relaxed">
              <li>
                <span className="font-semibold text-orange-500">Projetos e Reformas:</span> Atendimento às especificações de projetos institucionais com a máxima eficiência.
              </li>
              <li>
                <span className="font-semibold text-orange-500">Fiscalização e Acompanhamento:</span> Garantia de que a execução da obra segue todos os padrões técnicos e regulamentares.
              </li>
            </ul>
          </div>
          <div className="order-1 md:order-2">
            <div className="bg-gray-200 rounded-lg shadow-lg overflow-hidden">
              <img
                src="/images/serv3.jpg"
                alt="Projeto de arquitetura governamental"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default Servicos;