'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { Lock, Plus, Trash2, Edit3, ArrowLeft, X, Image as ImageIcon, Upload, Loader2 } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

interface Product {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  imagen_url?: string;
  max_proteinas?: number;
}

export default function AdminPage() {
  const [autenticado, setAutenticado] = useState(false);
  const [password, setPassword] = useState('');
  const [errorPassword, setErrorPassword] = useState(false);

  const [productos, setProductos] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Formulario para crear / editar producto
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    categoria: 'Sushi',
    imagen_url: '',
    max_proteinas: '2'
  });

  const PASSWORD_ADMIN = 'toshiko2026';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === PASSWORD_ADMIN) {
      setAutenticado(true);
      setErrorPassword(false);
      fetchProductos();
    } else {
      setErrorPassword(true);
    }
  };

  const fetchProductos = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('productos').select('*').order('id', { ascending: true });
    if (error) console.error('Error:', error);
    else if (data) setProductos(data);
    setLoading(false);
  };

  // Función para subir la foto directamente desde la galería a Supabase Storage
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) return;
      
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      setUploadingImage(true);

      // Subir archivo al bucket 'productos'
      const { error: uploadError } = await supabase.storage
        .from('productos')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Obtener la URL pública del archivo subido
      const { data } = supabase.storage
        .from('productos')
        .getPublicUrl(filePath);

      setForm((prev) => ({ ...prev, imagen_url: data.publicUrl }));
    } catch (error: any) {
      alert('Error al subir la imagen. Asegúrate de haber creado el bucket "productos" como Público en Supabase.');
      console.error(error);
    } finally {
      setUploadingImage(false);
    }
  };

  const guardarProducto = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      nombre: form.nombre,
      descripcion: form.descripcion,
      precio: parseFloat(form.precio),
      categoria: form.categoria,
      imagen_url: form.imagen_url.trim() || null,
      max_proteinas: parseInt(form.max_proteinas) || 2
    };

    if (editandoId) {
      const { error } = await supabase.from('productos').update(payload).eq('id', editandoId);
      if (error) alert('Error al actualizar');
      else {
        setEditandoId(null);
        limpiarForm();
        fetchProductos();
      }
    } else {
      const { error } = await supabase.from('productos').insert([payload]);
      if (error) alert('Error al crear producto');
      else {
        limpiarForm();
        fetchProductos();
      }
    }
  };

  const cargarParaEditar = (prod: Product) => {
    setEditandoId(prod.id);
    setForm({
      nombre: prod.nombre,
      descripcion: prod.descripcion || '',
      precio: prod.precio.toString(),
      categoria: prod.categoria || 'Sushi',
      imagen_url: prod.imagen_url || '',
      max_proteinas: (prod.max_proteinas || 2).toString()
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const eliminarProducto = async (id: number) => {
    if (confirm('¿Estás seguro de eliminar este plato?')) {
      const { error } = await supabase.from('productos').delete().eq('id', id);
      if (error) alert('Error al eliminar');
      else fetchProductos();
    }
  };

  const limpiarForm = () => {
    setForm({
      nombre: '',
      descripcion: '',
      precio: '',
      categoria: 'Sushi',
      imagen_url: '',
      max_proteinas: '2'
    });
    setEditandoId(null);
  };

  if (!autenticado) {
    return (
      <main className="min-h-screen bg-[#000000] text-white p-4 flex items-center justify-center relative overflow-hidden font-sans">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#556B2F]/10 rounded-full blur-[140px] pointer-events-none"></div>

        <div className="w-full max-w-sm relative z-10 space-y-6">
          <div className="bg-neutral-900/40 border border-neutral-800 p-8 rounded-[32px] shadow-2xl backdrop-blur-2xl space-y-6">
            
            <div className="text-center space-y-1">
              <div className="w-12 h-12 bg-[#556B2F]/20 border border-[#556B2F]/40 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Lock className="w-5 h-5 text-[#8b9e69]" />
              </div>
              <h1 className="text-xl font-light tracking-[0.15em] uppercase text-white">Panel Admin</h1>
              <p className="text-xs text-[#8b9e69] tracking-widest uppercase">Toshiko Sushi</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-wider text-neutral-400 font-medium">Contraseña de acceso</label>
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-neutral-950/60 border border-neutral-800 rounded-2xl px-4 py-3 text-white text-sm focus:border-[#556B2F] focus:outline-none transition-all placeholder:text-neutral-600"
                />
                {errorPassword && (
                  <p className="text-[11px] text-red-400 mt-1">Contraseña incorrecta. Intenta de nuevo.</p>
                )}
              </div>

              <button 
                type="submit"
                className="w-full bg-[#556B2F] hover:bg-[#4a5f28] text-white font-medium py-3.5 rounded-2xl shadow-lg shadow-[#556B2F]/25 transition-all duration-300 text-xs tracking-wider uppercase"
              >
                Ingresar al Sistema
              </button>
            </form>

            <div className="pt-2 border-t border-neutral-800/80 text-center">
              <Link 
                href="/menu"
                className="inline-flex items-center gap-2 text-xs text-neutral-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Volver al menú digital</span>
              </Link>
            </div>

          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#000000] text-white p-4 md:p-8 font-sans relative pb-24">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#556B2F]/10 rounded-full blur-[140px]"></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10 space-y-8">
        
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <Link 
            href="/menu"
            className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors p-2.5 rounded-xl bg-neutral-900/40 border border-neutral-800 backdrop-blur-md"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Ver Menú</span>
          </Link>
          <div className="text-center">
            <h1 className="text-xl font-light tracking-[0.15em] uppercase text-white">Gestión de Productos</h1>
            <p className="text-xs text-[#8b9e69] tracking-widest uppercase">Admin Toshiko</p>
          </div>
          <button 
            onClick={() => setAutenticado(false)}
            className="text-xs text-neutral-400 hover:text-white p-2.5 rounded-xl bg-neutral-900/40 border border-neutral-800"
          >
            Salir
          </button>
        </div>

        {/* Formulario de Creación / Edición */}
        <div className="bg-neutral-900/40 border border-neutral-800 p-6 rounded-[32px] backdrop-blur-xl space-y-6 shadow-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#8b9e69]" />
              <span>{editandoId ? 'Editar Plato o Producto' : 'Añadir Nuevo Plato'}</span>
            </h2>
            {editandoId && (
              <button onClick={limpiarForm} className="text-xs text-neutral-400 hover:text-white flex items-center gap-1">
                <X className="w-3.5 h-3.5" /> Cancelar edición
              </button>
            )}
          </div>

          <form onSubmit={guardarProducto} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="space-y-1.5">
              <label className="text-[11px] text-neutral-400 uppercase tracking-wider">Nombre del Plato</label>
              <input 
                type="text" required
                value={form.nombre}
                onChange={e => setForm({...form, nombre: e.target.value})}
                placeholder="Ej. Roll Sake Special"
                className="w-full bg-neutral-950/60 border border-neutral-800 rounded-2xl px-4 py-3 text-sm focus:border-[#556B2F] focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] text-neutral-400 uppercase tracking-wider">Precio ($ COP)</label>
              <input 
                type="number" required
                value={form.precio}
                onChange={e => setForm({...form, precio: e.target.value})}
                placeholder="Ej. 28900"
                className="w-full bg-neutral-950/60 border border-neutral-800 rounded-2xl px-4 py-3 text-sm focus:border-[#556B2F] focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] text-neutral-400 uppercase tracking-wider">Categoría</label>
              <select 
                value={form.categoria}
                onChange={e => setForm({...form, categoria: e.target.value})}
                className="w-full bg-neutral-950/60 border border-neutral-800 rounded-2xl px-4 py-3 text-sm focus:border-[#556B2F] focus:outline-none cursor-pointer"
              >
                {['Promociones', 'Ceviches', 'Sushi', 'Burger', 'Hand Roll', 'Gohan', 'Bebidas', 'Entradas'].map(cat => (
                  <option key={cat} value={cat} className="bg-neutral-900 text-white">{cat}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] text-neutral-400 uppercase tracking-wider">Máx. Proteínas (Opcional)</label>
              <input 
                type="number" 
                value={form.max_proteinas}
                onChange={e => setForm({...form, max_proteinas: e.target.value})}
                placeholder="2"
                className="w-full bg-neutral-950/60 border border-neutral-800 rounded-2xl px-4 py-3 text-sm focus:border-[#556B2F] focus:outline-none"
              />
            </div>

            {/* SECCIÓN MEJORADA DE IMAGEN: Subida desde galería + Vista previa */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-[11px] text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-[#8b9e69]" />
                <span>Foto del Plato</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                
                {/* Botón táctil para seleccionar foto de la Galería */}
                <label className="sm:col-span-2 relative flex items-center justify-center gap-2 p-4 border border-dashed border-neutral-700 hover:border-[#556B2F] rounded-2xl bg-neutral-950/40 cursor-pointer transition-colors group">
                  {uploadingImage ? (
                    <div className="flex items-center gap-2 text-xs text-[#8b9e69]">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Subiendo foto a Supabase...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-neutral-300 group-hover:text-white">
                      <Upload className="w-4 h-4 text-[#8b9e69]" />
                      <span>Seleccionar foto desde la Galería</span>
                    </div>
                  )}
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="hidden" 
                  />
                </label>

                {/* Vista previa de la imagen cargada */}
                {form.imagen_url ? (
                  <div className="relative w-full h-20 rounded-2xl overflow-hidden border border-neutral-700 bg-neutral-950 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={form.imagen_url} alt="Previsualización" className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => setForm(f => ({ ...f, imagen_url: '' }))}
                      className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-black rounded-full text-white"
                      title="Quitar foto"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="w-full h-20 rounded-2xl border border-neutral-800 bg-neutral-950/30 flex flex-col items-center justify-center text-[11px] text-neutral-600">
                    <span>Sin foto</span>
                  </div>
                )}

              </div>
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-[11px] text-neutral-400 uppercase tracking-wider">Descripción corta</label>
              <textarea 
                rows={2}
                value={form.descripcion}
                onChange={e => setForm({...form, descripcion: e.target.value})}
                placeholder="Ingredientes, acompañamientos..."
                className="w-full bg-neutral-950/60 border border-neutral-800 rounded-2xl px-4 py-3 text-sm focus:border-[#556B2F] focus:outline-none resize-none"
              />
            </div>

            <div className="md:col-span-2">
              <button 
                type="submit"
                disabled={uploadingImage}
                className="w-full py-3.5 rounded-2xl bg-[#556B2F] hover:bg-[#4a5f28] disabled:opacity-50 text-white font-medium text-xs tracking-wider uppercase transition-all shadow-lg shadow-[#556B2F]/30"
              >
                {editandoId ? 'Guardar Cambios del Plato' : 'Añadir al Menú'}
              </button>
            </div>

          </form>
        </div>

        {/* Listado de Productos Existentes */}
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-white tracking-wider uppercase">Platos Registrados ({productos.length})</h2>
          
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-2 border-[#556B2F] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : productos.length === 0 ? (
            <p className="text-neutral-500 text-xs">No hay productos en la base de datos.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {productos.map(prod => (
                <div key={prod.id} className="flex justify-between items-center p-4 rounded-3xl bg-neutral-900/40 border border-neutral-800 backdrop-blur-xl">
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    {prod.imagen_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={prod.imagen_url} alt={prod.nombre} className="w-12 h-12 rounded-xl object-cover shrink-0 border border-neutral-800" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-neutral-800/50 flex items-center justify-center shrink-0 border border-neutral-800 text-neutral-600">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                    )}
                    <div className="space-y-0.5 min-w-0">
                      <span className="text-[10px] text-[#8b9e69] uppercase font-bold tracking-wider">{prod.categoria}</span>
                      <h3 className="text-sm font-semibold text-white truncate">{prod.nombre}</h3>
                      <p className="text-xs text-neutral-400">${prod.precio.toLocaleString('es-CO')}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button 
                      onClick={() => cargarParaEditar(prod)}
                      className="p-2 rounded-xl bg-neutral-800/60 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700/50 transition-colors"
                      title="Editar plato e imagen"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => eliminarProducto(prod.id)}
                      className="p-2 rounded-xl bg-red-950/30 hover:bg-red-900/50 text-red-400 border border-red-900/40 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}