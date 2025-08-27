import React from 'react';
import { HiOutlineBuildingOffice2 } from 'react-icons/hi2';
import { BsPencilSquare, BsTools } from 'react-icons/bs';
import { AiOutlineTeam } from 'react-icons/ai';

const services = [
  {
    title: "Construção",
    description: "Executamos projetos de engenharia de alto padrão, garantindo precisão técnica e inovação. Nossa atuação abrange desde residências exclusivas até grandes obras de infraestrutura, com foco em durabilidade e eficiência.",
    subText: "Construção de Edifícios; Obras de Infraestrutura; Gerenciamento de Canteiro.",
    icon: <HiOutlineBuildingOffice2 className="h-6 w-6 text-white" />,
  },
  {
    title: "Projetos",
    description: "Desenvolvemos soluções completas em arquitetura, engenharia e design de interiores. Criamos projetos que unem estética, funcionalidade e viabilidade técnica, desde a concepção inicial até os detalhes executivos.",
    subText: "Projetos Arquitetônicos; Projetos Estruturais; Projetos de Instalações; Design de Interiores.",
    icon: <BsPencilSquare className="h-6 w-6 text-white" />,
  },
  {
    title: "Reformas e Manutenção",
    description: "Especialistas em revitalizar e modernizar espaços. Realizamos reformas e manutenções com agilidade e qualidade, transformando ambientes de forma estratégica para valorizar o imóvel.",
    subText: "Reformas Residenciais; Adequação de Espaços Comerciais; Manutenção Preventiva e Corretiva.",
    icon: <BsTools className="h-6 w-6 text-white" />,
  },
  {
    title: "Consultoria e Gestão",
    description: "Oferecemos consultoria especializada em todas as etapas do seu projeto. Com vasta experiência em gerenciamento e fiscalização, asseguramos a otimização de custos e o cumprimento de prazos com excelência.",
    subText: "Planejamento e Viabilidade; Gerenciamento de Obras; Fiscalização Técnica.",
    icon: <AiOutlineTeam className="h-6 w-6 text-white" />,
  },
];

const ServicesSection = () => {
  return (
    <section className="bg-gray-50 py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-800 mb-12">Nossa atuação</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {services.map((service, index) => (
            <div key={index} className="bg-gray-800 flex flex-col md:flex-row items-center gap-6 p-6 rounded-lg shadow-lg overflow-hidden transform transition-transform hover:scale-105 duration-300">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center">
                {service.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-orange-500 mb-2 text-center md:text-left mb-6 md:mb-2">{service.title}</h3>
                <p className="text-white mb-4">{service.description}</p>
                <div className="text-sm text-gray-500">
                  <p className="text-orange-500 font-semibold">Serviços associados:</p>
                  <p className='text-white'>{service.subText}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;