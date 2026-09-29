'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, MessageCircle, Calendar, Clock, Users, User, MessageSquare, ShieldCheck } from 'lucide-react';

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
    const telefonoRestaurante = '573239448629';
    
    const mensaje = `Hola Toshiko Sushi 👋, quiero solicitar una reserva:%0A%0A*👤 Nombre:* ${form.nombre}%0A*📅 Fecha:* ${form.fecha}%0A*⏰ Hora:* ${form.hora}%0A*👥 Personas:* ${form.personas}%0A*📝 Notas:* ${form.observaciones || 'Ninguna'}`;
    
    window.open(`https://wa.me/${telefonoRestaurante}?text=${mensaje}`, '_blank');
  };

  return (
    <main className="min-h-screen bg-[#000000] text-white p-4 md:p-8 flex flex-col justify-center relative overflow-hidden font-sans">
      
      {/* Aura ambiental verde oliva */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#556B2F]/10 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="max-w-md mx-auto w-full relative z-10 space-y-6">
        
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors p-2.5 rounded-2xl bg-neutral-900/40 border border-neutral-800 backdrop-blur-xl w-fit"
        >
          <ChevronLeft className="w-4 h-4" /> 
          <span>Volver al inicio</span>
        </button>

        <div className="bg-neutral-900/40 border border-neutral-800 p-6 md:p-8 rounded-[32px] shadow-2xl backdrop-blur-2xl space-y-6">
          
          <div className="space-y-1 text-center">
            <h2 className="text-2xl font-light tracking-[0.15em] uppercase text-white">Reserva tu Mesa</h2>
            <p className="text-xs text-[#8b9e69] tracking-widest uppercase">Toshiko Sushi</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider text-neutral-400 font-medium flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#8b9e69]" />
                <span>Nombre completo</span>
              </label>
              <input 
                type="text" 
                required 
                value={form.nombre} 
                onChange={e => setForm({...form, nombre: e.target.value})} 
                className="w-full bg-neutral-950/60 border border-neutral-800 rounded-2xl px-4 py-3 text-white text-sm focus:border-[#556B2F] focus:outline-none transition-all placeholder:text-neutral-600" 
                placeholder="Ej. Laura Gómez" 
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-wider text-neutral-400 font-medium flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#8b9e69]" />
                  <span>Fecha</span>
                </label>
                <div className="relative flex items-center">
                  <input 
                    type="text" 
                    required 
                    value={form.fecha} 
                    onChange={e => setForm({...form, fecha: e.target.value})} 
                    placeholder="Ej. Viernes"
                    className="w-full bg-neutral-950/60 border border-neutral-800 rounded-2xl pl-4 pr-10 py-3 text-white text-sm focus:border-[#556B2F] focus:outline-none transition-all placeholder:text-neutral-600" 
                  />
                  <input 
                    type="date" 
                    onChange={e => {
                      if (e.target.value) setForm({...form, fecha: e.target.value});
                    }}
                    className="absolute right-3 opacity-0 w-6 h-6 cursor-pointer [color-scheme:dark]"
                    title="Seleccionar fecha"
                  />
                  <Calendar className="absolute right-3 w-4 h-4 text-neutral-400 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-wider text-neutral-400 font-medium flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#8b9e69]" />
                  <span>Hora</span>
                </label>
                <div className="relative flex items-center">
                  <input 
                    type="text" 
                    required 
                    value={form.hora} 
                    onChange={e => setForm({...form, hora: e.target.value})} 
                    placeholder="Ej. 8:00 PM"
                    className="w-full bg-neutral-950/60 border border-neutral-800 rounded-2xl pl-4 pr-10 py-3 text-white text-sm focus:border-[#556B2F] focus:outline-none transition-all placeholder:text-neutral-600" 
                  />
                  <input 
                    type="time" 
                    onChange={e => {
                      if (e.target.value) setForm({...form, hora: e.target.value});
                    }}
                    className="absolute right-3 opacity-0 w-6 h-6 cursor-pointer [color-scheme:dark]"
                    title="Seleccionar hora"
                  />
                  <Clock className="absolute right-3 w-4 h-4 text-neutral-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider text-neutral-400 font-medium flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#8b9e69]" />
                <span>Número de Personas</span>
              </label>
              <select 
                value={form.personas} 
                onChange={e => setForm({...form, personas: e.target.value})} 
                className="w-full bg-neutral-950/60 border border-neutral-800 rounded-2xl px-4 py-3 text-white text-sm focus:border-[#556B2F] focus:outline-none transition-all cursor-pointer"
              >
                {[1,2,3,4,5,6,7,8,9,10, '10+'].map(n => (
                  <option key={n} value={n} className="bg-neutral-900 text-white">
                    {n} {n === 1 ? 'Persona' : 'Personas'}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider text-neutral-400 font-medium flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-[#8b9e69]" />
                <span>Observaciones (Opcional)</span>
              </label>
              <textarea 
                value={form.observaciones} 
                onChange={e => setForm({...form, observaciones: e.target.value})} 
                rows={2} 
                className="w-full bg-neutral-950/60 border border-neutral-800 rounded-2xl px-4 py-3 text-white text-sm focus:border-[#556B2F] focus:outline-none transition-all resize-none placeholder:text-neutral-600" 
                placeholder="Alergias, ocasión especial, etc." 
              />
            </div>

            <button 
              type="submit" 
              className="w-full bg-[#556B2F] hover:bg-[#4a5f28] text-white font-medium py-3.5 rounded-2xl shadow-lg shadow-[#556B2F]/25 transition-all duration-300 flex items-center justify-center gap-2 mt-2 text-xs tracking-wider uppercase"
            >
              <MessageCircle className="w-4 h-4" /> 
              <span>Confirmar reserva por WhatsApp</span>
            </button>

          </form>

          {/* Aviso Legal Sutil de Privacidad */}
          <div className="pt-2 border-t border-neutral-800/80 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-[#8b9e69] shrink-0 mt-0.5" />
            <p className="text-[10px] text-neutral-500 leading-relaxed">
              Al enviar tu solicitud, autorizas el uso de tus datos exclusivamente para la gestión y confirmación de tu reserva en Toshiko Sushi.
            </p>
          </div>

        </div>

      </div>
    </main>
  );
}