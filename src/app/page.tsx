'use client';

import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';

const ALL_PROTEINS = [
  'Pollo teriyaki', 'Carne', 'Cangrejo furai', 'Choclito', 'Pollo furai', 
  'Cerdo furai', 'Pasta dinamita', 'Champiñón furai', 'Palmito', 'Camarón', 
  'Salmón', 'Atún', 'Pescado furai', 'Pulpo', 'Cangrejo', 'Atún furai', 
  'Calamar', 'Calamar furai', 'Pulpo furai', 'Pescado blanco', 
  'Camarón furai', 'Salmón furai'
];

const WHATSAPP_NUMBER = "573239448629";

export default function Home() {
  const [productos, setProductos] = useState<any[]>([]);
  const [cart, setCart] = useState<Record<string, { id: string; name: string; price: number; qty: number; proteins: string[] }>>({});
  const [orderType, setOrderType] = useState('Domicilio');
  
  // Formulario Domicilio
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custAddress, setCustAddress] = useState('');
  const [custNeighborhood, setCustNeighborhood] = useState('');
  const [custNotes, setCustNotes] = useState('');
  const [formError, setFormError] = useState(false);

  // Modales
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeModalData, setActiveModalData] = useState<{ id: string; name: string; price: number; maxProteins: number } | null>(null);
  const [modalSelection, setModalSelection] = useState<string[]>([]);
  const [modalWarning, setModalWarning] = useState(false);

  useEffect(() => {
    async function loadData() {
      const { data } = await supabase.from('productos').select('*');
      setProductos(data || []);
    }
    loadData();
  }, []);

  const formatCOP = (n: number) => '$' + n.toLocaleString('es-CO');

  const addToCart = (id: string, name: string, price: number, proteins: string[] = []) => {
    const key = proteins.length ? id + '::' + [...proteins].sort().join(',') : id;
    setCart(prev => {
      const currentQty = prev[key]?.qty || 0;
      return {
        ...prev,
        [key]: { id, name, price, qty: currentQty + 1, proteins }
      };
    });
  };

  const changeQty = (key: string, delta: number) => {
    setCart(prev => {
      const updated = { ...prev };
      if (updated[key]) {
        updated[key].qty += delta;
        if (updated[key].qty <= 0) delete updated[key];
      }
      return updated;
    });
  };

  const openProteinModal = (id: string, name: string, price: number, maxProtDB?: number) => {
    let maxP = maxProtDB || 1;
    if (!maxProtDB) {
      const lowerName = name.toLowerCase();
      const match = lowerName.match(/(\d+)\s*prote[ií]nas?/);
      if (match) maxP = parseInt(match[1], 10);
      else if (lowerName.includes('ceviche')) maxP = 2;
    }

    setActiveModalData({ id, name, price, maxProteins: maxP });
    setModalSelection([]);
    setModalWarning(false);
  };

  const handleProteinToggle = (protein: string) => {
    if (!activeModalData) return;
    if (modalSelection.includes(protein)) {
      setModalSelection(modalSelection.filter(p => p !== protein));
    } else {
      if (activeModalData.maxProteins === 1) {
        setModalSelection([protein]);
      } else if (modalSelection.length < activeModalData.maxProteins) {
        setModalSelection([...modalSelection, protein]);
      }
    }
  };

  const confirmProteins = () => {
    if (modalSelection.length === 0) {
      setModalWarning(true);
      return;
    }
    if (activeModalData) {
      addToCart(activeModalData.id, activeModalData.name, activeModalData.price, modalSelection);
      setActiveModalData(null);
    }
  };

  const sendWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    const keys = Object.keys(cart);
    if (keys.length === 0) return;

    if (!custName.trim() || !custPhone.trim() || (orderType === 'Domicilio' && (!custAddress.trim() || !custNeighborhood.trim()))) {
      setFormError(true);
      return;
    }
    setFormError(false);

    const totalPrice = keys.reduce((sum, k) => sum + cart[k].qty * cart[k].price, 0);

    let rawMsg = "🍣 *NUEVO PEDIDO - TOSHIKO SUSHI* 🍣\n\n";
    rawMsg += `👤 *Cliente:* ${custName}\n`;
    rawMsg += `📱 *Celular:* ${custPhone}\n`;
    rawMsg += `📦 *Tipo de orden:* ${orderType}\n`;
    
    if(orderType === 'Domicilio') {
      rawMsg += `📍 *Dirección:* ${custAddress}\n`;
      rawMsg += `🏘️ *Barrio:* ${custNeighborhood}\n`;
      if(custNotes) rawMsg += `📝 *Notas:* ${custNotes}\n`;
    }
    
    rawMsg += `\n--- *DETALLE DEL PEDIDO* ---\n`;
    keys.forEach(key => {
      const entry = cart[key];
      const proteinText = entry.proteins.length ? ` (+ ${entry.proteins.join(', ')})` : '';
      rawMsg += `• ${entry.qty}x ${entry.name}${proteinText} — ${formatCOP(entry.price * entry.qty)}\n`;
    });
    
    rawMsg += `\n💰 *TOTAL: ${formatCOP(totalPrice)}*\n(Sin incluir costo de envío)`;

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(rawMsg)}`, '_blank');
  };

  const categoriasMap: Record<string, string> = {
    entradas: 'Entradas',
    fusion: 'Fusión',
    'special-rolls': 'Special Rolls',
    'california-roll': 'California Roll',
    'hot-roll': 'Hot Rolls',
    'oriental-roll': 'Oriental',
    osomaki: 'Osomaki',
    'sushi-burgers': 'Sushi Burgers',
    ceviches: 'Ceviches',
    gohan: 'Gohan',
    'hand-roll': 'Hand Roll',
    promos: 'Promociones & Combos',
    bebidas: 'Bebidas'
  };

  const cartKeys = Object.keys(cart);
  const totalItems = cartKeys.reduce((sum, k) => sum + cart[k].qty, 0);
  const totalPrice = cartKeys.reduce((sum, k) => sum + cart[k].qty * cart[k].price, 0);

  return (
    <main className="texture min-h-screen">
      {/* ============ HEADER FIJO CON SCROLL DINÁMICO ============ */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#0A0A0A]/95 backdrop-blur border-b" style={{ borderColor: 'var(--line)', paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        <div className="flex items-center justify-between px-4 py-3 max-w-3xl mx-auto border-b" style={{ borderColor: 'var(--line)' }}>
          <div className="flex items-center gap-2">
            <span className="font-serif-display text-lg tracking-wide" style={{ color: 'var(--gold)' }}>Toshiko</span>
            <span className="text-[10px] uppercase tracking-[0.25em]" style={{ color: 'var(--muted)' }}>Sushi · Cali</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="#info" className="text-xs" style={{ color: 'var(--muted)' }}>Ubicación</a>
            <a href="/admin" className="text-[10px] text-white/10 hover:text-white/40 transition-colors p-1" title="Admin">⚙️</a>
          </div>
        </div>

        <nav className="overflow-x-auto scrollbar-none" style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="flex gap-2 px-4 py-3 max-w-3xl mx-auto min-w-max">
            {Object.entries(categoriasMap).map(([key, title]) => (
              <a 
                key={key} 
                href={`#${key}`} 
                onClick={(e) => {
                  e.preventDefault();
                  const targetSection = document.getElementById(key);
                  if (targetSection) targetSection.scrollIntoView({ behavior: 'smooth' });
                  e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                }}
                className="nav-pill px-4 py-1.5 rounded-full text-sm whitespace-nowrap flex-shrink-0 transition-colors"
              >
                {title}
              </a>
            ))}
            <a 
              href="#info" 
              onClick={(e) => {
                e.preventDefault();
                const targetSection = document.getElementById('info');
                if (targetSection) targetSection.scrollIntoView({ behavior: 'smooth' });
                e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
              }}
              className="nav-pill px-4 py-1.5 rounded-full text-sm whitespace-nowrap flex-shrink-0"
            >
              Info
            </a>
          </div>
        </nav>
      </header>

      {/* ============ HERO ============ */}
      <section className="relative px-6 pt-40 pb-10 max-w-3xl mx-auto overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-40 pointer-events-none" style={{ background: 'radial-gradient(circle at 80% 20%, rgba(197, 160, 89, 0.15) 0%, transparent 60%)' }}></div>
        <div className="relative z-10">
          <p className="text-xs uppercase tracking-[0.3em] mb-3" style={{ color: 'var(--green-light)' }}></p>
          <h1 className="font-serif-display text-5xl leading-[1.05] mb-4" style={{ color: 'var(--ivory)' }}>
            Toshiko <span style={{ color: 'var(--gold)' }}>Sushi</span>
          </h1>
          <p className="text-sm leading-relaxed max-w-sm" style={{ color: 'var(--muted)' }}>
            Cocina japonesa de autor con acento caribeño. Arma tu pedido, ajusta las cantidades y envíalo directo a nuestra cocina por WhatsApp.
          </p>
        </div>
      </section>

      {/* ============ MENU ============ */}
      <div className="px-4 max-w-3xl mx-auto pb-40">
        {Object.entries(categoriasMap).map(([catKey, catTitle]) => {
          const itemsCat = productos.filter((p: any) => {
            const c = (p.categoria || '').toLowerCase().trim();
            if (catKey === 'special-rolls') return c.includes('special') || c.includes('roll');
            if (catKey === 'promos') return c.includes('promo') || c.includes('combo') || c.includes('barco');
            if (catKey === 'hot-roll') return c.includes('hot');
            if (catKey === 'oriental-roll') return c.includes('oriental') || c === 'oriental';
            if (catKey === 'california-roll') return c.includes('california');
            if (catKey === 'hand-roll') return c.includes('hand');
            if (catKey === 'sushi-burgers') return c.includes('burger');
            return c.includes(catKey) || c.includes(catTitle.toLowerCase());
          });

          if (itemsCat.length === 0) return null;

          return (
            <section key={catKey} id={catKey} className="mb-12 scroll-mt-36">
              <div className="flex items-end justify-between mb-5 border-b pb-2" style={{ borderColor: 'var(--line)' }}>
                <h2 className="font-serif-display text-2xl" style={{ color: 'var(--gold)' }}>{catTitle}</h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {itemsCat.map((item: any) => {
                  const maxP = item.max_proteinas || 1;
                  const btnText = maxP > 1 ? `Elige hasta ${maxP} proteínas` : 'Elige tu proteína';

                  return (
                    <div key={item.id} className="rounded-2xl flex flex-col overflow-hidden" style={{ background: 'var(--bg-1)', border: '1px solid var(--line)' }}>
                      <div className="w-full h-44 relative bg-[#0D0D0D] flex items-center justify-center overflow-hidden border-b border-[#ffffff0a]">
                        {item.imagen_url ? (
                          <>
                            <img src={item.imagen_url} alt={item.nombre} className="w-full h-full object-cover" />
                            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[var(--bg-1)] to-transparent"></div>
                          </>
                        ) : (
                          <span className="text-[10px] tracking-widest" style={{ color: 'var(--gold)' }}>TOSHIKO</span>
                        )}
                      </div>

                      <div className="p-4 pt-3 flex flex-col flex-1">
                        <h3 className="font-serif-display text-lg mb-1.5" style={{ color: 'var(--ivory)' }}>{item.nombre}</h3>
                        <p className="text-xs mb-4 opacity-80" style={{ color: 'var(--muted)' }}>{item.descripcion || 'Preparado con ingredientes frescos.'}</p>
                        
                        {item.permite_proteina && (
                          <span className="self-start text-[10px] px-2.5 py-1 rounded-full mb-3 uppercase tracking-wider font-bold border" style={{ background: 'rgba(197,160,89,0.1)', color: 'var(--gold)', borderColor: 'var(--gold-dim)' }}>
                            {btnText}
                          </span>
                        )}
                        
                        <div className="mt-auto flex items-center justify-between pt-2">
                          <span className="font-serif-display text-xl" style={{ color: 'var(--green-light)' }}>{formatCOP(item.precio)}</span>
                          {item.permite_proteina ? (
                            <button onClick={() => openProteinModal(item.id, item.nombre, item.precio, item.max_proteinas)} className="btn-custom text-xs font-bold px-5 py-2.5 rounded-full">Seleccionar +</button>
                          ) : (
                            <button onClick={() => addToCart(item.id, item.nombre, item.precio)} className="btn-add text-xs font-bold px-5 py-2.5 rounded-full">Agregar +</button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}

        {/* ============ INFO / UBICACIÓN / MAPA Y REDES ============ */}
        <section id="info" className="mb-6 scroll-mt-36">
          <h2 className="font-serif-display text-2xl mb-1" style={{ color: 'var(--gold)' }}>Visítanos</h2>
          <p className="text-xs mb-4" style={{ color: 'var(--muted)' }}>Ubicación, horarios y redes sociales</p>

          <div className="contact-card rounded-2xl p-5 flex flex-col gap-4 mb-4" style={{ background: 'var(--bg-1)', border: '1px solid var(--line)' }}>
            <div className="flex items-start gap-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" style={{ color: 'var(--gold)', marginTop: '2px', flexShrink: 0 }}>
                <path d="M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11Z"/><circle cx="12" cy="10" r="2.5"/>
              </svg>
              <div>
                <p className="text-sm font-semibold">Av 6a Norte #17-71</p>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>Cali, Colombia</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" style={{ color: 'var(--gold)', marginTop: '2px', flexShrink: 0 }}>
                <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>
              </svg>
              <div>
                <p className="text-sm font-semibold">Todos los días</p>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>12:00 m. – 10:00 p.m.</p>
              </div>
            </div>

            {/* MAPA DE GOOGLE EMBED */}
            <div className="rounded-xl overflow-hidden border mt-2 h-48 w-full relative" style={{ borderColor: 'var(--line)' }}>
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3982.553930472499!2d-76.535!3d3.451!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e30a66456291a27%3A0x8e9a2b724b1f618!2sAv.%206a%20Norte%20%2317-71%2C%20Cali%2C%20Valle%20del%20Cauca!5e0!3m2!1ses!2sco!4v1650000000000!5m2!1ses!2sco" 
                width="100%" 
                height="100%" 
                style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg)' }} 
                allowFullScreen={false} 
                loading="lazy"
              ></iframe>
            </div>

            <a href="https://www.google.com/maps/search/?api=1&query=Av.+6a+Norte+%2317-71%2C+Cali%2C+Colombia" target="_blank" className="block w-full rounded-xl py-3 font-bold text-xs transition-all text-center" style={{ background: 'var(--bg-2)', color: 'var(--gold)', border: '1px solid var(--line)' }}>
              Abrir ruta en Google Maps
            </a>

            {/* FILA DE LAS 3 APPS (Instagram, TikTok, WhatsApp) */}
            <div className="flex items-center gap-2 pt-2">
              <a href="https://instagram.com/toshikosushi" target="_blank" className="social-btn flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-semibold" style={{ background: 'var(--bg-2)', border: '1px solid var(--line)', color: 'var(--ivory)' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1"/></svg>
                Instagram
              </a>
              <a href="https://www.tiktok.com/@toshikosushi" target="_blank" className="social-btn flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-semibold" style={{ background: 'var(--bg-2)', border: '1px solid var(--line)', color: 'var(--ivory)' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 4v9.5a3.5 3.5 0 1 1-3-3.46"/><path d="M14 4c.5 2.5 2 4 4.5 4.3"/></svg>
                TikTok
              </a>
              <a href="https://wa.me/573239448629" target="_blank" className="social-btn flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-semibold" style={{ background: 'var(--green)', color: '#0A0A0A' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2Zm0 1.8a8.2 8.2 0 0 1 7 12.5l-.3.5 1 3.2-3.3-.9-.5.3A8.2 8.2 0 1 1 12 3.8Zm-3.4 4.4c-.2 0-.5 0-.7.4-.3.4-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3.2 5 4.4 2.4 1 2.9.8 3.4.8.5 0 1.7-.7 2-1.4.2-.6.2-1.2.1-1.4-.1-.1-.3-.2-.6-.4-.3-.1-1.7-.9-2-1-.2-.1-.4-.1-.6.1-.2.3-.7 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.6-2.1-.2-.3 0-.5.1-.6l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.2-.6-1.6-.9-2.1-.2-.5-.4-.5-.6-.5Z"/></svg>
                WhatsApp
              </a>
            </div>
          </div>
        </section>
      </div>

      {/* ============ FLOATING CART BAR ============ */}
      {totalItems > 0 && (
        <div className="fixed left-0 right-0 bottom-0 z-50 px-4 pb-4">
          <button onClick={() => setIsCartOpen(true)} className="w-full max-w-3xl mx-auto flex items-center justify-between rounded-2xl px-5 py-4 shadow-2xl" style={{ background: 'var(--green)', color: '#0A0A0A' }}>
            <span className="flex items-center gap-2 font-bold text-sm">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#0A0A0A] text-[var(--green-light)] text-xs font-bold">{totalItems}</span>
              Ver pedido
            </span>
            <span className="font-serif-display text-lg">{formatCOP(totalPrice)}</span>
          </button>
        </div>
      )}

      {/* ============ CART PANEL ============ */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/70" onClick={() => setIsCartOpen(false)}></div>
          <div className="relative rounded-t-3xl px-5 pt-5 pb-6 flex flex-col max-h-[90vh]" style={{ background: 'var(--bg-1)', borderTop: '1px solid var(--gold-dim)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif-display text-2xl" style={{ color: 'var(--gold)' }}>Tu pedido</h3>
              <button onClick={() => setIsCartOpen(false)} className="text-sm font-semibold px-3 py-1 rounded-full border">Cerrar</button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-1 pb-4">
              {cartKeys.map(key => {
                const entry = cart[key];
                return (
                  <div key={key} className="flex items-center justify-between border-b pb-3 mb-3" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                    <div>
                      <p className="text-sm font-bold text-[var(--ivory)]">{entry.name}</p>
                      {entry.proteins.length > 0 && <p className="text-[11px] font-semibold uppercase" style={{ color: 'var(--gold)' }}>+ {entry.proteins.join(', ')}</p>}
                      <p className="text-xs" style={{ color: 'var(--muted)' }}>{formatCOP(entry.price)} c/u</p>
                    </div>
                    <div className="flex items-center gap-3 rounded-full px-2 py-1" style={{ background: 'var(--bg-2)' }}>
                      <button onClick={() => changeQty(key, -1)} className="w-6 h-6 rounded-full bg-[#1a1a1a] text-white">–</button>
                      <span className="text-sm font-bold">{entry.qty}</span>
                      <button onClick={() => changeQty(key, 1)} className="w-6 h-6 rounded-full bg-[var(--gold)] text-black">+</button>
                    </div>
                  </div>
                );
              })}

              <div className="mt-4">
                <h4 className="text-xs font-bold mb-2 uppercase" style={{ color: 'var(--gold)' }}>Método de entrega</h4>
                <div className="flex gap-2 mb-4 p-1 rounded-xl" style={{ background: 'var(--bg-2)' }}>
                  <button onClick={() => setOrderType('Domicilio')} className={`flex-1 py-2 text-xs font-bold rounded-lg ${orderType === 'Domicilio' ? 'bg-[var(--green)] text-[#0A0A0A]' : 'text-muted'}`}>Domicilio</button>
                  <button onClick={() => setOrderType('Recoger en tienda')} className={`flex-1 py-2 text-xs font-bold rounded-lg ${orderType === 'Recoger en tienda' ? 'bg-[var(--green)] text-[#0A0A0A]' : 'text-muted'}`}>Recoger</button>
                </div>

                <div className="flex flex-col gap-3">
                  <input type="text" placeholder="Tu nombre *" value={custName} onChange={e => setCustName(e.target.value)} className="w-full text-sm rounded-xl px-4 py-3 outline-none" style={{ background: 'var(--bg-2)', color: 'var(--ivory)', border: '1px solid var(--line)' }} />
                  <input type="tel" placeholder="Celular *" value={custPhone} onChange={e => setCustPhone(e.target.value)} className="w-full text-sm rounded-xl px-4 py-3 outline-none" style={{ background: 'var(--bg-2)', color: 'var(--ivory)', border: '1px solid var(--line)' }} />
                  {orderType === 'Domicilio' && (
                    <>
                      <input type="text" placeholder="Dirección exacta *" value={custAddress} onChange={e => setCustAddress(e.target.value)} className="w-full text-sm rounded-xl px-4 py-3 outline-none" style={{ background: 'var(--bg-2)', color: 'var(--ivory)', border: '1px solid var(--line)' }} />
                      <input type="text" placeholder="Barrio *" value={custNeighborhood} onChange={e => setCustNeighborhood(e.target.value)} className="w-full text-sm rounded-xl px-4 py-3 outline-none" style={{ background: 'var(--bg-2)', color: 'var(--ivory)', border: '1px solid var(--line)' }} />
                      <input type="text" placeholder="Notas (apto, torre...)" value={custNotes} onChange={e => setCustNotes(e.target.value)} className="w-full text-sm rounded-xl px-4 py-3 outline-none" style={{ background: 'var(--bg-2)', color: 'var(--ivory)', border: '1px solid var(--line)' }} />
                    </>
                  )}
                </div>
                {formError && <p className="text-xs text-red-400 mt-2">Completa los campos obligatorios (*).</p>}
              </div>
            </div>

            <div className="pt-4 border-t" style={{ borderColor: 'var(--line)' }}>
              <div className="flex items-center justify-between pb-3">
                <span className="text-sm font-semibold" style={{ color: 'var(--muted)' }}>Total a Pagar</span>
                <span className="font-serif-display text-2xl" style={{ color: 'var(--ivory)' }}>{formatCOP(totalPrice)}</span>
              </div>
              <button onClick={sendWhatsApp} className="w-full rounded-xl py-4 font-bold text-sm" style={{ background: 'var(--green)', color: '#0A0A0A' }}>Enviar pedido por WhatsApp</button>
            </div>
          </div>
        </div>
      )}

      {/* ============ PROTEIN MODAL ============ */}
      {activeModalData && (
        <div className="fixed inset-0 z-[60] flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/80" onClick={() => setActiveModalData(null)}></div>
          <div className="relative rounded-t-3xl px-5 pt-6 pb-6" style={{ background: 'var(--bg-1)', borderTop: '1px solid var(--gold)' }}>
            <h3 className="font-serif-display text-2xl" style={{ color: 'var(--ivory)' }}>{activeModalData.name}</h3>
            <p className="text-xs mt-1 uppercase tracking-widest font-semibold" style={{ color: 'var(--gold)' }}>
              {activeModalData.maxProteins > 1 ? `Puedes elegir hasta ${activeModalData.maxProteins} opciones` : 'Elige tu proteína'}
            </p>
            
            <div className="flex flex-wrap gap-2.5 mt-4 max-h-[35vh] overflow-y-auto">
              {ALL_PROTEINS.map(p => {
                const isSelected = modalSelection.includes(p);
                return (
                  <button key={p} type="button" onClick={() => handleProteinToggle(p)} className={`px-4 py-2.5 border rounded-xl text-sm font-medium transition-all ${isSelected ? 'border-[var(--gold)] bg-[rgba(197,160,89,0.1)] text-[var(--gold)]' : 'border-[var(--line)] bg-[var(--bg-2)] text-[var(--ivory)]'}`}>
                    {p}
                  </button>
                );
              })}
            </div>
            {modalWarning && <p className="text-xs text-red-400 mt-2">Debes seleccionar al menos una proteína.</p>}
            
            <button onClick={confirmProteins} className="w-full rounded-xl py-4 font-bold text-sm mt-4" style={{ background: 'var(--green)', color: '#0A0A0A' }}>Agregar al pedido</button>
          </div>
        </div>
      )}
    </main>
  );
}