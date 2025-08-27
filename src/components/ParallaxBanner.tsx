import React from 'react';

// Adicione a nova prop 'position' à interface
interface ParallaxBannerProps {
  imageUrl: string;
  title: string;
  subtitle: string;
  linkUrl: string;
  buttonText: string;
  position: 'left' | 'center'; // NOVO: 'left' ou 'center'
}

const ParallaxBanner: React.FC<ParallaxBannerProps> = ({
  imageUrl,
  title,
  subtitle,
  linkUrl,
  buttonText,
  position,
}) => {
  // Define as classes de alinhamento com base na prop 'position'
  const alignmentClass = position === 'left' 
    ? 'items-start text-left' 
    : 'items-center text-center';

  return (
    <div className="relative w-full h-[500px] overflow-hidden">
      {/* Camada da imagem de fundo fixa para o efeito Parallax */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${imageUrl})`,
          backgroundAttachment: 'fixed',
        }}
      ></div>

      {/* Camada de sobreposição escura */}
      <div className="absolute inset-0 bg-black opacity-50"></div>

      {/* Camada do conteúdo que rola por cima da imagem fixa */}
      {/* A classe de alinhamento agora é dinâmica */}
      <div className={`max-w-7xl mx-auto relative z-10 flex flex-col justify-center h-full text-white p-8 md:p-16 ${alignmentClass}`}>
        <h2 className="text-3xl md:text-5xl font-bold max-w-2xl leading-tight mb-4 text-white">{title}</h2>
        <p className="text-xl md:text-2xl font-light mb-2 text-white">{subtitle}</p>
        <a href={linkUrl} className="w-fit bg-accent text-white font-bold py-3 px-8 rounded-md shadow-lg hover:bg-accent-dark transition-colors">
          {buttonText}
        </a>
      </div>
    </div>
  );
};

export default ParallaxBanner;