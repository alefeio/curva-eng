// src/components/HeroSlider.tsx

import { useState, useEffect } from "react";
import Link from 'next/link';
import { useRouter } from 'next/router';

// Interface atualizada para corresponder ao BannerForm.tsx
interface BannerItem {
  id: string;
  url: string;
  title?: string;
  subtitle?: string;
  link?: string;
  target?: string;
  buttonText?: string;
  buttonColor?: string;
}

interface HeroSliderProps {
  banners: {
    banners: BannerItem[];
  }[];
}

export default function HeroSlider({ banners }: HeroSliderProps) {
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [startX, setStartX] = useState<number | null>(null);
  const slides = banners[0]?.banners || [];
  const router = useRouter();

  useEffect(() => {
    if (!playing || slides.length === 0) return;
    const timer = setTimeout(() => setCurrent((c) => (c + 1) % slides.length), 10000);
    return () => clearTimeout(timer);
  }, [current, playing, slides.length]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setPlaying(false);
    setStartX(e.clientX);
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (startX === null) return;
    const deltaX = e.clientX - startX;

    if (Math.abs(deltaX) > 50) {
      setCurrent((prev) => (deltaX > 0 ? (prev - 1 + slides.length) % slides.length : (prev + 1) % slides.length));
    }

    setStartX(null);
    setPlaying(true);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setPlaying(false);
    setStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (startX === null) return;
    const endX = e.changedTouches[0].clientX;
    const deltaX = endX - startX;

    if (Math.abs(deltaX) > 50) {
      setCurrent((prev) => (deltaX > 0 ? (prev - 1 + slides.length) % slides.length : (prev + 1) % slides.length));
    }

    setStartX(null);
    setPlaying(true);
  };

  if (slides.length === 0) {
    return null;
  }

  return (
    <div
      className="relative w-full h-[50vh] md:h-[60vh] lg:h-[70vh] overflow-hidden shadow-lg mb-8"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseEnter={() => setPlaying(false)}
      onMouseLeave={() => setPlaying(true)}
      id="inicio"
    >
      {slides.map((slide, idx) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-700 ${idx === current ? "opacity-100 z-0" : "opacity-0 z-0"}`}
        >
          {/* A imagem não é mais um link */}
          <img src={slide.url} alt={slide.title || `Banner ${idx + 1}`} className="object-cover w-full h-full" />

          {/* Container para o conteúdo do banner */}
          {(slide.title || slide.subtitle || slide.buttonText) && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col items-start justify-end md:justify-center p-6 md:p-10 text-left">
              <div className="container flex flex-col lg:flex-row items-start lg:items-end justify-between w-full">
                {/* Título e Subtítulo */}
                <div className="flex-1 mb-8">
                  {slide.title && (
                    <h2 className="font-sans text-3xl md:text-4xl lg:text-6xl font-bold text-white drop-shadow mb-2">
                      {slide.title}
                    </h2>
                  )}
                  {slide.subtitle && (
                    <>
                      <div className="w-24 border-b-2 border-accent mb-4"></div>
                      <p className="max-w-xl text-sm md:text-md lg:text-lg text-neutral-light drop-shadow mb-4 lg:mb-0">
                        {slide.subtitle}
                      </p>
                    </>
                  )}
                  {/* Botão com Link */}
                  {slide.buttonText && slide.link && (
                    <div className="mt-4">
                      <button
                        onClick={() => router.push(slide.link || '')}
                        className={`py-2 px-6 rounded-md font-bold transition-all duration-300 ${slide.buttonColor || "bg-accent hover:bg-accent-dark"} text-white`}
                      >
                        {slide.buttonText}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Navegação e Controles */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            className={`w-3 h-3 rounded-full ${idx === current ? "bg-accent" : "bg-neutral-white/50 opacity-70"}`}
            onClick={() => setCurrent(idx)}
            aria-label={`Ir para slide ${idx + 1}`}
          />
        ))}
      </div>

      <button
        className="absolute bottom-4 right-4 bg-neutral-white/80 opacity-70 rounded-full p-2 shadow-lg hover:bg-neutral-white z-10"
        onClick={() => setPlaying((p) => !p)}
        aria-label={playing ? "Pausar" : "Reproduzir"}
      >
        {playing ? (
          <svg className="w-5 h-5 text-neutral-dark" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-neutral-dark" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>
    </div>
  );
}