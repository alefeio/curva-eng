import React, { useState, ChangeEvent } from 'react';

// Função para aplicar a máscara no número de telefone
const formatPhoneNumber = (value: string): string => {
    if (!value) return value;
    const phoneNumber = value.replace(/[^\d]/g, '');
    const phoneNumberLength = phoneNumber.length;

    if (phoneNumberLength <= 2) {
        return phoneNumber;
    }

    if (phoneNumberLength <= 7) {
        return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2)}`;
    }

    if (phoneNumberLength <= 11) {
        return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2, 7)}-${phoneNumber.slice(7)}`;
    }

    // Retorna o formato completo de 11 dígitos para o Brasil
    return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2, 7)}-${phoneNumber.slice(7, 11)}`;
};

const ContactForm: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [serviceOfInterest, setServiceOfInterest] = useState('');
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState(''); // 'success', 'error', 'submitting'

    const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
        const formattedPhoneNumber = formatPhoneNumber(e.target.value);
        setPhone(formattedPhoneNumber);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('submitting');

        try {
            const res = await fetch('/api/contact', { // Alterado o endpoint da API
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, phone, serviceOfInterest, message }),
            });

            const data = await res.json();

            if (res.ok) {
                setStatus('success');
                setName('');
                setEmail('');
                setPhone('');
                setServiceOfInterest('');
                setMessage('');
            } else {
                setStatus('error');
                console.error('Erro na resposta da API:', data.message);
            }
        } catch (error) {
            setStatus('error');
            console.error('Erro ao submeter o formulário:', error);
        }
    };

    return (
        <section id='contato' className="py-12 md:py-20 px-4 text-white bg-white">
            <div className="mx-auto rounded-xl py-12 md:py-20 bg-gray-800 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <p className="text-orange-400 font-semibold text-lg">Faça um orçamento</p>
                    <h2 className="text-white text-4xl md:text-5xl font-bold leading-tight mb-4 max-w-xs md:max-w-5xl mx-auto">
                        Transforme seu Projeto em Realidade
                    </h2>
                    <p className="text-lg text-gray-300 mb-8 max-w-xs md:max-w-5xl mx-auto">
                        Compartilhe suas ideias e necessidades. Nossa equipe está pronta para oferecer as melhores soluções em engenharia, arquitetura e design.
                    </p>
                </div>
                {/* Usando flexbox para colocar os inputs na mesma linha */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-2xl mx-auto">
                    <div className="flex flex-wrap -mx-2">
                        {/* Input para o Nome */}
                        <div className="w-full md:w-1/3 px-2 mb-4 md:mb-0">
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Seu Nome"
                                required
                                className="w-full px-4 py-3 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 bg-gray-700 text-white placeholder-gray-400"
                            />
                        </div>
                        {/* Input para o Email */}
                        <div className="w-full md:w-1/3 px-2 mb-4 md:mb-0">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Seu Email"
                                required
                                className="w-full px-4 py-3 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 bg-gray-700 text-white placeholder-gray-400"
                            />
                        </div>
                        {/* Input para o Telefone */}
                        <div className="w-full md:w-1/3 px-2 mb-4 md:mb-0">
                            <input
                                type="text"
                                value={phone}
                                onChange={handlePhoneChange}
                                placeholder="Celular/WhatsApp"
                                className="w-full px-4 py-3 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 bg-gray-700 text-white placeholder-gray-400"
                            />
                        </div>
                    </div>
                    {/* Select e Textarea com cores e estilo consistentes */}
                    <select
                        value={serviceOfInterest}
                        onChange={(e) => setServiceOfInterest(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 bg-gray-700 text-white placeholder-gray-400"
                    >
                        <option value="">Serviço de Interesse (Opcional)</option>
                        <option value="Construção">Construção</option>
                        <option value="Projetos">Projetos (Arquitetônicos, Engenharia, Interiores)</option>
                        <option value="Reformas e Manutenção">Reformas e Manutenção</option>
                        <option value="Consultoria e Gestão">Consultoria e Gestão</option>
                        <option value="Outro">Outro</option>
                    </select>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Descreva seu projeto ou sua necessidade..."
                        rows={5}
                        className="w-full px-4 py-3 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 bg-gray-700 text-white placeholder-gray-400"
                    ></textarea>
                    <button
                        type="submit"
                        disabled={status === 'submitting'}
                        className="mt-4 w-full px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-md transition-colors duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                        {status === 'submitting' ? 'Enviando...' : 'Enviar Mensagem'}
                    </button>
                    {status === 'success' && (
                        <p className="mt-4 text-green-400 font-medium text-center">
                            Sua mensagem foi enviada com sucesso! Em breve entraremos em contato.
                        </p>
                    )}
                    {status === 'error' && (
                        <p className="mt-4 text-red-400 font-medium text-center">
                            Ocorreu um erro ao enviar sua mensagem. Por favor, tente novamente.
                        </p>
                    )}
                </form>
            </div>
        </section>
    );
};

export default ContactForm;
