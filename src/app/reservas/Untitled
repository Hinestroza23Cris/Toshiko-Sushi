'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send } from 'lucide-react';

export default function ReservasPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    nombre: '',
    fecha: '',
    hora: '',
    personas: '2',
    observaciones: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Reemplaza este número por el WhatsApp real del negocio (código de país + número)
    const telefonoRestaurante = '573000000000'; 
    
    const mensaje = `Hola, quiero solicitar una reserva en Toshiko Sushi:%0A%0A*👤 Nombre:* ${form.nombre}%0A*📅 Fecha:* ${form.fecha}%0A*⏰ Hora:* ${form.hora}%0A*👥 Personas:* ${form.personas}%0A*📝 Notas:* ${form.observaciones || 'Ninguna'}`;
    
    window.open(`https://wa.me/${telefonoRestaurante}?text=${mensaje}`, '_blank');
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-white p-6 max-w-lg mx-auto flex flex-col justify-center">
      
      <button 
        onClick={() => router.back()} 
        className="flex items-center gap-2 text-neutral-400 hover:text-white mb-6 transition-colors text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4" /> Volver al inicio
      </button>

      <div className="bg-neutral-900/90 border border-neutral-800 p-6 md:p-8 rounded-3xl shadow-2xl backdrop-blur-md">
        <h2 className="text-2xl font-black text-red-500 mb-1">Reserva tu Mesa</h2>
        <p className="text-neutral-400 text-sm mb-6">Completa los datos y te conectaremos directo a WhatsApp para confirmar.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-1.5 font-semibold">Nombre completo</label>
            <input 
              type="text" 
              required 
              value={form.nombre} 
              onChange={e => setForm({...form, nombre: e.target.value})} 
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white text-sm focus:border-red-500 focus:outline-none transition-colors" 
              placeholder="Ej. Laura Gómez" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-1.5 font-semibold">Fecha</label>
              <input 
                type="date" 
                required 
                value={form.fecha} 
                onChange={e => setForm({...form, fecha: e.target.value})} 
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white text-sm focus:border-red-500 focus:outline-none transition-colors" 
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-1.5 font-semibold">Hora</label>
              <input 
                type="time" 
                required 
                value={form.hora} 
                onChange={e => setForm({...form, hora: e.target.value})} 
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white text-sm focus:border-red-500 focus:outline-none transition-colors" 
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-1.5 font-semibold">Número de Personas</label>
            <select 
              value={form.personas} 
              onChange={e => setForm({...form, personas: e.target.value})} 
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white text-sm focus:border-red-500 focus:outline-none transition-colors"
            >
              {[1,2,3,4,5,6,7,8,9,10, '10+'].map(n => (
                <option key={n} value={n}>{n} {n === 1 ? 'Persona' : 'Personas'}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-1.5 font-semibold">Observaciones (Opcional)</label>
            <textarea 
              value={form.observaciones} 
              onChange={e => setForm({...form, observaciones: e.target.value})} 
              rows={2} 
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white text-sm focus:border-red-500 focus:outline-none transition-colors resize-none" 
              placeholder="Alergias, ocasión especial, etc." 
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-4 rounded-xl shadow-lg shadow-red-600/20 transition-all duration-300 flex items-center justify-center gap-2 mt-4 text-sm"
          >
            <Send className="w-4 h-4" /> Enviar Reserva por WhatsApp
          </button>

        </form>
      </div>
    </main>
  );
}