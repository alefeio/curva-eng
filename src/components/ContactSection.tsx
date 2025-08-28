import React from "react";
import { FaWhatsapp, FaInstagram, FaLinkedin } from "react-icons/fa";

const ContactSection: React.FC = () => {
    return (
        <div className="max-w-7xl mx-auto text-center">
            {/* Título da seção de contato - Adicionado para clareza visual, pode ser removido se a página ContactPage já tiver um bom título */}
            <h2 className="text-4xl font-bold text-gray-800 font-serif mb-12">Nossos Contatos Diretos</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
                {/* Informações de Contato */}
                <div className="flex flex-col items-center p-6 bg-gray-800 rounded-lg shadow-md">
                    <h4 className="font-bold text-white text-xl mb-4">Contatos</h4>
                    <div className="space-y-4 text-gray-300"> {/* Changed to gray-300 for better contrast on dark background */}
                        <p className="flex items-center justify-center space-x-2">
                            {/* Telefone com ícone */}
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <a href="tel:+5591985810208" className="font-semibold hover:text-orange-500 transition-colors">
                                +55 (91) 98201-6888
                            </a>
                        </p>
                        <p className="flex items-center justify-center space-x-2">
                            {/* E-mail com ícone */}
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-2 2.5V19a2 2 0 01-2 2H5a2 2 0 01-2-2v-8.5a2 2 0 012-2h14a2 2 0 012 2z" />
                            </svg>
                            <a href="mailto:contato@curvaengenharia.com.br" className="font-semibold hover:text-orange-500 transition-colors">
                                contato@curvaengenharia.com.br
                            </a>
                        </p>
                    </div>
                </div>

                {/* Mídias Sociais */}
                <div className="flex flex-col items-center p-6 bg-gray-800 rounded-lg shadow-md">
                    <h4 className="font-bold text-white text-xl mb-4">Siga-nos</h4>
                    <div className="flex space-x-6 text-gray-300"> {/* Changed to gray-300 */}
                        {/* Ícone do WhatsApp */}
                        <a href="https://wa.me//5591982016888?text=Gostaria de solicitar um orçamento." target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="text-3xl hover:text-green-500 transition-colors">
                            <FaWhatsapp />
                        </a>
                        {/* Ícone do Instagram */}
                        <a href="https://www.instagram.com/curvaengenhariaearquitetura" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-3xl hover:text-pink-500 transition-colors">
                            <FaInstagram />
                        </a>
                        {/* Ícone do LinkedIn (se existir) */}
                        <a href="#" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-3xl hover:text-blue-500 transition-colors">
                            <FaLinkedin />
                        </a>
                    </div>
                </div>

                {/* Endereço e Mapa */}
                <div className="flex flex-col items-center p-6 bg-gray-800 rounded-lg shadow-md lg:col-span-1 md:col-span-2">
                    <h4 className="font-bold text-white text-xl mb-4">Nossa Localização</h4>
                    <address className="text-orange-500 font-semibold not-italic text-center mb-4">
                        Passagem Tapajós, 46 - Marco, Belém - PA
                    </address>
                    <div className="w-full h-48 rounded-lg overflow-hidden shadow-lg">
                        <iframe
                            title="Curva Engenharia e Arquitetura"
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.524428735484!2d-48.484449999999995!3d-1.4592233!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x92a48f5a32883995%3A0x2e74e5082cec22bd!2sCurva%20Engenharia%20%26%20Arquitetura!5e0!3m2!1spt-PT!2sbr!4v1756190533689!5m2!1spt-PT!2sbr"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactSection;
