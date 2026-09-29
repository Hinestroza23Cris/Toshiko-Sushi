'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ShoppingBag, Plus, Minus, X, Check, Store, Bike, Camera } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

/* ─────────────────────────── TIPOS ─────────────────────────── */

interface Product {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  imagen_url?: string;
  max_proteinas?: number | null;
}

interface ReglaProteina {
  opciones: string[];
  requeridas?: number;
  cantidades?: { n: number; extra: number }[];
  tamanos?: { label: string; extra: number }[];
}

interface CartItem {
  cartId: string;
  id: number;
  nombre: string;
  precioUnitario: number;
  cantidad: number;
  proteinas: string[];
  tamano?: string;
}

/* ───────────────── LISTA MAESTRA DE PROTEÍNAS (MENÚ TOSHIKO) ───────────────── */

const PROTEINAS_GENERALES = [
  'Pollo teriyaki',
  'Carne',
  'Cangrejo furai',
  'Choclito',
  'Pollo furai',
  'Cerdo furai',
  'Cerdo',
  'Pasta dinamita',
  'Champiñón furai',
  'Champiñón',
  'Palmito',
  'Camarón',
  'Salmón',
  'Atún',
  'Pescado furai',
  'Pulpo',
  'Cangrejo',
  'Atún furai',
  'Calamar',
  'Calamar furai',
  'Pulpo furai',
  'Pescado blanco',
  'Camarón furai',
  'Salmón furai',
];

const EXTRA_CEVICHE_GRANDE: Record<number, number> = { 2: 7000, 3: 2000, 5: 10000 };

/* ─────────────────────── DETECCIÓN DE REGLAS ─────────────────────── */

const norm = (s?: string | null) =>
  (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const formatear = (n: number) => `$${n.toLocaleString('es-CO')}`;

const ORDEN_MENU: string[][] = [
  ['entrada', 'tartar', 'sashimi', 'papa'],
  ['sushi', 'fusion', 'special', 'california', 'hot', 'oriental', 'osomaki'],
  ['burger', 'hand roll'],
  ['ceviche', 'gohan'],
  ['promo', 'combo', 'kids'],
  ['jugo', 'limonada', 'gaseosa', 'bebida'],
];

const posicionMenu = (cat: string) => {
  const c = norm(cat);
  const i = ORDEN_MENU.findIndex((grupo) => grupo.some((k) => c.includes(k)));
  return i === -1 ? ORDEN_MENU.length : i;
};

function FotoProducto({ url, alt }: { url?: string | null; alt: string }) {
  const [fallo, setFallo] = useState(false);
  const mostrar = !!url && !fallo;

  return (
    <div className="relative shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-[22px] overflow-hidden bg-gradient-to-br from-neutral-800/70 to-neutral-900 ring-1 ring-inset ring-white/[0.08]">
      {mostrar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url as string}
          alt={alt}
          loading="lazy"
          onError={() => setFallo(true)}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-neutral-600">
          <Camera className="w-5 h-5" strokeWidth={1.25} />
        </div>
      )}
    </div>
  );
}

function obtenerRegla(prod: Product): ReglaProteina | null {
  const nombre = norm(prod.nombre);
  let regla: ReglaProteina | null = null;

  if (nombre.includes('hand roll') && !nombre.includes('kids')) {
    regla = {
      opciones: PROTEINAS_GENERALES,
      requeridas: 1,
    };
  } else if (nombre.includes('burger')) {
    if (/2\s*prot/.test(nombre)) regla = { opciones: PROTEINAS_GENERALES, requeridas: 2 };
    else if (/1\s*prot/.test(nombre)) regla = { opciones: PROTEINAS_GENERALES, requeridas: 1 };
    else
      regla = {
        opciones: PROTEINAS_GENERALES,
        cantidades: [{ n: 1, extra: 0 }, { n: 2, extra: 6000 }],
      };
  } else if (nombre.includes('ceviche') && (nombre.includes('mixto') || /[235]\s*prot/.test(nombre))) {
    const n = nombre.includes('mixto') || /5\s*prot/.test(nombre) ? 5 : /3\s*prot/.test(nombre) ? 3 : 2;
    const yaTieneTamano = /peq|gde|grande/.test(nombre);
    regla = {
      opciones: PROTEINAS_GENERALES,
      requeridas: n,
      tamanos: yaTieneTamano
        ? undefined
        : [{ label: 'Pequeño', extra: 0 }, { label: 'Grande', extra: EXTRA_CEVICHE_GRANDE[n] || 0 }],
    };
  } else if (nombre.includes('gohan')) {
    if (nombre.includes('especial') || /\b2\s*p\b|2\s*prot/.test(nombre)) {
      regla = { opciones: PROTEINAS_GENERALES, requeridas: 2 };
    } else if (/\b1\s*p\b|1\s*prot/.test(nombre)) {
      regla = { opciones: PROTEINAS_GENERALES, requeridas: 1 };
    } else {
      regla = {
        opciones: PROTEINAS_GENERALES,
        cantidades: [{ n: 1, extra: 0 }, { n: 2, extra: 2000 }],
      };
    }
  } else if (nombre.includes('combo') && /30\s*piezas/.test(nombre)) {
    regla = { opciones: PROTEINAS_GENERALES, requeridas: 3 };
  }

  return regla;
}

/* ─────────────────────────── COMPONENTE ─────────────────────────── */

export default function MenuPage() {
  const [productos, setProductos] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoriaActiva, setCategoriaActiva] = useState('Todos');

  const [modal, setModal] = useState<{ prod: Product; regla: ReglaProteina } | null>(null);
  const [seleccion, setSeleccion] = useState<string[]>([]);
  const [nElegido, setNElegido] = useState(1);
  const [tamanoIdx, setTamanoIdx] = useState(0);

  const [carrito, setCarrito] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [tipoEntrega, setTipoEntrega] = useState<'recogida' | 'domicilio'>('domicilio');
  const [notas, setNotas] = useState('');

  const botonesCategoria = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    async function fetchProductos() {
      const { data, error } = await supabase.from('productos').select('*').order('id', { ascending: true });
      if (error) {
        console.error('Error cargando menú:', error);
      } else if (data) {
        setProductos(data);
      }
      setLoading(false);
    }
    fetchProductos();
  }, []);

  useEffect(() => {
    document.body.style.overflow = modal || isCartOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [modal, isCartOpen]);

  const categorias = useMemo(() => {
    const enBD = Array.from(new Set(productos.map((p) => p.categoria || 'General')));
    const ordenadas = [...enBD].sort((a, b) => posicionMenu(a) - posicionMenu(b));
    return ['Todos', ...ordenadas];
  }, [productos]);

  const productosAgrupados = useMemo(
    () =>
      productos.reduce((acc, prod) => {
        const cat = prod.categoria || 'General';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(prod);
        return acc;
      }, {} as Record<string, Product[]>),
    [productos]
  );

  const seleccionarCategoria = (cat: string) => {
    setCategoriaActiva(cat);
    botonesCategoria.current[cat]?.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    });
  };

  const abrirModal = (prod: Product, regla: ReglaProteina) => {
    setModal({ prod, regla });
    setSeleccion([]);
    setNElegido(regla.requeridas ?? regla.cantidades?.[0]?.n ?? 1);
    setTamanoIdx(0);
  };

  const cerrarModal = () => {
    setModal(null);
    setSeleccion([]);
  };

  const requeridas = modal ? modal.regla.requeridas ?? nElegido : 0;

  const extraModal = modal
    ? (modal.regla.cantidades?.find((c) => c.n === nElegido)?.extra ?? 0) +
      (modal.regla.tamanos?.[tamanoIdx]?.extra ?? 0)
    : 0;

  const precioModal = modal ? modal.prod.precio + extraModal : 0;

  const cambiarCantidadProteinas = (n: number) => {
    setNElegido(n);
    setSeleccion((prev) => prev.slice(0, n));
  };

  const toggleProteina = (opcion: string) => {
    setSeleccion((prev) => {
      if (prev.includes(opcion)) return prev.filter((p) => p !== opcion);
      if (requeridas === 1) return [opcion];
      if (prev.length >= requeridas) return prev;
      return [...prev, opcion];
    });
  };

  const confirmarModal = () => {
    if (!modal || seleccion.length !== requeridas) return;
    agregarAlCarrito(modal.prod, {
      proteinas: [...seleccion].sort((a, b) => a.localeCompare(b, 'es')),
      tamano: modal.regla.tamanos?.[tamanoIdx]?.label,
      precioUnitario: precioModal,
    });
    cerrarModal();
  };

  const agregarAlCarrito = (
    prod: Product,
    opts?: { proteinas: string[]; tamano?: string; precioUnitario: number }
  ) => {
    const proteinas = opts?.proteinas ?? [];
    const tamano = opts?.tamano;
    const cartId = [prod.id, proteinas.join('-'), tamano ?? ''].join('|');

    setCarrito((prev) => {
      const existe = prev.find((item) => item.cartId === cartId);
      if (existe) {
        return prev.map((item) =>
          item.cartId === cartId ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      }
      return [
        ...prev,
        {
          cartId,
          id: prod.id,
          nombre: prod.nombre,
          precioUnitario: opts?.precioUnitario ?? prod.precio,
          cantidad: 1,
          proteinas,
          tamano,
        },
      ];
    });
  };

  const manejarAnadir = (prod: Product) => {
    const regla = obtenerRegla(prod);
    if (regla) abrirModal(prod, regla);
    else agregarAlCarrito(prod);
  };

  const cambiarCantidad = (cartId: string, delta: number) => {
    setCarrito((prev) =>
      prev
        .map((item) =>
          item.cartId === cartId ? { ...item, cantidad: item.cantidad + delta } : item
        )
        .filter((item) => item.cantidad > 0)
    );
  };

  const totalCarrito = carrito.reduce((sum, item) => sum + item.precioUnitario * item.cantidad, 0);
  const totalItems = carrito.reduce((acc, i) => acc + i.cantidad, 0);

  const enviarPedidoWhatsApp = () => {
    const telefono = '573239448629';
    const lineas: string[] = ['Hola Toshiko Sushi 👋, quiero realizar el siguiente pedido desde la web:', ''];

    carrito.forEach((item, index) => {
      let linea = `${index + 1}. *${item.nombre}* x${item.cantidad}`;
      if (item.tamano) linea += ` [${item.tamano}]`;
      if (item.proteinas.length > 0) linea += ` (Prot: ${item.proteinas.join(', ')})`;
      linea += ` - ${formatear(item.precioUnitario * item.cantidad)}`;
      lineas.push(linea);
    });

    lineas.push('');
    lineas.push(
      `*Tipo de entrega:* ${
        tipoEntrega === 'recogida' ? 'Recogida en el local (Av 6a norte #17-71)' : 'Envío a domicilio'
      }`
    );
    if (notas.trim()) lineas.push(`*Notas:* ${notas.trim()}`);
    lineas.push(`*Total a pagar:* ${formatear(totalCarrito)}`);
    lineas.push('');
    lineas.push('¿Me confirman para proceder?');

    window.open(`https://wa.me/${telefono}?text=${encodeURIComponent(lineas.join('\n'))}`, '_blank');
  };

  const renderCardProducto = (prod: Product) => {
    const regla = obtenerRegla(prod);
    const pista = regla
      ? regla.requeridas
        ? `Elige ${regla.requeridas} ${regla.requeridas === 1 ? 'proteína' : 'proteínas'}`
        : `Elige ${regla.cantidades?.map((c) => c.n).join(' o ')} proteínas`
      : null;

    return (
      <div
        key={prod.id}
        className="group flex flex-col justify-between gap-4 p-4 rounded-[28px] bg-neutral-900/50 border border-white/[0.06] backdrop-blur-xl hover:bg-neutral-800/50 hover:border-[#556B2F]/40 transition-all duration-500 ease-out"
      >
        <div className="flex gap-4">
          <div className="flex-1 min-w-0 space-y-1.5">
            <h3 className="text-[15px] font-semibold leading-snug text-white group-hover:text-[#8b9e69] transition-colors">
              {prod.nombre}
            </h3>
            <p className="text-xs text-neutral-400 line-clamp-3 leading-relaxed">
              {prod.descripcion || 'Especialidad de la casa preparada al instante.'}
            </p>
            {pista && <p className="text-[11px] text-[#8b9e69]">{pista}</p>}
          </div>
          <FotoProducto url={prod.imagen_url} alt={prod.nombre} />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-[#8b9e69]">{formatear(prod.precio)}</span>
          <button
            onClick={() => manejarAnadir(prod)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/5 hover:bg-[#556B2F]/25 text-xs font-medium text-white border border-white/10 hover:border-[#556B2F]/50 transition-all duration-300"
          >
            <Plus className="w-3.5 h-3.5 text-[#8b9e69]" />
            <span>{regla ? 'Elegir' : 'Añadir'}</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-[#000000] text-white pb-24 font-sans relative">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#556B2F]/10 rounded-full blur-[140px]"></div>
      </div>

      <div className="sticky top-0 z-40 bg-black/85 backdrop-blur-xl border-b border-neutral-800">
        <div className="max-w-4xl mx-auto px-4 md:px-8 pt-4 pb-3 space-y-3">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors p-2 rounded-xl bg-neutral-900/40 border border-neutral-800"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Volver</span>
            </Link>
            <div className="text-center">
              <h1 className="text-xl font-light tracking-[0.15em] uppercase text-white">Menú Digital</h1>
              <p className="text-xs text-[#8b9e69] tracking-widest uppercase">Toshiko Sushi</p>
            </div>
            <button
              onClick={() => setIsCartOpen(true)}
              aria-label="Abrir carrito"
              className="relative p-2.5 rounded-xl bg-neutral-900/60 border border-neutral-800 text-neutral-300 hover:text-white transition-all"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#8b9e69] text-black text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
          </div>

          <div className="relative">
            <div className="flex gap-2 overflow-x-auto scroll-smooth pb-1 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {categorias.map((cat) => (
                <button
                  key={cat}
                  ref={(el) => {
                    botonesCategoria.current[cat] = el;
                  }}
                  onClick={() => seleccionarCategoria(cat)}
                  className={`shrink-0 px-5 py-2.5 rounded-full text-xs font-medium tracking-wide whitespace-nowrap transition-all duration-300 ${
                    categoriaActiva === cat
                      ? 'bg-[#556B2F] text-white shadow-lg shadow-[#556B2F]/20'
                      : 'bg-neutral-900/50 text-neutral-400 border border-neutral-800 hover:border-neutral-700 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-black to-transparent"></div>
            <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-black to-transparent"></div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10 p-4 md:p-8 space-y-8">
        {loading ? (
          <div className="flex justify-center items-center py-32">
            <div className="w-8 h-8 border-2 border-[#556B2F] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : categoriaActiva === 'Todos' ? (
          <div className="space-y-10">
            {categorias.slice(1).map((catName) => (
              <div key={catName} className="space-y-4">
                <h2 className="text-lg font-medium text-[#8b9e69] tracking-wider uppercase border-b border-neutral-800/80 pb-2">
                  {catName}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(productosAgrupados[catName] || []).map(renderCardProducto)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(productosAgrupados[categoriaActiva] || []).map(renderCardProducto)}
          </div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4">
          <div className="w-full max-w-md max-h-[92vh] flex flex-col bg-neutral-900 border border-neutral-800 rounded-t-3xl sm:rounded-3xl animate-in fade-in zoom-in-95 duration-300">
            <div className="flex justify-between items-start p-6 pb-4 shrink-0">
              <div>
                <h3 className="text-base font-semibold text-white">Elige tus proteínas</h3>
                <p className="text-[11px] text-[#8b9e69] mt-0.5">
                  {requeridas === 1
                    ? 'Selecciona 1 proteína'
                    : `Selecciona exactamente ${requeridas} proteínas`}
                </p>
              </div>
              <button onClick={cerrarModal} aria-label="Cerrar" className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-4">
              <p className="text-xs text-neutral-400">
                Plato: <span className="text-white font-medium">{modal.prod.nombre}</span>
              </p>

              {modal.regla.cantidades && (
                <div className="space-y-2">
                  <p className="text-[11px] text-neutral-500 uppercase tracking-wider">Cantidad de proteínas</p>
                  <div className="grid grid-cols-2 gap-2">
                    {modal.regla.cantidades.map((c) => (
                      <button
                        key={c.n}
                        onClick={() => cambiarCantidadProteinas(c.n)}
                        className={`py-2.5 rounded-2xl text-xs font-medium transition-all ${
                          nElegido === c.n
                            ? 'bg-[#556B2F]/20 border border-[#556B2F] text-white'
                            : 'bg-neutral-800/40 border border-neutral-800 text-neutral-400 hover:bg-neutral-800'
                        }`}
                      >
                        {c.n} {c.n === 1 ? 'proteína' : 'proteínas'}
                        {c.extra > 0 && <span className="text-[#8b9e69]"> · +{formatear(c.extra)}</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {modal.regla.tamanos && (
                <div className="space-y-2">
                  <p className="text-[11px] text-neutral-500 uppercase tracking-wider">Tamaño</p>
                  <div className="grid grid-cols-2 gap-2">
                    {modal.regla.tamanos.map((t, i) => (
                      <button
                        key={t.label}
                        onClick={() => setTamanoIdx(i)}
                        className={`py-2.5 rounded-2xl text-xs font-medium transition-all ${
                          tamanoIdx === i
                            ? 'bg-[#556B2F]/20 border border-[#556B2F] text-white'
                            : 'bg-neutral-800/40 border border-neutral-800 text-neutral-400 hover:bg-neutral-800'
                        }`}
                      >
                        {t.label}
                        {t.extra > 0 && <span className="text-[#8b9e69]"> · +{formatear(t.extra)}</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-[11px] text-neutral-500 uppercase tracking-wider">Proteínas disponibles</p>
                  <p className="text-[11px] text-[#8b9e69]">
                    {seleccion.length}/{requeridas}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {modal.regla.opciones.map((opt) => {
                    const seleccionada = seleccion.includes(opt);
                    const bloqueada = !seleccionada && requeridas > 1 && seleccion.length >= requeridas;
                    return (
                      <button
                        key={opt}
                        onClick={() => toggleProteina(opt)}
                        disabled={bloqueada}
                        className={`flex items-center justify-between gap-2 p-3 rounded-2xl text-xs font-medium text-left transition-all ${
                          seleccionada
                            ? 'bg-[#556B2F]/20 border border-[#556B2F] text-white'
                            : 'bg-neutral-800/40 border border-neutral-800 text-neutral-400 hover:bg-neutral-800'
                        } ${bloqueada ? 'opacity-30 cursor-not-allowed' : ''}`}
                      >
                        <span>{opt}</span>
                        {seleccionada && <Check className="w-4 h-4 text-[#8b9e69] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-6 pt-3 shrink-0 border-t border-neutral-800">
              <button
                onClick={confirmarModal}
                disabled={seleccion.length !== requeridas}
                className="w-full py-3 rounded-2xl bg-[#556B2F] hover:bg-[#4a5f28] disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium text-xs tracking-wider uppercase transition-all shadow-lg shadow-[#556B2F]/30"
              >
                {seleccion.length === requeridas
                  ? `Añadir al carrito · ${formatear(precioModal)}`
                  : `Faltan ${requeridas - seleccion.length} por elegir`}
              </button>
            </div>
          </div>
        </div>
      )}

      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-[#0a0a0a] border-l border-neutral-800 h-full flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center border-b border-neutral-800 p-6 pb-4 shrink-0">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#8b9e69]" />
                <span>Tu carrito</span>
              </h2>
              <button onClick={() => setIsCartOpen(false)} aria-label="Cerrar carrito" className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-xs text-neutral-400 uppercase tracking-wider">Método de entrega</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setTipoEntrega('domicilio')}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      tipoEntrega === 'domicilio'
                        ? 'bg-[#556B2F]/20 border border-[#556B2F] text-white'
                        : 'bg-neutral-900 border border-neutral-800 text-neutral-400'
                    }`}
                  >
                    <Bike className="w-4 h-4 text-[#8b9e69]" />
                    <span>Domicilio</span>
                  </button>
                  <button
                    onClick={() => setTipoEntrega('recogida')}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      tipoEntrega === 'recogida'
                        ? 'bg-[#556B2F]/20 border border-[#556B2F] text-white'
                        : 'bg-neutral-900 border border-neutral-800 text-neutral-400'
                    }`}
                  >
                    <Store className="w-4 h-4 text-[#8b9e69]" />
                    <span>Recoger en local</span>
                  </button>
                </div>
              </div>

              {carrito.length === 0 ? (
                <div className="text-center py-16 text-neutral-500 text-xs">
                  Tu carrito está vacío. Explora el menú y añade algo delicioso.
                </div>
              ) : (
                <div className="space-y-3">
                  {carrito.map((item) => (
                    <div
                      key={item.cartId}
                      className="flex justify-between items-center gap-3 p-3 rounded-2xl bg-neutral-900/60 border border-neutral-800"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <h4 className="text-xs font-medium text-white">{item.nombre}</h4>
                        {item.tamano && <p className="text-[10px] text-[#8b9e69]">Tamaño: {item.tamano}</p>}
                        {item.proteinas.length > 0 && (
                          <p className="text-[10px] text-[#8b9e69]">Prot: {item.proteinas.join(', ')}</p>
                        )}
                        <p className="text-xs text-neutral-400">{formatear(item.precioUnitario * item.cantidad)}</p>
                      </div>
                      <div className="flex items-center gap-2 bg-neutral-800/60 rounded-xl p-1 border border-neutral-700/50 shrink-0">
                        <button onClick={() => cambiarCantidad(item.cartId, -1)} className="p-1 text-neutral-300 hover:text-white">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-semibold w-4 text-center">{item.cantidad}</span>
                        <button onClick={() => cambiarCantidad(item.cartId, 1)} className="p-1 text-neutral-300 hover:text-white">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {carrito.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs text-neutral-400 uppercase tracking-wider">Notas del pedido</label>
                  <textarea
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    rows={2}
                    placeholder="Ej: gyosas fritas, sin cebollín, salsa aparte..."
                    className="w-full rounded-2xl bg-neutral-900 border border-neutral-800 p-3 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#556B2F]"
                  />
                </div>
              )}
            </div>

            <div className="border-t border-neutral-800 p-6 pt-4 space-y-4 shrink-0">
              <div className="flex justify-between items-center text-sm font-semibold">
                <span className="text-neutral-400">Total</span>
                <span className="text-[#8b9e69]">{formatear(totalCarrito)}</span>
              </div>
              <button
                disabled={carrito.length === 0}
                onClick={enviarPedidoWhatsApp}
                className="w-full py-3.5 rounded-2xl bg-[#556B2F] hover:bg-[#4a5f28] disabled:opacity-40 text-white font-medium text-xs tracking-wider uppercase transition-all shadow-lg shadow-[#556B2F]/20 flex items-center justify-center gap-2"
              >
                <span>Enviar pedido por WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}