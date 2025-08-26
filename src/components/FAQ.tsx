import { useState } from "react";
import React from 'react';

// Define a tipagem dos dados que serão passados para o componente
interface FAQItem {
  id: string;
  pergunta: string;
  resposta: string;
}

// Define a tipagem das props do componente
interface FAQPageProps {
  faqs: FAQItem[];
}

export default function FAQ({ faqs }: FAQPageProps) {
  const [open, setOpen] = useState<number | null>(null);

  const toggleOpen = (index: number) => {
    setOpen(open === index ? null : index);
  };

  return (
    <section className="bg-white py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <p className="text-orange-500 font-semibold text-lg">Dúvidas Frequentes</p>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 leading-tight">
            Perguntas & Respostas
          </h2>
        </div>

        <div className="max-w-4xl mx-auto flex flex-col gap-4">
          {faqs.map((faq, idx) => (
            <div key={faq.id} className="rounded-lg overflow-hidden border border-gray-200">
              <button
                className="w-full text-left p-6 bg-white hover:bg-gray-50 transition-colors flex justify-between items-center"
                onClick={() => toggleOpen(idx)}
              >
                <span className="text-lg font-semibold text-gray-800">
                  {faq.pergunta}
                </span>
                <span className="text-2xl font-bold text-orange-500">
                  {open === idx ? '−' : '+'}
                </span>
              </button>
              <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  open === idx ? 'max-h-96 opacity-100 p-6 pt-0' : 'max-h-0 opacity-0'
                }`}
              >
                <p className="text-gray-600">
                  {faq.resposta}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}