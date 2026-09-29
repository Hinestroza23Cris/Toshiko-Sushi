import Link from 'next/link';
import { Utensils, Calendar, MessageCircle } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Destello de fondo animado en tonos rojos característicos de la marca */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-red-600/15 rounded-full blur-3xl pointer-events-none animate-pulse"></div>

      <div className="z-10 max-w-md w-full text-center space-y-8">
        
        {/* Encabezado con animación de entrada */}
        <div className="space-y-3 animate-fade-in">
          <h1 className="text-4xl font-black tracking-wider text-red-500 drop-shadow-md">
            TOSHIKO SUSHI
          </h1>
          <p className="text-neutral-400 text-xs tracking-[0.25em] uppercase font-medium">
            Cocina Japonesa de Autor • Cali
          </p>
        </div>

        {/* Botones de navegación con efectos hover pro */}
        <div className="flex flex-col gap-4">
          
          <Link 
            href="/menu" 
            className="group flex items-center justify-center gap-3 bg-red-600 hover:bg-red-700 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-red-600/30"
          >
            <Utensils className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            Ver Menú Digital
          </Link>

          <Link 
            href="/reservas" 
            className="group flex items-center justify-center gap-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg transition-all duration-300 transform hover:-translate-y-1"
          >
            <Calendar className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform" />
            Reservar una Mesa
          </Link>

          <a 
            href="https://wa.me/573000000000?text=Hola,%20quiero%20hacer%20un%20pedido%20a%20domicilio%20desde%20la%20web" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="group flex items-center justify-center gap-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg transition-all duration-300 transform hover:-translate-y-1"
          >
            <MessageCircle className="w-5 h-5 text-green-500 group-hover:scale-110 transition-transform" />
            Pedir por WhatsApp
          </a>

        </div>

        <footer className="text-neutral-600 text-xs pt-4">
          © 2026 Toshiko Sushi. Todos los derechos reservados.
        </footer>

      </div>
    </main>
  );
}