import React from 'react';
import ContactSection from '../components/ContactSection';
import Head from 'next/head';
import Breadcrumb from '../components/Breadcrumb';
import Footer from '../components/Footer';
import { Analytics } from '@vercel/analytics/next';
import { PrismaClient } from '@prisma/client';
import { LinkItem, MenuData } from '../types';
import { GetServerSideProps } from 'next';
import ContactForm from '../components/ContactForm';
import { MenuInterno } from 'components/MenuInterno';

const prisma = new PrismaClient();

interface ContactPageProps {
    menu: MenuData | null;
}

export const getServerSideProps: GetServerSideProps<ContactPageProps> = async () => {
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

const ContactPage: React.FC<ContactPageProps> = ({ menu }) => {
    return (
        <>
            <Head>
                <title>Contato - Curva Engenharia e Arquitetura</title>
                <meta name="description" content="Entre em contato com a Curva Engenharia e Arquitetura para agendar uma consulta, obter um orçamento ou saber mais sobre nossos serviços." />
            </Head>

            <div className="min-h-screen flex flex-col">
                <Analytics />
                <MenuInterno menuData={menu} />
                <main className="flex-grow">
                    <Breadcrumb />
                    <div className="text-center bg-white pt-16 md:pt-24 pb-2">
                        <h1 className="text-4xl md:text-5xl font-bold text-orange-500 mb-4">Contato</h1>
                        <p className="max-w-4xl mx-auto text-lg md:text-xl text-gray-600 max-w-xs md:max-w-5xl">
                            Agradecemos sua visita. Estamos aqui para ajudar você a transformar suas ideias em projetos de engenharia e arquitetura com excelência e inovação. Sinta-se à vontade para entrar em contato.
                        </p>
                    </div>
                    <ContactForm />
                    <ContactSection />
                </main>
                <Footer menuData={menu} />
            </div>
        </>
    );
};

export default ContactPage;
