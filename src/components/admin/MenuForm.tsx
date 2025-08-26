// src/components/admin/MenuForm.tsx

import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { FaTrash } from "react-icons/fa";
import { useSession } from "next-auth/react";

interface MenuLink {
  id: string;
  text: string;
  url: string;
  target?: string;
}

export default function MenuForm() {
  const { data: session, status } = useSession();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoUrl, setLogoUrl] = useState<string>("");
  const [links, setLinks] = useState<MenuLink[]>([]);
  const [newLinkText, setNewLinkText] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [newLinkTarget, setNewLinkTarget] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMenu = async () => {
      // Verifica se a sessão existe e o usuário é ADMIN
      if (session?.user?.role !== "ADMIN") return;

      try {
        const response = await fetch("/api/crud/menu");
        if (response.ok) {
          const data = await response.json();
          if (data) {
            setLogoUrl(data.logoUrl || "");
            setLinks(data.links || []);
          }
        }
      } catch (error) {
        console.error("Erro ao buscar dados do menu:", error);
      }
    };
    fetchMenu();
  }, [session, status]);

  const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogoFile(e.target.files[0]);
    }
  };

  const handleLinkAdd = (e: FormEvent) => {
    e.preventDefault();
    if (newLinkText && newLinkUrl) {
      setLinks((prevLinks) => [
        ...prevLinks,
        {
          id: String(Date.now()),
          text: newLinkText,
          url: newLinkUrl,
          target: newLinkTarget ? "_blank" : "_self",
        },
      ]);
      setNewLinkText("");
      setNewLinkUrl("");
      setNewLinkTarget(false);
    }
  };

  const handleLinkRemove = (idToRemove: string) => {
    setLinks((prevLinks) => prevLinks.filter((link) => link.id !== idToRemove));
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // A requisição de upload não precisa de autenticação se a API for configurada para isso
    let uploadedLogoUrl = logoUrl;
    if (logoFile) {
      const formData = new FormData();
      formData.append("file", logoFile);
      formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "");

      try {
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Erro no upload da logomarca.");
        }

        const data = await response.json();
        uploadedLogoUrl = data.url;
      } catch (error) {
        console.error(error);
        setMessage("Erro ao fazer upload da logomarca.");
        setLoading(false);
        return;
      }
    }

    try {
      if (!session || session.user?.role !== 'ADMIN') {
        setMessage("Acesso não autorizado.");
        setLoading(false);
        return;
      }

      const response = await fetch("/api/crud/menu", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ logoUrl: uploadedLogoUrl, links }),
      });

      if (!response.ok) {
        throw new Error("Erro ao salvar o menu.");
      }

      setMessage("Menu salvo com sucesso!");
    } catch (error) {
      console.error(error);
      setMessage("Erro ao salvar o menu.");
    } finally {
      setLoading(false);
    }
  };
  
  const isButtonDisabled = !session || session.user?.role !== "ADMIN" || loading;
  if (status === 'loading') return <p>Carregando...</p>;
  if (session?.user?.role !== 'ADMIN') return <p>Acesso não autorizado.</p>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4  ">Gerenciar Menu</h2>
      {message && (
        <p className={`mb-4 text-center ${message.includes("sucesso") ? "text-primary" : "text-primary"}`}>
          {message}
        </p>
      )}

      {/* Seção da Logomarca */}
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-2">Logomarca</h3>
        <label className="block text-gray-700 font-bold mb-2">
          Imagem da Logomarca
        </label>
        <input
          type="file"
          onChange={handleLogoChange}
          className="w-full text-gray-700 bg-white border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-primary"
        />
        {logoUrl && (
          <div className="mt-4">
            <p className="text-gray-600">Logomarca atual:</p>
            <img src={logoUrl} alt="Logomarca atual" className="h-16 w-auto mt-2" />
          </div>
        )}
      </div>

      {/* Seção de Links do Menu */}
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-2">Links do Menu</h3>
        <div className="space-y-4 mb-4">
          <form onSubmit={handleLinkAdd} className="p-4 border rounded-md">
            <div className="mb-2">
              <label htmlFor="link-text" className="block text-gray-700 font-bold mb-1">
                Texto do Link
              </label>
              <input
                id="link-text"
                type="text"
                value={newLinkText}
                onChange={(e) => setNewLinkText(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Ex: Sobre Nós"
              />
            </div>
            <div className="mb-2">
              <label htmlFor="link-url" className="block text-gray-700 font-bold mb-1">
                URL do Link
              </label>
              <input
                id="link-url"
                type="text"
                value={newLinkUrl}
                onChange={(e) => setNewLinkUrl(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Ex: /#sobre"
              />
            </div>
            <div className="mb-4">
              <label className="flex items-center text-gray-700 font-bold">
                <input
                  type="checkbox"
                  checked={newLinkTarget}
                  onChange={(e) => setNewLinkTarget(e.target.checked)}
                  className="mr-2"
                />
                Abrir em nova aba?
              </label>
            </div>
            <button
              type="submit"
              className="w-full bg-primary text-white p-2 rounded-md hover:bg-primary transition-colors"
            >
              Adicionar Link
            </button>
          </form>
        </div>

        {links.length > 0 && (
          <ul className="space-y-2">
            {links.map((link) => (
              <li
                key={link.id}
                className="flex items-center justify-between p-3 border rounded-md bg-gray-50"
              >
                <div>
                  <p className="font-semibold">{link.text}</p>
                  <p className="text-sm text-gray-500">{link.url}</p>
                  <p className="text-sm text-gray-500">Abre em: {link.target === "_blank" ? "Nova aba" : "Mesma aba"}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleLinkRemove(link.id)}
                  className="p-2 text-primary hover:bg-primary rounded-full"
                  aria-label={`Remover link ${link.text}`}
                >
                  <FaTrash />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        type="button"
        onClick={handleSave}
        className={`w-full p-3 text-white font-bold rounded-md ${isButtonDisabled ? "bg-gray-400 cursor-not-allowed" : "bg-primary hover:bg-primary"
          }`}
        disabled={isButtonDisabled}
      >
        {loading ? "Salvando..." : "Salvar Menu"}
      </button>
    </div>
  );
}