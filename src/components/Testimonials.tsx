import React from 'react';

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

export default function Testimonials({ testimonials }: TestimonialsPageProps) {
  return (
    <section className="py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <p className="text-orange-500 font-semibold text-lg">O que nossos clientes dizem</p>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 leading-tight">
            Depoimentos
          </h2>
        </div>
        
        {/* Carrossel de depoimentos com rolagem horizontal */}
        <div className="flex overflow-x-auto gap-6 pb-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {testimonials.map((t) => (
            <article
              key={t.id}
              className="flex-shrink-0 w-80 md:w-96 bg-white rounded-lg shadow-lg p-6 border border-gray-100"
              aria-label={`Depoimento de ${t.name}`}
            >
              <div className="flex items-start mb-4">
                <span className="text-orange-500 text-3xl leading-none">“</span>
                <p className="text-gray-600 text-lg italic ml-2 leading-relaxed">
                  {t.content}
                </p>
                <span className="text-orange-500 text-3xl leading-none">”</span>
              </div>
              <div className="text-right mt-4">
                <span className="block font-semibold text-gray-800">
                  — {t.name}
                </span>
              </div>
            </article>
          ))}
        </div>
        
        <p className="text-center text-gray-600 mt-12">
          Já é nosso cliente?{' '}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://g.page/r/Cb0i7CwI5XQuEBM/review"
            className="text-orange-500 underline hover:text-orange-600 transition-colors font-semibold"
          >
            Conte-nos como foi sua experiência
          </a>
          .
        </p>
      </div>
    </section>
  );
}