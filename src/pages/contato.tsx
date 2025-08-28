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
                <main className="flex-grow bg-gray-50"> {/* Overall light background for main content */}
                    <Breadcrumb />
                    
                    {/* Hero Section / Introduction */}
                    <div className="py-20 md:py-28 bg-white text-center shadow-sm">
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 px-4">
                            Entre em Contato Conosco
                        </h1>
                        <p className="max-w-3xl mx-auto text-lg md:text-xl text-gray-600 px-4">
                            Estamos aqui para transformar suas ideias em realidade. Preencha o formulário ou use nossos contatos diretos abaixo para dar o próximo passo no seu projeto.
                        </p>
                    </div>

                    {/* Contact Form Section */}
                    <div className="py-16 md:py-24 px-4 sm:px-6 lg:px-8">
                        {/* The ContactForm component will now have its own clean card styling */}
                        <ContactForm />
                    </div>

                    {/* Contact Details Section */}
                    <div className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gray-100"> {/* Slightly different background for visual separation */}
                        {/* The ContactSection component will now have its own clean card styling */}
                        <ContactSection />
                    </div>
                </main>
                <Footer menuData={menu} />
            </div>
        </>
    );
};

export default ContactPage;
