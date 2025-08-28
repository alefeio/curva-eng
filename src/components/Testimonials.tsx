import React, { useState, useRef, useCallback } from 'react';
import { MdOutlineArrowBackIos, MdOutlineArrowForwardIos } from "react-icons/md"; // Importando os ícones de seta

// Define a tipagem dos dados que serão passados para o componente
interface Testimonial {
  id: string;
  name: string;
  content: string;
  type: string;
}

// Define a tipagem das props do componente
interface TestimonialsPageProps {
  testimonials: Testimonial[];
}

export default function Testimonials({ testimonials }: TestimonialPageProps) {
  const [currentIndex, setCurrentIndex] = useState(0); // Estado para controlar o depoimento visível
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentTranslate, setCurrentTranslate] = useState(0);
  const animationRef = useRef<number | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  const handleNext = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  }, [testimonials.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length);
  }, [testimonials.length]);

  // Funções para lidar com eventos de toque (mobile)
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setIsDragging(true);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    e.currentTarget.style.transition = 'none'; // Desabilita transição CSS durante o arrasto
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    setCurrentTranslate(currentX - startX);
  }, [isDragging, startX]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    const movedBy = currentTranslate;
    const threshold = 50; // Pixels para considerar um swipe

    if (movedBy < -threshold) {
      handleNext();
    } else if (movedBy > threshold) {
      handlePrev();
    }
    setCurrentTranslate(0);
    // Habilita a transição novamente após o arrasto
    if (carouselRef.current) {
      carouselRef.current.style.transition = 'transform 0.5s ease-in-out';
    }
  }, [currentTranslate, handleNext, handlePrev]);

  // Funções para lidar com eventos de mouse (desktop)
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setStartX(e.clientX);
    setIsDragging(true);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    e.currentTarget.style.transition = 'none';
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    setCurrentTranslate(e.clientX - startX);
  }, [isDragging, startX]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    const movedBy = currentTranslate;
    const threshold = 50; // Pixels para considerar um drag

    if (movedBy < -threshold) {
      handleNext();
    } else if (movedBy > threshold) {
      handlePrev();
    }
    setCurrentTranslate(0);
    if (carouselRef.current) {
      carouselRef.current.style.transition = 'transform 0.5s ease-in-out';
    }
  }, [currentTranslate, handleNext, handlePrev]);

  const handleMouseLeave = useCallback(() => {
    if (isDragging) {
      handleMouseUp(); // Simula um mouseUp se o mouse sair da área enquanto arrasta
    }
  }, [isDragging, handleMouseUp]);

  if (!testimonials || testimonials.length === 0) {
    return null; // Não renderiza a seção se não houver depoimentos
  }

  const currentTestimonial = testimonials[currentIndex];

  return (
    <section className="bg-gray-100 py-24 md:py-32">
      <div className="max-w-2xl mx-auto px-4 md:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-800 leading-tight">
            Depoimentos
          </h2>
          <p className="text-gray-700 font-medium text-lg mt-4">O que nossos clientes dizem</p>
        </div>
        
        {/* Carrossel de depoimentos */}
        <div className="relative flex justify-center items-center">
          {/* Botão de navegação para a esquerda */}
          <button
            onClick={handlePrev}
            className="absolute left-0 md:-left-12 z-10 p-2 rounded-full bg-white shadow-md text-gray-700 hover:bg-gray-200 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
            aria-label="Depoimento anterior"
          >
            <MdOutlineArrowBackIos size={24} />
          </button>

          {/* Depoimento atual */}
          <article
            key={currentTestimonial.id}
            ref={carouselRef} // Atribui a ref ao item arrastável
            className="flex-shrink-0 w-full max-w-xl bg-white rounded-xl shadow-lg p-7 mx-auto border-2 border-orange-100 transform transition-transform duration-500 ease-in-out snap-center"
            aria-label={`Depoimento de ${currentTestimonial.name}`}
            style={{ 
              animation: 'fade-in 0.5s forwards', // Adiciona uma animação simples de fade-in
              cursor: isDragging ? 'grabbing' : 'grab', // Altera o cursor
              transform: isDragging ? `translateX(${currentTranslate}px)` : 'translateX(0)', // Move o card durante o arrasto
            }}
            // Eventos de toque
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            // Eventos de mouse
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave} // Lida com o mouse saindo da área enquanto arrasta
          >
            <div className="flex items-start mb-4">
              <span className="text-orange-500 text-4xl leading-none mr-2">“</span>
              <p className="text-gray-700 text-lg md:text-xl italic leading-relaxed flex-1">
                {currentTestimonial.content}
              </p>
              <span className="text-orange-500 text-4xl leading-none ml-2">”</span>
            </div>
            <div className="text-right mt-6">
              <span className="block font-semibold text-gray-800 text-lg md:text-xl">
                — {currentTestimonial.name}
              </span>
            </div>
          </article>

          {/* Botão de navegação para a direita */}
          <button
            onClick={handleNext}
            className="absolute right-0 md:-right-12 z-10 p-2 rounded-full bg-white shadow-md text-gray-700 hover:bg-gray-200 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
            aria-label="Próximo depoimento"
          >
            <MdOutlineArrowForwardIos size={24} />
          </button>
        </div>
        
        {/* Indicadores de página */}
        <div className="flex justify-center mt-8 space-x-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 w-2 rounded-full ${
                index === currentIndex ? 'bg-orange-500' : 'bg-gray-300 hover:bg-gray-400'
              } transition-colors duration-300`}
              aria-label={`Ir para depoimento ${index + 1}`}
            />
          ))}
        </div>

        <p className="text-center text-gray-700 mt-12 px-4">
          Já é nosso cliente?{' '}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://g.page/r/Cb0i7CwI5XQuEBM/review"
            className="text-orange-500 hover:text-orange-600 transition-colors font-bold"
          >
            Conte-nos como foi sua experiência
          </a>
          .
        </p>
      </div>

      {/* Estilos para a animação de fade-in */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </section>
  );
}
