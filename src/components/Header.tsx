import { useState } from "react"

// Dados para a seção de serviços, extraídos do JSX original
const servicesList = [
  {
    title: "Consultoria Especializada",
    description: "Otimização e inovação para seu projeto.",
  },
  {
    title: "Gerenciamento de Obras",
    description: "Qualidade e eficiência na execução.",
  },
  {
    title: "Projetos Arquitetônicos e Engenharia",
    description: "Planejamento inteligente e funcional.",
  },
  {
    title: "Reformas e Manutenção",
    description: "Revitalização com alto padrão de qualidade.",
  },
  {
    title: "Construção de Alto Padrão",
    description: "Residências e obras públicas com excelência.",
  },
]

// Dados para os números de destaque, extraídos do JSX original
const stats = [
  { value: "100%", label: "Qualidade" },
  { value: "+15 anos", label: "de história" },
  { value: "+2k", label: "Projetos" },
]

export default function Header() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section className="py-12 md:py-20 bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-start">
          {/* Coluna da esquerda: Conteúdo de texto e números */}
          <div className="flex flex-col gap-6">
            <h2 className="w-full text-4xl md:text-5xl font-bold text-orange-500 leading-tight max-w-xs md:max-w-full mx-auto">
              Soluções completas<br /><small className="text-gray-400">para seu empreendimento</small>
            </h2>
            <p className="text-white text-lg leading-relaxed max-w-xs md:max-w-full mx-auto">
              Da concepção à execução, oferecemos projetos inteligentes, gestão eficiente e construção de alto padrão. Combinamos inovação, tecnologia e experiência para entregar soluções personalizadas que agregam valor, qualidade e sustentabilidade ao seu empreendimento.
            </p>

            {/* Números de destaque */}
            <div className="flex flex-col sm:flex-row justify-between gap-8 mt-6">
              {stats.map((stat, index) => (
                <div key={index} className="flex flex-col items-center sm:items-start text-center sm:text-left">
                  <span className="text-4xl font-bold text-orange-500">{stat.value}</span>
                  <span className="text-white text-lg">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Coluna da direita: Lista de serviços em formato de "acordeão" */}
          <div className="flex flex-col gap-4 mt-8 md:mt-0 max-w-xs md:max-w-full mx-auto">
            {servicesList.map((service, index) => (
              <div key={index} className="rounded-lg shadow-md overflow-hidden transition-all duration-300">
                <button
                  className="w-full text-left p-6 bg-white hover:bg-gray-100 transition-colors flex justify-between items-center"
                  onClick={() => setOpen(open === index ? null : index)}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-semibold text-gray-800">{service.title}</span>
                  </div>
                  <span className="text-2xl font-bold text-orange-500">{open === index ? '−' : '+'}</span>
                </button>
                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    open === index ? 'max-h-96 opacity-100 p-6 pt-0 bg-white' : 'max-h-0 opacity-0'
                  }`}
                >
                  <p className="text-gray-600">
                    {service.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}