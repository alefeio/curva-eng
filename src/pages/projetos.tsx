// pages/projetos.tsx

import React from 'react';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { PrismaClient } from '@prisma/client';
import { Menu as MenuComponent } from 'components/Menu';
import Footer from 'components/Footer';
import ProjetosComponent from '../components/Projetos';
import {
    MenuData,
    LinkItem
} from '../types/index';
import { Analytics } from '@vercel/analytics/next';
import { MenuInterno } from 'components/MenuInterno';

const prisma = new PrismaClient();

interface ProjetosPageProps {
    menu: MenuData | null;
}

export const getServerSideProps: GetServerSideProps<ProjetosPageProps> = async () => {
    try {
        const menus = await prisma.menu.findMany();

        const rawMenu: any | null = menus.length > 0 ? menus[0] : null;

        let formattedMenu: MenuData | null = null;
        if (rawMenu && rawMenu.links && Array.isArray(rawMenu.links)) {
            const links: LinkItem[] = rawMenu.links.map((link: any) => ({
                id: link.id,
                text: link.text,
                url: link.url,
                target: link.target || '_self',
            }));

            formattedMenu = {
                logoUrl: rawMenu.logoUrl || '/images/logo.png',
                links: links,
            };
        }

        return {
            props: {
                menu: JSON.parse(JSON.stringify(formattedMenu)),
            },
        };
    } catch (error) {
        console.error("Erro ao buscar dados do menu:", error);
        return {
            props: {
                menu: null,
            },
        };
    } finally {
        await prisma.$disconnect();
    }
};

const ProjetosPage: React.FC<ProjetosPageProps> = ({ menu }) => {
    return (
        <>
            <Head>
                <title>Portfólio de Projetos | Engenharia, Arquitetura e Reformas em Belém-PA</title>
                <meta name="description" content="Explore nosso portfólio de projetos de engenharia e arquitetura em Belém-PA. Veja nossos cases de sucesso em projetos residenciais, comerciais, institucionais e de obras públicas. Experiência e qualidade comprovadas!" />
                <meta name="keywords" content="portfólio engenharia Belém, projetos de arquitetura, cases de sucesso, projetos residenciais Belém, obras comerciais, projetos governamentais, reformas e construção, projetos concluídos, galeria de obras" />
                
                {/* Metas para Redes Sociais (Open Graph) */}
                <meta property="og:title" content="Portfólio de Projetos | Curva Engenharia e Arquitetura" />
                <meta property="og:description" content="Conheça nossos projetos em Belém-PA. Do design de interiores à gestão de obras, veja como transformamos ideias em realidade." />
                <meta property="og:image" content="https://curva-eng.vercel.app/images/portfolio.jpg" />
                <meta property="og:url" content="https://curva-eng.vercel.app/projetos" />
                <meta property="og:type" content="website" />

                {/* Metas para Twitter */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Portfólio de Projetos Concluídos" />
                <meta name="twitter:description" content="Veja nossos projetos de sucesso em engenharia, arquitetura e reformas em Belém-PA." />
                <meta name="twitter:image" content="https://curva-eng.vercel.app/images/portfolio.jpg" />

            </Head>

            <div className="min-h-screen flex flex-col">
                <Analytics />
                <MenuInterno menuData={menu} />
                <main className="flex-grow">
                    <ProjetosComponent />
                </main>
                <Footer menuData={menu} />
            </div>
        </>
    );
};

export default ProjetosPage;