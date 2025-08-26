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
                <title>Portfólio de Projetos | Curva Engenharia</title>
                <meta name="description" content="Explore o portfólio de projetos da Curva Engenharia, com cases de sucesso em projetos residenciais, comerciais e governamentais." />
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