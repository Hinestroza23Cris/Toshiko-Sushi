'use client';

import Link from 'next/link';
import { Utensils, Calendar, Lock } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#000000] text-white flex flex-col items-center justify-between p-6 md:p-12 relative overflow-hidden font-sans">
      
      {/* Aura ambiental verde oliva estilo Apple */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] md:w-[900px] md:h-[900px] bg-[#556B2F]/15 rounded-full blur-[160px] pointer-events-none"></div>

      {/* Botón superior derecho para el Panel Admin */}
      <div className="w-full max-w-md flex justify-end relative z-10">
        <Link 
          href="/admin" 
          className="p-3 rounded-2xl bg-neutral-900/40 border border-neutral-800 backdrop-blur-xl text-neutral-400 hover:text-white transition-all hover:border-[#556B2F]/50 group"
          title="Panel de Administración"
        >
          <Lock className="w-4 h-4 group-hover:text-[#8b9e69] transition-colors" />
        </Link>
      </div>

      {/* Contenido Central */}
      <div className="w-full max-w-md my-auto text-center space-y-8 relative z-10">
        
        {/* Logotipo / Identidad visual */}
        <div className="space-y-3">
          <div className="w-24 h-24 mx-auto rounded-[32px] bg-neutral-900/60 border border-neutral-800 backdrop-blur-2xl flex items-center justify-center shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-[#556B2F]/10 group-hover:bg-[#556B2F]/25 transition-colors"></div>
            <Utensils className="w-8 h-8 text-[#8b9e69] relative z-10" />
          </div>
          
          <div className="space-y-1">
            <h1 className="text-3xl font-light tracking-[0.2em] uppercase text-white">Toshiko Sushi</h1>
            <p className="text-xs text-[#8b9e69] tracking-[0.25em] uppercase font-medium">Sushi & Fusion Bar</p>
          </div>
        </div>

        {/* Botones de Acción Principales */}
        <div className="space-y-3 pt-2">
          <Link 
            href="/menu" 
            className="w-full py-4 px-6 rounded-2xl bg-[#556B2F] hover:bg-[#4a5f28] text-white font-medium text-xs tracking-[0.15em] uppercase transition-all duration-300 shadow-xl shadow-[#556B2F]/25 flex items-center justify-center gap-2 group"
          >
            <Utensils className="w-4 h-4" />
            <span>Ver Menú Digital</span>
          </Link>

          <Link 
            href="/reservas" 
            className="w-full py-4 px-6 rounded-2xl bg-neutral-900/60 hover:bg-neutral-800/80 text-white font-medium text-xs tracking-[0.15em] uppercase transition-all duration-300 border border-neutral-800 hover:border-neutral-700 backdrop-blur-xl flex items-center justify-center gap-2"
          >
            <Calendar className="w-4 h-4 text-[#8b9e69]" />
            <span>Reservar una Mesa</span>
          </Link>
        </div>

      </div>

      {/* Footer con Redes Sociales (TikTok oficial actualizado) */}
      <div className="w-full max-w-md pt-6 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10 text-xs text-neutral-500">
        <p>© 2026 Toshiko Sushi</p>
        
        <div className="flex items-center gap-3">
          {/* Enlace oficial de TikTok con SVG nativo */}
          <a 
            href="https://www.tiktok.com/@toshiko.sushi?is_from_webapp=1&sender_device=pc" 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-2.5 rounded-xl bg-neutral-900/40 border border-neutral-800 hover:border-[#556B2F]/50 text-neutral-400 hover:text-white transition-all flex items-center gap-2"
            aria-label="TikTok Oficial"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3.2 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
            </svg>
            <span className="text-[11px]">TikTok</span>
          </a>
        </div>
      </div>

    </main>
  );
}