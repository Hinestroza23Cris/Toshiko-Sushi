'use client';

import { useState } from 'react';
import { supabase } from '../lib/supabase';

const CATEGORIAS = [
  'Entradas',
  'Fusión',
  'Special Rolls',
  'California Roll',
  'Hot Rolls',
  'Oriental',
  'Osomaki',
  'Sushi Burgers',
  'Ceviches',
  'Gohan',
  'Hand Roll',
  'Promociones & Combos',
  'Bebidas'
];

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [productos, setProductos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filtroCategoria, setFiltroCategoria] = useState('TODAS');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState('Special Rolls');
  const [precio, setPrecio] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [permiteProteina, setPermiteProteina] = useState(false);
  const [maxProteinas, setMaxProteinas] = useState(1);
  const [imagenFile, setImagenFile] = useState<File | null>(null);
  const [imagenUrlActual, setImagenUrlActual] = useState('');

  const ADMIN_PIN = '2026';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
      setIsAuthenticated(true);
      fetchProductos();
    } else {
      alert('PIN incorrecto, mano.');
    }
  };

  const fetchProductos = async () => {
    setLoading(true);
    const { data } = await supabase.from('productos').select('*').order('categoria', { ascending: true });
    setProductos(data || []);
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !precio) return alert('El nombre y el precio son obligatorios.');

    setLoading(true);
    let finalImageUrl = imagenUrlActual;

    if (imagenFile) {
      const fileName = `${Date.now()}-${imagenFile.name}`;
      const { error: uploadError } = await supabase.storage.from('menu-images').upload(fileName, imagenFile);
      if (uploadError) {
        alert('Error al subir imagen al Storage: ' + uploadError.message);
        setLoading(false);
        return;
      }
      const { data: publicURLData } = supabase.storage.from('menu-images').getPublicUrl(fileName);
      finalImageUrl = publicURLData.publicUrl;
    }

    const payload = {
      nombre,
      categoria,
      precio: Number(precio),
      descripcion,
      permite_proteina: permiteProteina,
      max_proteinas: permiteProteina ? Number(maxProteinas) : 1,
      imagen_url: finalImageUrl,
    };

    if (editingId) {
      const { error } = await supabase.from('productos').update(payload).eq('id', editingId);
      if (error) alert('Error al actualizar: ' + error.message);
      else alert('¡Plato actualizado con éxito!');
    } else {
      const { error } = await supabase.from('productos').insert([payload]);
      if (error) alert('Error al crear: ' + error.message);
      else alert('¡Plato creado con éxito!');
    }

    resetForm();
    fetchProductos();
    setLoading(false);
  };

  const handleEdit = (prod: any) => {
    setEditingId(prod.id);
    setNombre(prod.nombre);
    setCategoria(prod.categoria || 'Special Rolls');
    setPrecio(prod.precio);
    setDescripcion(prod.descripcion || '');
    setPermiteProteina(prod.permite_proteina || false);
    setMaxProteinas(prod.max_proteinas || 1);
    setImagenUrlActual(prod.imagen_url || '');
    setImagenFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Seguro que deseas eliminar este plato?')) return;
    const { error } = await supabase.from('productos').delete().eq('id', id);
    if (error) alert('Error al eliminar: ' + error.message);
    else fetchProductos();
  };

  const resetForm = () => {
    setEditingId(null);
    setNombre('');
    setPrecio('');
    setDescripcion('');
    setPermiteProteina(false);
    setMaxProteinas(1);
    setImagenFile(null);
    setImagenUrlActual('');
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-[#141210] border border-[#262626] p-6 rounded-2xl w-full max-w-sm text-center">
          <h1 className="font-serif-display text-2xl mb-2 text-[#C5A059]">Admin Toshiko</h1>
          <p className="text-xs text-white/50 mb-4">Panel exclusivo para Sindy</p>
          <input type="password" placeholder="PIN de acceso" value={pin} onChange={(e) => setPin(e.target.value)} className="w-full bg-[#1F1D1A] border border-[#333] text-white px-4 py-3 rounded-xl mb-4 text-center outline-none" autoFocus />
          <button type="submit" className="w-full bg-[#B6D98C] text-[#0A0A0A] font-bold py-3 rounded-xl">Ingresar al Panel</button>
        </form>
      </main>
    );
  }

  const productosFiltrados = filtroCategoria === 'TODAS' 
    ? productos 
    : productos.filter(p => p.categoria?.toLowerCase() === filtroCategoria.toLowerCase());

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white p-4 pb-20 max-w-3xl mx-auto">
      <header className="flex items-center justify-between border-b border-[#222] pb-4 mb-6 pt-4">
        <div>
          <h1 className="font-serif-display text-2xl text-[#C5A059]">Panel de Gestión</h1>
          <p className="text-xs text-white/50">Control de platos y precios</p>
        </div>
        <button onClick={() => setIsAuthenticated(false)} className="text-xs text-red-400 border border-red-500/30 px-3 py-1.5 rounded-full">Cerrar sesión</button>
      </header>

      {/* FORMULARIO */}
      <form onSubmit={handleSave} className="bg-[#141210] border border-[#262626] p-5 rounded-2xl mb-8">
        <h2 className="text-sm font-bold uppercase tracking-wider mb-4 text-[#C5A059]">{editingId ? '✏️ Editar Plato' : '➕ Agregar Nuevo Plato'}</h2>
        <div className="flex flex-col gap-3">
          <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre del plato *" className="w-full bg-[#1F1D1A] border border-[#333] px-3.5 py-2.5 rounded-xl text-sm outline-none" required />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className="w-full bg-[#1F1D1A] border border-[#333] px-3.5 py-2.5 rounded-xl text-sm outline-none">
              {CATEGORIAS.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <input type="number" value={precio} onChange={(e) => setPrecio(e.target.value)} placeholder="Precio en COP *" className="w-full bg-[#1F1D1A] border border-[#333] px-3.5 py-2.5 rounded-xl text-sm outline-none" required />
          </div>

          <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Descripción corta (ingredientes...)" rows={2} className="w-full bg-[#1F1D1A] border border-[#333] px-3.5 py-2.5 rounded-xl text-sm outline-none" />

          {/* OPCIÓN DE PROTEÍNAS */}
          <div className="flex flex-col gap-2 p-3 rounded-xl bg-[#1F1D1A]/50 border border-[#333]">
            <div className="flex items-center gap-2">
              <input type="checkbox" id="permite_prot" checked={permiteProteina} onChange={(e) => setPermiteProteina(e.target.checked)} className="w-4 h-4 accent-[#C5A059]" />
              <label htmlFor="permite_prot" className="text-xs text-white/90 cursor-pointer font-semibold">¿Este plato permite elegir proteínas?</label>
            </div>
            
            {permiteProteina && (
              <div className="flex items-center justify-between pt-2 border-t border-[#333]">
                <span className="text-xs text-white/70">Cantidad máxima de proteínas a elegir:</span>
                <select value={maxProteinas} onChange={(e) => setMaxProteinas(Number(e.target.value))} className="bg-[#141210] border border-[#444] text-[#C5A059] font-bold text-xs px-3 py-1.5 rounded-lg outline-none">
                  <option value={1}>1 Proteína</option>
                  <option value={2}>2 Proteínas</option>
                  <option value={3}>3 Proteínas</option>
                  <option value={4}>4 Proteínas</option>
                  <option value={5}>5 Proteínas</option>
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="text-xs text-white/60 mb-1 block">Foto del plato</label>
            <input type="file" accept="image/*" onChange={(e) => setImagenFile(e.target.files ? e.target.files[0] : null)} className="w-full text-xs text-white/50 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-[#262626] file:text-white cursor-pointer" />
          </div>

          <div className="flex gap-2 mt-2">
            <button type="submit" disabled={loading} className="flex-1 bg-[#B6D98C] text-[#0A0A0A] font-bold py-3 rounded-xl text-sm">{loading ? 'Guardando...' : editingId ? 'Actualizar Plato' : 'Guardar Plato'}</button>
            {editingId && <button type="button" onClick={resetForm} className="bg-[#262626] text-white/70 px-4 py-3 rounded-xl text-sm">Cancelar</button>}
          </div>
        </div>
      </form>

      {/* FILTRO DE CATEGORÍAS PARA EL INVENTARIO */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#C5A059]">Inventario ({productosFiltrados.length})</h3>
        <select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)} className="bg-[#141210] border border-[#333] text-xs text-white px-3 py-1.5 rounded-xl outline-none">
          <option value="TODAS">📁 Ver Todas las Categorías</option>
          {CATEGORIAS.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>

      {loading && <p className="text-xs text-white/50">Cargando inventario...</p>}

      {/* LISTA DE PLATOS */}
      <div className="flex flex-col gap-2.5">
        {productosFiltrados.map((prod) => (
          <div key={prod.id} className="bg-[#141210] border border-[#222] p-3.5 rounded-xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 overflow-hidden">
              {prod.imagen_url ? <img src={prod.imagen_url} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" /> : <div className="w-12 h-12 rounded-lg bg-[#1F1D1A] flex items-center justify-center text-[10px] text-white/30 flex-shrink-0">Sin foto</div>}
              <div className="overflow-hidden">
                <p className="text-sm font-bold truncate">{prod.nombre}</p>
                <p className="text-[11px] text-[#C5A059]">{prod.categoria} • ${prod.precio?.toLocaleString('es-CO')}</p>
                {prod.permite_proteina && <p className="text-[10px] text-white/50">Permite hasta {prod.max_proteinas || 1} proteínas</p>}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={() => handleEdit(prod)} className="bg-[#222] hover:bg-[#333] px-3 py-1.5 rounded-lg text-xs font-semibold">Editar</button>
              <button onClick={() => handleDelete(prod.id)} className="bg-red-500/10 text-red-400 hover:bg-red-500/20 px-3 py-1.5 rounded-lg text-xs font-semibold">Borrar</button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}