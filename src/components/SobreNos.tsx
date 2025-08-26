// src/components/SobreNos.tsx

import React from 'react';
import Image from 'next/image';

const SobreNos: React.FC = () => {
  return (
    <div className="bg-white text-gray-800 py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-8">
        
        {/* Seção de Título e Introdução */}
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-serif text-orange-500 mb-4">Sobre Nós</h1>
          <p className="max-w-3xl mx-auto text-lg md:text-xl text-gray-600">
            A Curva Engenharia e Arquitetura nasceu com a missão de transformar ambientes e concretizar sonhos, unindo expertise técnica, design inovador e um compromisso inabalável com a qualidade.
          </p>
        </div>

        {/* Seção de História */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16 md:mb-24">
          <div className="order-2 md:order-1">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Nossa História</h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              Desde a nossa fundação, temos nos dedicado a entregar projetos que superam expectativas. Cada desafio é uma oportunidade de inovar, e cada projeto concluído é um testemunho do nosso empenho em criar espaços que sejam não apenas belos, mas também funcionais, seguros e sustentáveis. Acreditamos que a colaboração e o detalhe são a chave para o sucesso.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Com uma equipe de profissionais altamente qualificados e apaixonados, atendemos a uma ampla gama de clientes, de pequenas reformas a grandes construções. Nosso crescimento é reflexo da confiança que nossos clientes depositam em nós e do nosso compromisso contínuo com a excelência.
            </p>
          </div>
          <div className="order-1 md:order-2">
            <Image
              src="/images/empresa.jpg"
              alt="Equipe de engenharia e arquitetura em reunião"
              width={600}
              height={400}
              layout="responsive"
              objectFit="cover"
              className="rounded-lg shadow-lg"
            />
          </div>
        </div>

        {/* Seção de Missão, Visão e Valores */}
        <div className="bg-gray-100 rounded-lg p-8 md:p-12 mb-16 md:mb-24">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-2xl font-bold text-orange-500 mb-2">Missão</h3>
              <p className="text-gray-700">
                Oferecer soluções inovadoras e personalizadas em engenharia e arquitetura, garantindo qualidade, segurança e satisfação total do cliente em cada etapa do projeto.
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-orange-500 mb-2">Visão</h3>
              <p className="text-gray-700">
                Ser a empresa de referência no mercado, reconhecida pela excelência técnica, ética profissional e capacidade de transformar ideias em realidade.
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-orange-500 mb-2">Valores</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Ética e Transparência</li>
                <li>Compromisso com o Cliente</li>
                <li>Inovação Contínua</li>
                <li>Excelência Técnica</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Seção de Diferenciais */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <Image
              src="/images/projeto.jpg"
              alt="Projeto arquitetônico em andamento"
              width={600}
              height={400}
              layout="responsive"
              objectFit="cover"
              className="rounded-lg shadow-lg"
            />
          </div>
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Nossos Diferenciais</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2 text-lg leading-relaxed">
              <li>
                <span className="font-semibold text-orange-500">Planejamento Detalhado:</span> Foco em cada etapa do projeto para garantir eficiência e evitar surpresas.
              </li>
              <li>
                <span className="font-semibold text-orange-500">Design Inovador:</span> Soluções criativas que unem estética e funcionalidade.
              </li>
              <li>
                <span className="font-semibold text-orange-500">Acompanhamento Completo:</span> Suporte desde a concepção até a entrega das chaves.
              </li>
              <li>
                <span className="font-semibold text-orange-500">Transparência Total:</span> Comunicação aberta e clara durante todo o processo.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SobreNos;