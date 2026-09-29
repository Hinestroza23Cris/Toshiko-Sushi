import Link from 'next/link';
import Image from 'next/image';
import { Utensils, Calendar, ChevronRight, Settings, MapPin, Clock } from 'lucide-react';

// Íconos SVG puros creados para evitar los errores ts(2305) de lucide-react
const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 15.66a6.34 6.34 0 0 0 10.86 4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

// Datos de ubicación
const DIRECCION = 'Av 6a Norte #17-71';
const CIUDAD = 'Cali, Colombia';
const DIRECCION_COMPLETA = `${DIRECCION}, ${CIUDAD}`;
const MAPA_EMBED_URL = `https://www.google.com/maps?q=${encodeURIComponent(DIRECCION_COMPLETA)}&output=embed`;
const RUTA_URL = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(DIRECCION_COMPLETA)}`;

export default function Home() {
  return (
    <main className="min-h-screen bg-[#000000] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">

      {/* Acceso discreto al panel de administración */}
      <Link
        href="/admin"
        aria-label="Administración del menú"
        title="Administración"
        className="absolute top-5 right-5 z-20 p-2 rounded-full text-neutral-700 hover:text-neutral-300 hover:bg-neutral-900/60 hover:rotate-90 transition-all duration-500"
      >
        <Settings className="w-4 h-4" />
      </Link>

      {/* Luz ambiental estilo Apple - Verde Oliva suave (Fiel al manual de marca) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#556B2F]/15 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="z-10 w-full max-w-sm flex flex-col gap-8">

        {/* Logo Oficial en Vectorial (SVG) de Alta Definición */}
        <div className="flex justify-center items-center mb-2">
          <div className="relative w-40 h-40 flex items-center justify-center">
            <Image
              src="/logo.svg"
              alt="Toshiko Sushi Logo"
              fill
              className="object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-700 ease-out"
              priority
            />
          </div>
        </div>

        {/* Tarjetas interactivas estilo iOS */}
        <div className="flex flex-col gap-4">

          <Link
            href="/menu"
            className="group relative flex items-center justify-between p-5 rounded-3xl bg-neutral-900/40 border border-neutral-800 backdrop-blur-xl hover:bg-neutral-800/60 transition-all duration-500 ease-out hover:scale-[1.02] hover:border-[#556B2F]/50 overflow-hidden"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-[#556B2F]/20 transition-colors duration-500">
                <Utensils className="w-6 h-6 text-neutral-300 group-hover:text-[#8b9e69] transition-colors" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">Menú Digital</h2>
                <p className="text-xs text-[#8b9e69] mt-0.5">Explora y haz tu pedido aquí</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-neutral-600 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
          </Link>

          <Link
            href="/reservas"
            className="group relative flex items-center justify-between p-5 rounded-3xl bg-neutral-900/40 border border-neutral-800 backdrop-blur-xl hover:bg-neutral-800/60 transition-all duration-500 ease-out hover:scale-[1.02] hover:border-[#556B2F]/50 overflow-hidden"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-[#556B2F]/20 transition-colors duration-500">
                <Calendar className="w-6 h-6 text-neutral-300 group-hover:text-[#8b9e69] transition-colors" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">Reservar Mesa</h2>
                <p className="text-xs text-neutral-400 mt-0.5">Asegura tu lugar</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-neutral-600 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
          </Link>

        </div>

        {/* Ubicación y mapa */}
        <section className="rounded-3xl bg-neutral-900/40 border border-neutral-800 backdrop-blur-xl p-5 space-y-5">
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <MapPin className="w-5 h-5 text-[#8b9e69] mt-0.5 shrink-0" />
              <div>
                <h2 className="text-sm font-semibold text-white">{DIRECCION}</h2>
                <p className="text-xs text-neutral-400 mt-0.5">{CIUDAD}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Clock className="w-5 h-5 text-[#8b9e69] mt-0.5 shrink-0" />
              <div>
                <h2 className="text-sm font-semibold text-white">Todos los días</h2>
                <p className="text-xs text-neutral-400 mt-0.5">12:00 m. – 10:00 p.m.</p>
              </div>
            </div>
          </div>

          {/* Mapa oscuro (el filtro convierte el mapa claro de Google en modo oscuro) */}
          <div className="relative h-48 overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
            <iframe
              title="Ubicación de Toshiko Sushi en Cali"
              src={MAPA_EMBED_URL}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full border-0"
              style={{ filter: 'invert(90%) hue-rotate(180deg) contrast(0.9)' }}
            />
          </div>

          <a
            href={RUTA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center py-3 rounded-2xl bg-neutral-900/60 border border-neutral-800 text-xs font-semibold text-[#8b9e69] hover:bg-[#556B2F]/20 hover:border-[#556B2F]/50 transition-all duration-300"
          >
            Abrir ruta en Google Maps
          </a>
        </section>

        {/* Redes Sociales en forma de botones flotantes sutiles */}
        <div className="flex justify-center items-center gap-6 mt-4">
          <a href="https://instagram.com/toshikosushi" target="_blank" rel="noopener noreferrer" className="p-3 bg-neutral-900/40 rounded-full border border-neutral-800 text-neutral-400 hover:text-[#8b9e69] hover:border-[#556B2F]/50 hover:bg-neutral-800/80 hover:-translate-y-1 transition-all duration-300">
            <InstagramIcon className="w-5 h-5" />
          </a>
          <a href="https://tiktok.com/@Toshikosushi" target="_blank" rel="noopener noreferrer" className="p-3 bg-neutral-900/40 rounded-full border border-neutral-800 text-neutral-400 hover:text-[#8b9e69] hover:border-[#556B2F]/50 hover:bg-neutral-800/80 hover:-translate-y-1 transition-all duration-300">
            <TikTokIcon className="w-5 h-5" />
          </a>
          <a href="https://facebook.com/toshikosushi" target="_blank" rel="noopener noreferrer" className="p-3 bg-neutral-900/40 rounded-full border border-neutral-800 text-neutral-400 hover:text-[#8b9e69] hover:border-[#556B2F]/50 hover:bg-neutral-800/80 hover:-translate-y-1 transition-all duration-300">
            <FacebookIcon className="w-5 h-5" />
          </a>
        </div>

        <footer className="text-center text-neutral-600 text-xs mt-2">
          © {new Date().getFullYear()} Toshiko Sushi
        </footer>

      </div>
    </main>
  );
}