import { useState, useEffect } from "react";
import Head from "next/head";
import { MdAddPhotoAlternate, MdDelete, MdEdit } from 'react-icons/md';
import AdminLayout from "components/admin/AdminLayout";

// Definições de tipo
interface ProjetoFoto {
  id?: string;
  local: string;
  tipo: string;
  detalhes: string;
  img: string | File;
}

interface Projeto {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  order: number;
  items: ProjetoFoto[];
}

interface FormState {
  id?: string;
  title: string;
  subtitle: string;
  description: string;
  order: number;
  items: ProjetoFoto[];
}

export default function AdminProjetos() {
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [form, setForm] = useState<FormState>({
    title: "",
    subtitle: "",
    description: "",
    order: 0,
    items: [{
      local: "",
      tipo: "",
      detalhes: "",
      img: ""
    }],
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProjetos();
  }, []);

  const fetchProjetos = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/crud/projetos", { method: "GET" });
      const data = await res.json();
      if (res.ok && data.success) {
        // Ordena os projetos pelo campo 'order'
        const sortedProjetos = data.projetos.sort((a: Projeto, b: Projeto) => a.order - b.order);
        setProjetos(sortedProjetos);
      } else {
        setError(data.message || "Erro ao carregar projetos.");
      }
    } catch (e) {
      setError("Erro ao conectar com a API.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      title: "",
      subtitle: "",
      description: "",
      order: 0,
      items: [{
        local: "",
        tipo: "",
        detalhes: "",
        img: ""
      }],
    });
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "order") {
        setForm({ ...form, [name]: parseInt(value, 10) || 0 });
    } else {
        setForm({ ...form, [name]: value });
    }
  };

  const handleItemChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index: number) => {
    const { name, value } = e.target;
    const newItems = [...form.items];
  
    // Verifica se o elemento é um input e se tem arquivos
    if (name === "img" && e.target instanceof HTMLInputElement && e.target.files) {
      newItems[index] = { ...newItems[index], [name]: e.target.files[0] };
    } else {
      newItems[index] = { ...newItems[index], [name]: value };
    }
    
    setForm({ ...form, items: newItems });
  };
  
  const handleAddItem = () => {
    setForm({
      ...form,
      items: [...form.items, { local: "", tipo: "", detalhes: "", img: "" }],
    });
  };

  const handleRemoveItem = (index: number) => {
    const newItems = form.items.filter((_, i) => i !== index);
    setForm({ ...form, items: newItems });
  };

  const handleEdit = (projeto: Projeto) => {
    setForm({
      id: projeto.id,
      title: projeto.title,
      subtitle: projeto.subtitle || "",
      description: projeto.description || "",
      order: projeto.order || 0,
      items: projeto.items.map(item => ({
        ...item, 
        img: item.img as string,
        local: item.local || '',
        tipo: item.tipo || '',
        detalhes: item.detalhes || '',
      }))
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
  
    try {
      const itemsWithUrls = await Promise.all(
        form.items.map(async (item) => {
          if (item.img instanceof File) {
            const formData = new FormData();
            formData.append("file", item.img);
            const uploadRes = await fetch("/api/upload", {
              method: "POST",
              body: formData,
            });
            const uploadData = await uploadRes.json();
            if (!uploadRes.ok) {
              throw new Error(uploadData.message || "Erro no upload da imagem via API.");
            }
            return { ...item, img: uploadData.url };
          }
          return item;
        })
      );
  
      const method = form.id ? "PUT" : "POST";
      const body = { 
        ...form, 
        items: itemsWithUrls
      };
      
      const res = await fetch("/api/crud/projetos", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
  
      const data = await res.json();
      if (res.ok && data.success) {
        alert(`Projeto ${form.id ? 'atualizado' : 'criado'} com sucesso!`);
        resetForm();
        fetchProjetos();
      } else {
        setError(data.message || `Erro ao ${form.id ? 'atualizar' : 'criar'} projeto.`);
      }
    } catch (e: any) {
      setError(e.message || "Erro ao conectar com a API ou no upload da imagem.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async (id: string, isItem = false) => {
    if (!confirm(`Tem certeza que deseja excluir ${isItem ? "esta foto" : "este projeto"}?`)) return;

    try {
      const res = await fetch("/api/crud/projetos", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isItem }),
      });
      if (res.ok) {
        alert(`${isItem ? "Foto" : "Projeto"} excluído com sucesso!`);
        fetchProjetos();
      } else {
        const data = await res.json();
        setError(data.message || "Erro ao excluir.");
      }
    } catch (e) {
      setError("Erro ao conectar com a API.");
    }
  };

  return (
    <>
      <Head>
        <title>Admin - Projetos</title>
      </Head>
      <AdminLayout>
        <main className="container mx-auto p-6 lg:p-12 mt-20">
          <h1 className="text-4xl font-extrabold mb-8 text-gray-800">Gerenciar Projetos</h1>
          
          {/* Formulário de Criação/Edição */}
          <section className="bg-white p-8 rounded-xl shadow-lg mb-10 border border-gray-200">
            <h2 className="text-2xl font-bold mb-6 text-gray-700">{form.id ? "Editar Projeto" : "Adicionar Novo Projeto"}</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <input type="text" name="title" value={form.title} onChange={handleFormChange} placeholder="Título do Projeto" required className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition duration-200 text-gray-900" />
              <input type="text" name="subtitle" value={form.subtitle} onChange={handleFormChange} placeholder="Subtítulo do Projeto" className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition duration-200 text-gray-900" />
              <textarea name="description" value={form.description} onChange={handleFormChange} placeholder="Descrição completa do Projeto" className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition duration-200 text-gray-900" />
              <input type="number" name="order" value={form.order} onChange={handleFormChange} placeholder="Ordem de exibição" required className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition duration-200 text-gray-900" />
              
              <h3 className="text-xl font-bold mt-6 text-gray-700">Fotos do Projeto</h3>
              {form.items.map((item, index) => (
                <div key={index} className="flex flex-col md:flex-row gap-4 p-4 border border-dashed border-gray-300 rounded-lg relative">
                  <button type="button" onClick={() => handleRemoveItem(index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700 transition duration-200">
                    <MdDelete size={24} />
                  </button>
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" name="local" value={item.local} onChange={(e) => handleItemChange(e, index)} placeholder="Localização (Ex: Belém/PA)" required className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition duration-200 text-gray-900" />
                    <input type="text" name="tipo" value={item.tipo} onChange={(e) => handleItemChange(e, index)} placeholder="Tipo (Ex: Residencial)" required className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition duration-200 text-gray-900" />
                    <textarea name="detalhes" value={item.detalhes} onChange={(e) => handleItemChange(e, index)} placeholder="Detalhes da foto" className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition duration-200 text-gray-900 col-span-1 md:col-span-2" />
                  </div>
                  
                  <div className="flex-1 w-full flex flex-col items-center gap-2 border border-gray-300 rounded-lg p-3">
                    {typeof item.img === 'string' && item.img && (
                      <div className="w-full flex justify-center mb-2">
                        <img src={item.img} alt="Visualização da foto" className="w-24 h-24 object-cover rounded-lg" />
                      </div>
                    )}
                    <label htmlFor={`img-${index}`} className="w-full flex-1 text-gray-500 cursor-pointer flex items-center justify-center gap-2 font-semibold hover:bg-gray-100 transition duration-200 p-2 rounded-lg">
                      <MdAddPhotoAlternate size={24} />
                      {item.img instanceof File ? item.img.name : "Escolher arquivo..."}
                    </label>
                    <input 
                      type="file" 
                      name="img" 
                      id={`img-${index}`} 
                      onChange={(e) => handleItemChange(e, index)} 
                      required={!item.img || item.img instanceof File}
                      className="hidden" 
                    />
                  </div>
                </div>
              ))}
              <button type="button" onClick={handleAddItem} className="bg-gray-200 text-gray-800 p-3 rounded-lg mt-2 flex items-center justify-center gap-2 font-semibold hover:bg-gray-300 transition duration-200">
                <MdAddPhotoAlternate size={24} /> Adicionar Nova Foto
              </button>
              
              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <button type="submit" disabled={loading} className="bg-orange-500 text-white p-4 rounded-lg flex-1 font-bold shadow-md hover:bg-orange-600 transition duration-200 disabled:bg-gray-400">
                  {loading ? (form.id ? "Atualizando..." : "Salvando...") : (form.id ? "Atualizar Projeto" : "Salvar Projeto")}
                </button>
                {form.id && (
                  <button type="button" onClick={resetForm} className="bg-gray-300 text-gray-800 p-4 rounded-lg flex-1 font-bold shadow-md hover:bg-gray-400 transition duration-200">
                    Cancelar Edição
                  </button>
                )}
              </div>
            </form>
            {error && <p className="text-red-500 mt-4 font-medium">{error}</p>}
          </section>

          {/* Lista de Projetos */}
          <section className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
            <h2 className="text-2xl font-bold mb-6 text-gray-700">Projetos Existentes</h2>
            {loading ? (
              <p className="text-gray-600">Carregando...</p>
            ) : projetos.length === 0 ? (
              <p className="text-gray-600">Nenhum projeto encontrado.</p>
            ) : (
              projetos.map((projeto) => (
                <div key={projeto.id} className="bg-gray-50 p-6 rounded-xl shadow-sm mb-4 border border-gray-200">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800">{projeto.title}</h3>
                      <p className="text-sm text-gray-500">{projeto.subtitle}</p>
                    </div>
                    <div className="flex gap-2 mt-4 md:mt-0">
                      <button onClick={() => handleEdit(projeto)} className="bg-gray-200 text-gray-700 p-2 rounded-lg hover:bg-gray-300 transition duration-200">
                        <MdEdit size={20} />
                      </button>
                      <button onClick={() => handleDelete(projeto.id)} className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition duration-200">
                        <MdDelete size={20} />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {projeto.items.map((item) => (
                      <div key={item.id} className="flex gap-4 items-center bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <img src={item.img as string} alt={item.detalhes} className="w-20 h-20 object-cover rounded-lg" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800">{item.local}</h4>
                          <p className="text-xs text-gray-500 mt-1">
                            Tipo: {item.tipo}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {item.detalhes}
                          </p>
                        </div>
                        <button onClick={() => handleDelete(item.id as string, true)} className="bg-red-500 text-white p-2 rounded-lg text-sm hover:bg-red-600 transition duration-200">Excluir</button>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </section>
        </main>
      </AdminLayout>
    </>
  );
}