import React from 'react';
import Image from 'next/image';

interface SobreNosHeroBannerProps {
  imageUrl?: string; // Opcional, para caso você queira usar uma imagem específica
}

const SobreNosHeroBanner: React.FC<SobreNosHeroBannerProps> = ({ imageUrl }) => {
  const defaultImageUrl = "https://placehold.co/1920x400/orange/white?text=Conheça+a+Curva+Engenharia+e+Arquitetura"; // Placeholder

  return (
    <div className="relative w-full h-[300px] md:h-[400px] overflow-hidden bg-gray-800 flex items-center justify-center">
      {/* Imagem de fundo, usando a prop ou o placeholder */}
      <Image
        src={imageUrl || defaultImageUrl}
        alt="Background da página Sobre Nós: Conheça a Curva Engenharia e Arquitetura"
        layout="fill"
        objectFit="cover"
        className="absolute inset-0 z-0 opacity-70" // Sutil opacidade para o texto se destacar
      />

      {/* Camada de sobreposição escura para melhorar o contraste do texto */}
      <div className="absolute inset-0 bg-black opacity-50 z-10"></div>

      {/* Conteúdo do banner */}
      <div className="relative z-20 text-center text-white px-4 md:px-8 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-4 drop-shadow-lg">
          Conheça a Curva Engenharia e Arquitetura
        </h1>
        <p className="text-lg md:text-xl lg:text-2xl font-medium drop-shadow-md">
          Nascemos com a missão de transformar ambientes e concretizar sonhos, unindo expertise técnica, design inovador e um compromisso inabalável com a qualidade e a satisfação do cliente.
        </p>
      </div>
    </div>
  );
};

export default SobreNosHeroBanner;
