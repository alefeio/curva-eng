import Link from "next/link";
import { ReactNode } from "react";
import { signOut } from "next-auth/react";
import {
  MdDashboard,
  MdMenu,
  MdPhotoLibrary,
  MdViewCarousel,
  MdReviews,
  MdHelpOutline,
  MdLogout,
  MdPalette, // Adicionando um ícone para Coleções
} from 'react-icons/md';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      {/* Sidebar de Navegação */}
      <aside className="w-64 z-30 shadow-lg p-6 bg-white dark:bg-gray-800 transition-colors duration-300">
        <h2 className="text-2xl font-bold mb-8 text-gray-900 dark:text-white">Painel Admin</h2>
        
        <nav className="space-y-6">
          {/* Grupo 1: Conteúdo da Landing Page */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
              Conteúdo da LP
            </h3>
            <ul className="space-y-1 list-none">
              <li>
                <Link href="/admin" className="text-gray-900 dark:text-white flex items-center p-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 group">
                  <MdDashboard className="mr-3 text-xl text-gray-500 group-hover:text-blue-500 transition-colors" />
                  <span className="text-sm font-medium">Dashboard</span>
                </Link>
              </li>
              <li>
                <Link href="/admin/menu" className="text-gray-900 dark:text-white flex items-center p-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 group">
                  <MdMenu className="mr-3 text-xl text-gray-500 group-hover:text-blue-500 transition-colors" />
                  <span className="text-sm font-medium">Menu</span>
                </Link>
              </li>
              <li>
                <Link href="/admin/banner" className="text-gray-900 dark:text-white flex items-center p-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 group">
                  <MdViewCarousel className="mr-3 text-xl text-gray-500 group-hover:text-blue-500 transition-colors" />
                  <span className="text-sm font-medium">Banner</span>
                </Link>
              </li>
              <li>
                <Link href="/admin/homepage" className="text-gray-900 dark:text-white flex items-center p-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 group">
                  <MdPhotoLibrary className="mr-3 text-xl text-gray-500 group-hover:text-blue-500 transition-colors" />
                  <span className="text-sm font-medium">Homepage</span>
                </Link>
              </li>
              <li>
                <Link href="/admin/testimonials" className="text-gray-900 dark:text-white flex items-center p-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 group">
                  <MdReviews className="mr-3 text-xl text-gray-500 group-hover:text-blue-500 transition-colors" />
                  <span className="text-sm font-medium">Depoimentos</span>
                </Link>
              </li>
              <li>
                <Link href="/admin/faq" className="text-gray-900 dark:text-white flex items-center p-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 group">
                  <MdHelpOutline className="mr-3 text-xl text-gray-500 group-hover:text-blue-500 transition-colors" />
                  <span className="text-sm font-medium">FAQ</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Grupo 2: Catálogo */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
              Catálogo
            </h3>
            <ul className="space-y-1 list-none">
              <li>
                <Link href="/admin/colecoes" className="text-gray-900 dark:text-white flex items-center p-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 group">
                  <MdPalette className="mr-3 text-xl text-gray-500 group-hover:text-blue-500 transition-colors" />
                  <span className="text-sm font-medium">Coleções</span>
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Grupo 3: Autenticação */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
              Conta
            </h3>
            <ul className="space-y-1 list-none">
              <li>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="w-full text-left flex items-center p-3 rounded-lg text-red-500 hover:bg-red-100 dark:hover:bg-red-900 transition-colors duration-200"
                >
                  <MdLogout className="mr-3 text-xl" />
                  <span className="text-sm font-medium">Sair</span>
                </button>
              </li>
            </ul>
          </div>
        </nav>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 p-8 bg-gray-100 dark:bg-gray-900">
        {children}
      </main>
    </div>
  );
}