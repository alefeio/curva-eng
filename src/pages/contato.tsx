import React from 'react';
import ContactSection from '../components/ContactSection';
import Head from 'next/head';
import Breadcrumb from '../components/Breadcrumb';
import Footer from '../components/Footer';
import { Analytics } from '@vercel/analytics/next';
import { PrismaClient } from '@prisma/client';
import { LinkItem, MenuData } from '../types';
import { GetServerSideProps } from 'next';
import { MenuInterno } from 'components/MenuInterno';
import ContactForm from 'components/ContactForm';

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
                    <ContactForm />
                    <ContactSection />
                </main>
                <Footer menuData={menu} />
            </div>
        </>
    );
};

export default ContactPage;
