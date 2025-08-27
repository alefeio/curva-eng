import Link from "next/link";
import { useRouter } from "next/router";

export default function Hero() {
  const router = useRouter();

  const handleClick = (pg: string) => {
    router.push(pg);
  };

  return (
    <section className="bg-neutral-light py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center">
          {/* Coluna da esquerda: Conteúdo de texto */}
          <div className="flex-1 flex flex-col gap-4">
            <p className="text-accent font-semibold text-lg">Sobre nós</p>
            <h2 className="text-4xl md:text-5xl font-bold text-primary leading-tight max-w-xs md:max-w-5xl mx-auto">
              História, Missão e Expertise
            </h2>
            <p className="text-neutral-dark text-lg leading-relaxed max-w-xs md:max-w-5xl mx-auto">
              Há mais de uma década, a Curva Engenharia e Arquitetura transforma projetos em realidade. Nossa missão é ir além da construção, unindo a precisão da engenharia com a criatividade da arquitetura para entregar soluções completas e de alta qualidade. Somos movidos pela paixão por construir, reformar e projetar, criando espaços que geram impacto positivo para nossos clientes e para a comunidade.
            </p>
            <div className="mt-4 w-fit mx-auto md:mx-0">
              <a href="/sobre" className="bg-accent text-white font-bold py-3 px-6 rounded-md shadow-lg hover:bg-accent-dark transition-colors">
                Leia mais
              </a>
            </div>
          </div>

          {/* Coluna da direita: Imagem */}
          <div className="hidden md:block flex-1 relative overflow-hidden rounded-lg shadow-lg">
            <img
              src="/images/hero.jpg"
              alt="Equipe de engenheiros e arquitetos colaborando"
              className="w-full h-auto object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  )
}