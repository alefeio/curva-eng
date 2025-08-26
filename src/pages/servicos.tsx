// pages/servicos.tsx

import React from 'react';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { PrismaClient } from '@prisma/client';
import { Menu as MenuComponent } from 'components/Menu';
import Footer from 'components/Footer';
import ServicosComponent from '../components/Servicos';
import {
    MenuData,
    LinkItem
} from '../types/index';
import { MenuInterno } from 'components/MenuInterno';
import { Analytics } from '@vercel/analytics/next';
import ParallaxBanner from 'components/ParallaxBanner';

const prisma = new PrismaClient();

interface ServicosPageProps {
    menu: MenuData | null;
}

export const getServerSideProps: GetServerSideProps<ServicosPageProps> = async () => {
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

const ServicosPage: React.FC<ServicosPageProps> = ({ menu }) => {
    return (
        <>
            <Head>
                <title>Nossos Serviços | Curva Engenharia</title>
                <meta name="description" content="Conheça a gama completa de serviços de engenharia e arquitetura da Curva Engenharia, incluindo projetos, gerenciamento de obras e consultoria." />
            </Head>

            <div className="min-h-screen flex flex-col">
                <Analytics />
                <MenuInterno menuData={menu} />
                <main className="flex-grow">
                    <ServicosComponent />
                    <ParallaxBanner
                        imageUrl="/images/predios.jpg"
                        title="Vamos iniciar o seu projeto?"
                        subtitle="Estamos lhe esperando!"
                        linkUrl="/contato"
                        buttonText="Entre em contato"
                        position="center"
                    />
                </main>
                <Footer menuData={menu} />
            </div>
        </>
    );
};

export default ServicosPage;