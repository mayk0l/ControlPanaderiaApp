import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Minus, ShoppingCart, Info, Lock, Unlock, LogOut, 
  TrendingUp, Package, DollarSign, Search, Save, 
  ChevronLeft, Menu, X, Calendar, Settings, Eye, EyeOff, 
  CheckCircle2, Trash2, Edit3, Tags, RotateCcw, 
  Landmark, Wallet, Moon, Sun, UserPlus, ClipboardCheck, Banknote
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, doc, setDoc, updateDoc, addDoc, deleteDoc, 
  onSnapshot, query, where, orderBy, limit, getDocs 
} from 'firebase/firestore';
import { 
  getAuth, signInAnonymously, onAuthStateChanged, 
  signInWithCustomToken 
} from 'firebase/auth';

/**
 * =================================================================================
 * 1. CONFIGURACIÓN E INICIALIZACIÓN
 * =================================================================================
 */

// Intentamos cargar la configuración del entorno.
// En un entorno local real, reemplaza esto con tu const firebaseConfig = { ... }
let app, auth, db;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'panaderia-v1';

try {
  const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : null;
  if (firebaseConfig) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  }
} catch (e) {
  console.error("Error inicializando Firebase. Verifica tus credenciales.", e);
}

/**
 * =================================================================================
 * 2. UTILIDADES Y HELPERS
 * =================================================================================
 */

// Formateador de Moneda
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount || 0);
};

// Calculadora de Rangos de Fecha para Reportes
const getDateRange = (period) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  if (period === 'day') {
    return { start: today, end: new Date(today.getTime() + 86400000), label: 'Hoy' };
  }
  if (period === 'week') {
    const day = today.getDay(); 
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Lunes
    const monday = new Date(today.setDate(diff));
    monday.setHours(0,0,0,0);
    const nextMonday = new Date(monday.getTime() + 7 * 86400000);
    return { start: monday, end: nextMonday, label: 'Semana Actual' };
  }
  if (period === 'month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return { start, end, label: 'Mes Actual' };
  }
  return { start: today, end: new Date(today.getTime() + 86400000), label: 'Hoy' };
};

/**
 * =================================================================================
 * 3. SISTEMA DE DISEÑO (COMPONENTES UI)
 * =================================================================================
 */

// Tarjeta Base (Responsive y Dark Mode)
const Card = ({ children, title, className = "", action }) => (
  <div className={`bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-4 md:p-6 transition-colors ${className}`}>
    {(title || action) && (
      <div className="flex justify-between items-center mb-4">
        {title && <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight">{title}</h3>}
        {action}
      </div>
    )}
    {children}
  </div>
);

// Botón Universal
const Button = ({ children, onClick, variant = 'primary', icon: Icon, disabled = false, full = false, size = "normal" }) => {
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200 dark:shadow-none",
    secondary: "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600",
    danger: "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50",
    success: "bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-200 dark:shadow-none",
    outline: "border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700",
  };
  const sizes = { normal: "px-4 py-3 md:py-2.5 text-sm", small: "px-3 py-1.5 text-xs" };
  
  return (
    <button 
      onClick={onClick} disabled={disabled}
      className={`flex items-center justify-center gap-2 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none ${variants[variant]} ${sizes[size]} ${full ? 'w-full' : ''}`}
    >
      {Icon && <Icon size={size === 'small' ? 14 : 18} />}
      {children}
    </button>
  );
};

// Input de Formulario (Limpio)
const FormInput = ({ label, type = "text", value, onChange, placeholder, required = false, autoFocus = false }) => (
  <div>
    {label && <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</label>}
    <input 
      type={type} 
      required={required}
      autoFocus={autoFocus}
      className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold dark:text-white transition-all"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    />
  </div>
);

/**
 * =================================================================================
 * 4. COMPONENTES ESTRUCTURALES (LAYOUT)
 * =================================================================================
 */

// Barra Lateral (Escritorio / Horizontal)
const Sidebar = ({ role, view, setView, user, handleLogout, isCollapsed, toggleSidebar }) => (
  <div className={`hidden md:flex ${isCollapsed ? 'w-20' : 'w-64'} bg-slate-900 h-screen text-white flex-col fixed left-0 top-0 z-40 transition-all duration-300 ease-in-out shadow-xl`}>
    <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between px-4'} py-6 mb-4`}>
      {!isCollapsed && <div className="flex items-center gap-3"><div className="bg-blue-600 p-2 rounded-lg"><Package size={20} /></div><span className="font-bold text-lg tracking-tight">Panadería</span></div>}
      {isCollapsed && <div className="bg-blue-600 p-2 rounded-lg"><Package size={20} /></div>}
      <button onClick={toggleSidebar} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400"><ChevronLeft size={20} className={`transition-transform ${isCollapsed ? 'rotate-180' : ''}`} /></button>
    </div>
    
    <nav className="flex-1 space-y-2 px-3">
      {[
        { id: 'pos', label: 'Venta', icon: ShoppingCart, role: 'all' },
        { id: 'expenses', label: 'Gastos', icon: Wallet, role: 'admin' },
        { id: 'reports', label: 'Reportes', icon: TrendingUp, role: 'admin' },
        { id: 'products', label: 'Productos', icon: Package, role: 'admin' },
        { id: 'config', label: 'Ajustes', icon: Settings, role: 'admin' },
      ].map(item => {
        if (item.role === 'admin' && role !== 'admin') return null;
        return (
          <button key={item.id} onClick={() => setView(item.id)} className={`flex items-center ${isCollapsed ? 'justify-center' : ''} gap-3 w-full p-3 rounded-xl transition-colors ${view === item.id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`} title={item.label}>
            <item.icon size={20} /> {!isCollapsed && <span>{item.label}</span>}
          </button>
        )
      })}
    </nav>

    <div className="mt-auto border-t border-slate-800 pt-6 px-3 pb-6">
      {isCollapsed ? (
        <div className="flex flex-col gap-4 items-center">
           <button onClick={handleLogout} className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-colors"><LogOut size={20}/></button>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${role === 'admin' ? 'bg-blue-500' : 'bg-amber-500'}`}>{user?.name?.[0]?.toUpperCase() || role?.[0]?.toUpperCase()}</div>
            <div className="overflow-hidden"><p className="text-sm font-medium capitalize truncate">{user?.name || role}</p><p className="text-xs text-slate-400 truncate">ID: {user?.username || 'master'}</p></div>
          </div>
          <Button variant="danger" full icon={LogOut} onClick={handleLogout}>Salir</Button>
        </>
      )}
    </div>
  </div>
);

// Navegación Inferior (Móvil / Vertical)
const MobileNav = ({ role, view, setView }) => (
  <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-2 flex justify-around items-center z-50 md:hidden pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
    {[
      { id: 'pos', icon: ShoppingCart, label: 'Venta', role: 'all' },
      { id: 'expenses', icon: Wallet, label: 'Gastos', role: 'admin' },
      { id: 'reports', icon: TrendingUp, label: 'Reportes', role: 'admin' },
      { id: 'products', icon: Package, label: 'Items', role: 'admin' },
      { id: 'config', icon: Settings, label: 'Ajustes', role: 'admin' },
    ].map(item => {
      if (item.role === 'admin' && role !== 'admin') return null;
      const isActive = view === item.id;
      return (
        <button key={item.id} onClick={() => setView(item.id)} className={`flex flex-col items-center justify-center w-full py-1 rounded-xl transition-all ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`}>
          <div className={`p-1 rounded-lg mb-0.5 ${isActive ? 'bg-blue-50 dark:bg-blue-900/30' : ''}`}><item.icon size={22} strokeWidth={isActive ? 2.5 : 2} /></div>
          <span className="text-[9px] font-bold">{item.label}</span>
        </button>
      )
    })}
  </div>
);

// Encabezado
const Header = ({ view, shift, isCollapsed }) => (
  <header className={`flex flex-col md:flex-row justify-between items-center mb-8 transition-all ${isCollapsed ? 'pl-0' : ''} gap-4`}>
    <div className="text-center md:text-left">
      <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
        {view === 'pos' && 'Terminal de Venta'}
        {view === 'products' && 'Catálogo Maestro'}
        {view === 'expenses' && 'Control de Gastos'}
        {view === 'reports' && 'Business Intelligence'}
        {view === 'config' && 'Configuración Core'}
      </h1>
      <p className="text-slate-400 dark:text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em] mt-1">
        {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
      </p>
    </div>
    <div className="flex items-center gap-4">
      {shift && (
        <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-black text-[10px] tracking-widest shadow-sm border ${shift.status === 'OPEN' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800' : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-100 dark:border-red-800'}`}>
          <div className={`w-2 h-2 rounded-full ${shift.status === 'OPEN' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
          {shift.status === 'OPEN' ? `TURNO: ${shift.openedByName?.toUpperCase()}` : 'TURNO CERRADO'}
        </div>
      )}
    </div>
  </header>
);

/**
 * =================================================================================
 * 5. MÓDULOS Y VISTAS
 * =================================================================================
 */

// --- VISTA: LOGIN ---
const LoginView = ({ loginForm, setLoginForm, handleLogin, showPass, setShowPass, loginError }) => (
  <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-6">
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="inline-flex bg-blue-600 p-4 rounded-3xl text-white mb-4 shadow-xl shadow-blue-200"><Package size={40} /></div>
        <h1 className="text-3xl font-black text-slate-900">Panadería Cloud</h1>
        <p className="text-slate-500 font-medium mt-2">Sistema Integral de Gestión</p>
      </div>
      <div className="bg-white rounded-2xl shadow-2xl shadow-slate-200 border-none p-8">
        <form onSubmit={handleLogin} className="space-y-5">
          <FormInput label="Usuario" value={loginForm.user} onChange={e => setLoginForm({...loginForm, user: e.target.value})} required />
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Contraseña</label>
            <div className="relative">
              <input type={showPass ? "text" : "password"} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={loginForm.pass} onChange={e => setLoginForm({...loginForm, pass: e.target.value})} />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">{showPass ? <EyeOff size={18} /> : <Eye size={18} />}</button>
            </div>
          </div>
          {loginError && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium flex items-center gap-2"><AlertCircle size={16} /> {loginError}</div>}
          <Button type="submit" full>Entrar al Sistema</Button>
        </form>
      </div>
    </div>
  </div>
);

// --- VISTA: PUNTO DE VENTA (POS) ---
const POSView = ({ shift, products, categories, searchTerm, setSearchTerm, addToCart, cart, setCart, processSale, handleUpdateBandejas, panConfig, stats, role, handleOpenShift, handleCloseShift }) => {
  const isShiftOpen = shift?.status === 'OPEN';
  const [modalMode, setModalMode] = useState(null); // 'open', 'close', 'confirm_sale'
  const [openingCashInput, setOpeningCashInput] = useState('');

  // Lógica de Modales
  const confirmOpening = () => { handleOpenShift(parseFloat(openingCashInput) || 0); setModalMode(null); setOpeningCashInput(''); };
  const handleClosingConfirm = (closingData) => { handleCloseShift(closingData); setModalMode(null); };
  
  // Agrupación de Productos
  const groupedProducts = useMemo(() => {
    const filtered = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const groups = {};
    categories.forEach(cat => groups[cat.name] = []);
    if (!groups['Sin Categoría']) groups['Sin Categoría'] = [];
    filtered.forEach(product => {
      const catName = product.category || 'Sin Categoría';
      if (!groups[catName]) groups[catName] = [];
      groups[catName].push(product);
    });
    return Object.entries(groups).filter(([_, items]) => items.length > 0);
  }, [products, categories, searchTerm]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in relative pb-20 md:pb-0">
      
      {/* Modal Apertura */}
      {modalMode === 'open' && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
          <Card className="w-full max-w-sm shadow-2xl border-none">
            <div className="text-center mb-6"><div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-4"><DollarSign size={32} /></div><h2 className="text-xl font-black text-slate-900 dark:text-slate-100">Apertura de Turno</h2><p className="text-slate-500 text-sm">Ingrese fondo inicial</p></div>
            <div className="mb-6 relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">$</span><input type="number" className="w-full pl-8 pr-4 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-2xl font-black text-slate-900 dark:text-white outline-none" value={openingCashInput} onChange={(e) => setOpeningCashInput(e.target.value)} placeholder="0" autoFocus /></div>
            <div className="flex flex-col gap-2"><Button full variant="primary" icon={CheckCircle2} onClick={confirmOpening}>Abrir Turno</Button><Button full variant="secondary" onClick={() => setModalMode(null)}>Cancelar</Button></div>
          </Card>
        </div>
      )}

      {/* Modal Cierre */}
      {modalMode === 'close' && <ShiftClosingModal shift={shift} stats={stats} onClose={() => setModalMode(null)} onConfirm={handleClosingConfirm} />}
      
      {/* Modal Confirmación Venta */}
      {modalMode === 'confirm_sale' && <SaleConfirmationModal cart={cart} total={cart.reduce((a, b) => a + (b.price * b.qty), 0)} onConfirm={() => { processSale(); setModalMode(null); }} onCancel={() => setModalMode(null)} onUpdateCart={setCart} />}

      {/* Columna Izquierda: Catálogo */}
      <div className={`relative ${!isShiftOpen ? 'opacity-50 pointer-events-none' : ''}`}>
        {!isShiftOpen && <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-50/20 backdrop-blur-[1px] rounded-2xl"><div className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xl"><Lock size={14} /> CAJA CERRADA</div></div>}
        <Card title="Ventas NO PAN">
          <div className="relative mb-6"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input type="text" placeholder="Buscar producto..." disabled={!isShiftOpen} className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border-none rounded-xl outline-none dark:text-white" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
          <div className="space-y-8 max-h-[500px] overflow-y-auto pr-2 pb-10">
            {groupedProducts.map(([category, items]) => (
              <div key={category}>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2"><Tags size={12} className="text-blue-500" />{category}</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {items.map(product => (
                    <button key={product.id} onClick={() => addToCart(product)} disabled={!isShiftOpen} className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-left hover:border-blue-500 hover:shadow-md transition-all active:scale-95"><p className="font-bold text-slate-800 dark:text-slate-200 mb-1 leading-tight text-sm">{product.name}</p><p className="text-sm text-blue-600 font-black">{formatCurrency(product.price)}</p></button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 border-t border-slate-100 dark:border-slate-700 pt-6">
            <div className="flex justify-between items-center mb-4"><h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-2"><ShoppingCart size={16} /> Carrito ({cart.reduce((a, b) => a + b.qty, 0)})</h4><button onClick={() => setCart([])} className="text-[10px] font-black uppercase text-red-400 hover:text-red-600">Limpiar</button></div>
            <div className="space-y-2 mb-6 max-h-32 overflow-y-auto">
                {cart.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700">
                        <div className="flex-1"><p className="font-bold text-slate-800 dark:text-slate-200 text-xs">{item.name}</p><p className="text-[9px] text-slate-500 font-bold uppercase">{item.qty} UN x {formatCurrency(item.price)}</p></div>
                        <div className="flex items-center gap-3"><span className="font-black text-slate-900 dark:text-white text-sm">{formatCurrency(item.qty * item.price)}</span><button onClick={() => setCart(prev => prev.filter((_, i) => i !== idx))} className="text-slate-300 hover:text-red-500"><X size={14} /></button></div>
                    </div>
                ))}
            </div>
            <Button full disabled={cart.length === 0 || !isShiftOpen} onClick={() => setModalMode('confirm_sale')}>Confirmar Venta</Button>
          </div>
        </Card>
      </div>

      {/* Columna Derecha: Pan y Resumen */}
      <div className="space-y-8">
        <div className={`relative ${!isShiftOpen ? 'opacity-50 pointer-events-none' : ''}`}>
           {!isShiftOpen && <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-50/20 backdrop-blur-[1px] rounded-2xl"><div className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xl"><Lock size={14} /> CAJA CERRADA</div></div>}
          <Card title="Bandejas de PAN">
            <div className="flex items-center justify-center gap-8 py-6">
              <button onClick={() => handleUpdateBandejas(Math.max(0, (shift?.bandejasSacadas || 0) - 1))} disabled={!isShiftOpen} className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 active:scale-90 transition-transform"><Minus size={32} /></button>
              <div className="text-center"><span className="text-7xl font-black text-slate-900 dark:text-white">{shift?.bandejasSacadas || 0}</span><p className="text-slate-400 font-black uppercase tracking-widest text-[10px] mt-2">Bandejas</p></div>
              <button onClick={() => handleUpdateBandejas((shift?.bandejasSacadas || 0) + 1)} disabled={!isShiftOpen} className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white hover:bg-blue-700 active:scale-90 transition-transform shadow-lg shadow-blue-200"><Plus size={32} /></button>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-6 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700">
              <div className="text-center"><p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Kilos Est.</p><p className="text-xl font-black text-slate-800 dark:text-white">{((shift?.bandejasSacadas || 0) * panConfig.kilosPorBandeja).toFixed(1)} <span className="text-sm font-medium">kg</span></p></div>
              <div className="text-center border-l border-slate-200 dark:border-slate-700"><p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Venta Est.</p><p className="text-xl font-black text-emerald-600 dark:text-emerald-400">{formatCurrency((shift?.bandejasSacadas || 0) * panConfig.kilosPorBandeja * panConfig.precioPorKilo)}</p></div>
            </div>
          </Card>
        </div>
        <Card title="Panel de Turno" className={shift?.status === 'CLOSED' ? "bg-slate-50 opacity-90" : ""}>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm"><span className="text-slate-500 dark:text-slate-400 font-medium">Fondo Inicial</span><span className="font-bold text-slate-900 dark:text-white">{formatCurrency(shift?.openingCash || 0)}</span></div>
            <div className="flex justify-between items-center text-sm"><span className="text-slate-500 dark:text-slate-400 font-medium">Ventas NO PAN</span><span className="font-bold text-slate-900 dark:text-white">{formatCurrency(shift?.ventasNoPan || 0)}</span></div>
            <div className="flex justify-between items-center text-sm"><span className="text-slate-500 dark:text-slate-400 font-medium">Ventas PAN (Est.)</span><span className="font-bold text-slate-900 dark:text-white">{formatCurrency(stats.brutoPan)}</span></div>
            <div className="flex justify-between items-center text-sm text-red-500"><span className="font-medium">Gastos Caja</span><span className="font-bold">-{formatCurrency(stats.gastosCaja)}</span></div>
            <div className="pt-3 border-t border-slate-100 dark:border-slate-700 space-y-3">
              <div className="flex justify-between items-center"><span className="text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase tracking-widest">Teórico en Caja</span><span className="font-black text-slate-900 dark:text-white text-lg">{formatCurrency(stats.cashInDrawer)}</span></div>
              <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/50 shadow-sm animate-pulse">
                <div className="flex justify-between items-center text-emerald-700 dark:text-emerald-300"><div className="flex items-center gap-2"><TrendingUp size={20} className="text-emerald-500" /><span className="font-black text-xs uppercase tracking-widest">Utilidad Neta</span></div><span className="text-2xl font-black tracking-tight">{formatCurrency(stats.netoFinal)}</span></div>
              </div>
            </div>
            <div className="pt-4 space-y-3">
              {!shift ? <Button full variant="success" icon={Unlock} onClick={() => setModalMode('open')}>Abrir Nuevo Turno</Button> : shift.status === 'OPEN' ? <Button full variant="danger" icon={Lock} onClick={() => setModalMode('close')}>Realizar Arqueo y Cierre</Button> : <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 p-4 rounded-xl flex items-center gap-3 text-amber-700 dark:text-amber-400"><Lock size={20} /><div><p className="font-bold">Turno Cerrado</p><p className="text-xs">Para operar, inicie un nuevo turno.</p></div></div>}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

// --- VISTA: GASTOS ---
const ExpensesView = ({ expenses, shift, onSave, onDelete }) => {
  const [form, setForm] = useState({ description: '', amount: '', origin: 'GENERAL', fromCash: true });
  const [editingId, setEditingId] = useState(null);

  const handleSubmit = (e) => { e.preventDefault(); if (!form.description || !form.amount) return; onSave({ ...form, amount: parseInt(form.amount) }, editingId); setForm({ description: '', amount: '', origin: 'GENERAL', fromCash: true }); setEditingId(null); };
  const handleEdit = (ex) => { setForm({ description: ex.description, amount: ex.amount, origin: ex.origin, fromCash: ex.fromCash }); setEditingId(ex.id); };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in pb-20 md:pb-0">
      <div className="lg:col-span-2 order-2 lg:order-1"><Card title="Historial de Gastos del Turno"><div className="overflow-x-auto"><table className="w-full text-left"><thead><tr className="border-b border-slate-100 dark:border-slate-700 text-slate-400 text-[10px] font-black uppercase tracking-widest"><th className="pb-4">Descripción</th><th className="pb-4">Origen</th><th className="pb-4">Método</th><th className="pb-4">Monto</th><th className="pb-4 text-right">Acción</th></tr></thead><tbody className="divide-y divide-slate-50 dark:divide-slate-700">{expenses.map(ex => (<tr key={ex.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50"><td className="py-4 font-bold text-slate-700 dark:text-slate-200">{ex.description}</td><td className="py-4"><span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${ex.origin === 'PAN' ? 'bg-orange-100 text-orange-600' : ex.origin === 'NO_PAN' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'}`}>{ex.origin.replace('_', ' ')}</span></td><td className="py-4 text-xs font-medium text-slate-500 dark:text-slate-400">{ex.fromCash ? 'Efectivo Caja' : 'Transferencia/Otro'}</td><td className="py-4 font-bold text-red-500">-{formatCurrency(ex.amount)}</td><td className="py-4 text-right space-x-2"><button onClick={() => handleEdit(ex)} className="p-2 text-slate-300 hover:text-blue-500"><Edit3 size={16} /></button><button onClick={() => onDelete(ex.id)} className="p-2 text-slate-300 hover:text-red-500"><Trash2 size={16} /></button></td></tr>))}</tbody></table></div></Card></div>
      <div className="order-1 lg:order-2"><Card title={editingId ? "Editar Gasto" : "Registrar Gasto"} className={editingId ? "border-blue-500 ring-2 ring-blue-100" : ""}><form onSubmit={handleSubmit} className="space-y-4">
        <FormInput label="Descripción" value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Ej: Harina" required />
        <FormInput label="Monto" type="number" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} placeholder="0" required />
        <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Origen</label><select className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold dark:text-white" value={form.origin} onChange={e => setForm({...form, origin: e.target.value})}><option value="GENERAL">General</option><option value="PAN">Insumos PAN</option><option value="NO_PAN">Insumos Productos</option></select></div>
        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700"><input type="checkbox" checked={form.fromCash} onChange={e => setForm({...form, fromCash: e.target.checked})} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" /><label className="text-xs font-bold text-slate-600 dark:text-slate-300">Pagado con Efectivo</label></div>
        <div className="flex gap-2">{editingId && <Button variant="secondary" onClick={() => {setEditingId(null); setForm({ description: '', amount: '', origin: 'GENERAL', fromCash: true });}}>Cancelar</Button>}<Button full type="submit" icon={editingId ? Save : Plus}>{editingId ? 'Actualizar' : 'Registrar'}</Button></div>
      </form></Card></div>
    </div>
  );
};

// --- VISTA: REPORTES ---
const ReportsView = ({ appId }) => {
  const [period, setPeriod] = useState('day');
  const [data, setData] = useState({ventaPan:0, gastosPan:0, gananciaPan:0, ventaNoPan:0, cogsNoPan:0, gastosNoPan:0, gananciaNoPan:0, gastosGeneral:0, utilidadNeta:0});
  const [rawHistory, setRawHistory] = useState({ shifts: [], expenses: [] });
  const [activeHistoryType, setActiveHistoryType] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleUpdateShift = async (shiftId, updates) => { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'shifts', shiftId), updates); };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { start, end } = getDateRange(period);
      try {
        const shiftsSnap = await getDocs(collection(db, 'artifacts', appId, 'public', 'data', 'shifts'));
        const expensesSnap = await getDocs(collection(db, 'artifacts', appId, 'public', 'data', 'expenses'));
        
        const shifts = shiftsSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(s => { 
          const dateStr = s.date || s.id;
          const sDate = new Date(dateStr + 'T00:00:00'); 
          return sDate >= start && sDate < end; 
        });

        const expenses = expensesSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(e => e.date >= start.getTime() && e.date < end.getTime());
        setRawHistory({ shifts, expenses });
        
        let ventaPan = 0, gastosPan = expenses.filter(e => e.origin === 'PAN').reduce((sum, e) => sum + e.amount, 0);
        shifts.forEach(s => { const conf = s.configSnapshot || { kilosPorBandeja: 3.2, precioPorKilo: 2000 }; ventaPan += (s.bandejasSacadas || 0) * conf.kilosPorBandeja * conf.precioPorKilo; });
        let ventaNoPan = 0, cogsNoPan = 0, gastosNoPan = expenses.filter(e => e.origin === 'NO_PAN').reduce((sum, e) => sum + e.amount, 0);
        shifts.forEach(s => { ventaNoPan += (s.ventasNoPan || 0); if (s.ventasItems) s.ventasItems.forEach(item => cogsNoPan += (item.costSnapshot || 0) * (item.qty || 1)); });
        const gastosGeneral = expenses.filter(e => e.origin === 'GENERAL').reduce((sum, e) => sum + e.amount, 0);
        const utilidadNeta = (ventaPan + ventaNoPan) - (gastosPan + gastosNoPan + gastosGeneral + cogsNoPan);
        setData({ ventaPan, gastosPan, gananciaPan: ventaPan - gastosPan, ventaNoPan, gastosNoPan, cogsNoPan, gananciaNoPan: ventaNoPan - (cogsNoPan + gastosNoPan), gastosGeneral, utilidadNeta });
      } catch (err) { console.error("Error en reportes:", err); } finally { setLoading(false); }
    };
    fetchData();
  }, [period, appId, activeHistoryType]);

  return (
    <div className="space-y-8 animate-fade-in pb-20 md:pb-0">
      <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-2 rounded-2xl border border-slate-100 dark:border-slate-700 w-fit">{['day', 'week', 'month'].map(p => (<button key={p} onClick={() => setPeriod(p)} className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${period === p ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-lg' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>{p === 'day' ? 'Hoy' : p === 'week' ? 'Semana' : 'Mes'}</button>))}</div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="space-y-4"><div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 mb-2"><div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg"><Package size={18} /></div><h3 className="font-black text-lg">Línea PAN</h3></div><Card className="border-t-4 border-t-orange-500" action={<button onClick={() => setActiveHistoryType('PAN')} className="text-xs font-bold text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-300 px-3 py-1 rounded-lg hover:bg-orange-100 transition-colors">Historial</button>}><div className="space-y-4"><div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400 text-sm font-medium">Ventas</span><span className="font-bold text-slate-800 dark:text-slate-100">{formatCurrency(data.ventaPan)}</span></div><div className="flex justify-between text-red-500"><span className="text-sm font-medium">Gastos Directos</span><span className="font-bold">-{formatCurrency(data.gastosPan)}</span></div><div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-between text-orange-600 dark:text-orange-400"><span className="font-black uppercase text-xs tracking-widest">Utilidad Pan</span><span className="font-black text-xl">{formatCurrency(data.gananciaPan)}</span></div></div></Card></div>
        <div className="space-y-4"><div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2"><div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg"><ShoppingCart size={18} /></div><h3 className="font-black text-lg">Línea PRODUCTOS</h3></div><Card className="border-t-4 border-t-blue-500" action={<button onClick={() => setActiveHistoryType('NO_PAN')} className="text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-300 px-3 py-1 rounded-lg hover:bg-blue-100 transition-colors">Historial</button>}><div className="space-y-4"><div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400 text-sm font-medium">Ventas</span><span className="font-bold text-slate-800 dark:text-slate-100">{formatCurrency(data.ventaNoPan)}</span></div><div className="flex justify-between text-red-400"><span className="text-sm font-medium">Costo Mercadería</span><span className="font-bold">-{formatCurrency(data.cogsNoPan)}</span></div><div className="flex justify-between text-red-500"><span className="text-sm font-medium">Gastos Directos</span><span className="font-bold">-{formatCurrency(data.gastosNoPan)}</span></div><div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-between text-blue-600 dark:text-blue-400"><span className="font-black uppercase text-xs tracking-widest">Utilidad Prod.</span><span className="font-black text-xl">{formatCurrency(data.gananciaNoPan)}</span></div></div></Card></div>
        <div className="space-y-4"><div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 mb-2"><div className="p-2 bg-slate-200 dark:bg-slate-700 rounded-lg"><Landmark size={18} /></div><h3 className="font-black text-lg">Consolidado</h3></div><Card className={`border-t-4 ${data.utilidadNeta >= 0 ? 'border-t-emerald-500' : 'border-t-red-500'}`} action={<button onClick={() => setActiveHistoryType('CONSOLIDATED')} className="text-xs font-bold text-slate-600 bg-slate-100 dark:bg-slate-700 dark:text-slate-300 px-3 py-1 rounded-lg hover:bg-slate-200 transition-colors">Historial</button>}><div className="space-y-4"><div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400 text-sm font-medium">Utilidad Operativa</span><span className="font-bold text-slate-800 dark:text-slate-100">{formatCurrency(data.gananciaPan + data.gananciaNoPan)}</span></div><div className="flex justify-between text-red-500"><span className="text-sm font-medium">Gastos Generales</span><span className="font-bold">-{formatCurrency(data.gastosGeneral)}</span></div><div className={`pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center ${data.utilidadNeta >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}><span className="font-black uppercase text-xs tracking-widest">Utilidad Neta</span><span className="font-black text-3xl">{formatCurrency(data.utilidadNeta)}</span></div></div></Card></div>
      </div>
      {activeHistoryType && <HistoryModal type={activeHistoryType} data={rawHistory} onClose={() => setActiveHistoryType(null)} onUpdateShift={handleUpdateShift} />}
    </div>
  );
};

const HistoryModal = ({ type, data, onClose, onUpdateShift }) => {
  const [editingRowId, setEditingRowId] = useState(null);
  const [editValues, setEditValues] = useState({});

  const dailyData = useMemo(() => {
    const map = {};
    if (data.shifts) data.shifts.forEach(s => { const dateId = s.id; if (!map[dateId]) map[dateId] = { id: dateId, shift: s, expenses: [] }; else map[dateId].shift = s; });
    if (data.expenses) data.expenses.forEach(e => { const dateId = new Date(e.date).toISOString().split('T')[0]; if (!map[dateId]) map[dateId] = { id: dateId, shift: null, expenses: [] }; map[dateId].expenses.push(e); });
    return Object.values(map).sort((a, b) => b.id.localeCompare(a.id));
  }, [data]);

  const startEditing = (day) => {
    setEditingRowId(day.id);
    if (type === 'PAN') { setEditValues({ bandejas: day.shift?.bandejasSacadas || 0 }); }
    else if (type === 'NO_PAN') { setEditValues({ ventasNoPan: day.shift?.ventasNoPan || 0 }); }
  };

  const saveEditing = async (shiftId) => {
    if (!shiftId) return;
    try {
        const updates = {};
        if (type === 'PAN') updates.bandejasSacadas = parseFloat(editValues.bandejas);
        if (type === 'NO_PAN') updates.ventasNoPan = parseFloat(editValues.ventasNoPan);
        await onUpdateShift(shiftId, updates);
        setEditingRowId(null);
    } catch (error) { console.error("Error updating shift:", error); }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
      <Card className="w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col p-0 bg-white dark:bg-slate-800">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50"><div><h3 className="text-xl font-black text-slate-800 dark:text-white">Historial Detallado</h3></div><button onClick={onClose}><X size={24} /></button></div>
        <div className="overflow-y-auto p-6">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead className="sticky top-0 z-10 shadow-sm bg-white dark:bg-slate-800"><tr className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-200 dark:border-slate-700"><th className="pb-4 pl-4 pt-2">Fecha</th>{type === 'PAN' && <><th className="pb-4 pt-2">Producción</th><th className="pb-4 pt-2">Venta</th><th className="pb-4 pt-2 text-red-400">Gastos</th><th className="pb-4 pt-2 text-right pr-4">Utilidad</th></>}{type === 'NO_PAN' && <><th className="pb-4 pt-2">Ventas</th><th className="pb-4 pt-2 text-red-400">Costos</th><th className="pb-4 pt-2 text-red-400">Gastos</th><th className="pb-4 pt-2 text-right pr-4">Utilidad</th></>}{type === 'CONSOLIDATED' && <><th className="pb-4 pt-2">Ingresos</th><th className="pb-4 pt-2 text-red-400">Egresos</th><th className="pb-4 pt-2 text-right pr-4">Neto</th></>}<th className="pb-4 pt-2 text-center">Acción</th></tr></thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">{dailyData.map(day => {
                const dateStr = new Date(day.id + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
                const s = day.shift;
                const isEditing = editingRowId === day.id;
                const conf = s?.configSnapshot || { kilosPorBandeja: 3.2, precioPorKilo: 2000 };
                const dayExpenses = day.expenses;
                let rowSales = 0, rowCosts = 0, rowProfit = 0;

                if (type === 'PAN') {
                    const ex = dayExpenses.filter(e => e.origin === 'PAN').reduce((sum, e) => sum + e.amount, 0);
                    rowSales = ((s?.bandejasSacadas || 0) * conf.kilosPorBandeja * conf.precioPorKilo);
                    rowCosts = ex; rowProfit = rowSales - ex;
                } else if (type === 'NO_PAN') {
                    const ex = dayExpenses.filter(e => e.origin === 'NO_PAN').reduce((sum, e) => sum + e.amount, 0);
                    const cogs = s?.ventasItems ? s.ventasItems.reduce((acc, i) => acc + ((i.costSnapshot||0)*i.qty), 0) : 0;
                    rowSales = s?.ventasNoPan || 0; rowCosts = cogs + ex; rowProfit = rowSales - rowCosts;
                } else {
                    const ex = dayExpenses.reduce((sum, e) => sum + e.amount, 0);
                    const panSales = ((s?.bandejasSacadas || 0) * conf.kilosPorBandeja * conf.precioPorKilo);
                    const cogs = s?.ventasItems ? s.ventasItems.reduce((acc, i) => acc + ((i.costSnapshot||0)*i.qty), 0) : 0;
                    rowSales = panSales + (s?.ventasNoPan || 0); rowCosts = cogs + ex; rowProfit = rowSales - rowCosts;
                }
                return (
                  <tr key={day.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="py-4 pl-4 font-bold text-slate-700 dark:text-slate-300 capitalize">{dateStr}</td>
                    {type === 'PAN' && (isEditing ? (<><td className="py-4"><input type="number" className="w-20 p-1 border rounded dark:bg-slate-900 dark:text-white" value={editValues.bandejas} onChange={e => setEditValues({...editValues, bandejas: e.target.value})} /></td><td colSpan="3" className="py-4 text-xs text-orange-500">Guardar...</td></>) : (<><td className="py-4 text-sm text-slate-600 dark:text-slate-400">{(s?.bandejasSacadas || 0)} band.</td><td className="py-4 text-sm font-bold text-slate-800 dark:text-slate-100">{formatCurrency(rowSales)}</td><td className="py-4 text-sm font-medium text-red-500">-{formatCurrency(rowCosts)}</td><td className={`py-4 text-right pr-4 font-black ${rowProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>{formatCurrency(rowProfit)}</td></>))}
                    {type === 'NO_PAN' && (isEditing ? (<><td className="py-4"><input type="number" className="w-24 p-1 border rounded dark:bg-slate-900 dark:text-white" value={editValues.ventasNoPan} onChange={e => setEditValues({...editValues, ventasNoPan: e.target.value})} /></td><td colSpan="3" className="py-4 text-xs text-blue-500">Guardar...</td></>) : (<><td className="py-4 text-sm font-bold text-slate-800 dark:text-slate-100">{formatCurrency(rowSales)}</td><td className="py-4 text-sm font-medium text-red-400">-{formatCurrency(s?.ventasItems?.reduce((acc, i) => acc + ((i.costSnapshot||0)*i.qty), 0)||0)}</td><td className="py-4 text-sm font-medium text-red-500">-{formatCurrency(dayExpenses.filter(e => e.origin === 'NO_PAN').reduce((sum, e) => sum + e.amount, 0))}</td><td className={`py-4 text-right pr-4 font-black ${rowProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>{formatCurrency(rowProfit)}</td></>))}
                    {type === 'CONSOLIDATED' && (<><td className="py-4 text-sm font-bold text-slate-800 dark:text-slate-100">{formatCurrency(rowSales)}</td><td className="py-4 text-sm font-medium text-red-500">-{formatCurrency(rowCosts)}</td><td className={`py-4 text-right pr-4 font-black ${rowProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>{formatCurrency(rowProfit)}</td></>)}
                    <td className="py-4 text-center">{type !== 'CONSOLIDATED' && (isEditing ? (<div className="flex gap-1 justify-center"><button onClick={() => saveEditing(s.id)} className="p-1 text-green-500 hover:bg-green-100 rounded"><CheckCircle2 size={16}/></button><button onClick={() => setEditingRowId(null)} className="p-1 text-red-500 hover:bg-red-100 rounded"><X size={16}/></button></div>) : (<button onClick={() => startEditing(day)} className="p-2 text-slate-300 hover:text-blue-600 transition-colors"><Edit3 size={16} /></button>))}</td>
                  </tr>
                );
              })}</tbody></table></div></Card></div>);
};

// --- VISTA: PRODUCTOS ---
const ProductsView = ({ products, categories, onSave, onDelete, onAddCategory, onDeleteCategory }) => {
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({ name: '', price: '', cost: '', category: '' });
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryNameInput, setCategoryNameInput] = useState("");
  const [isAddingInlineCategory, setIsAddingInlineCategory] = useState(false);
  const [newCategoryInlineName, setNewCategoryInlineName] = useState("");

  const openProductModal = (product = null) => { setIsAddingInlineCategory(false); setNewCategoryInlineName(""); if (product) { setEditingProduct(product); setProductForm({ name: product.name, price: product.price, cost: product.cost || '', category: product.category || '' }); } else { setEditingProduct(null); setProductForm({ name: '', price: '', cost: '', category: categories[0]?.name || '' }); } setIsProductModalOpen(true); };
  const handleSaveProduct = (e) => { e.preventDefault(); let finalCategory = productForm.category; if (isAddingInlineCategory && newCategoryInlineName.trim()) { onAddCategory(newCategoryInlineName.trim()); finalCategory = newCategoryInlineName.trim(); } const dataToSave = { ...productForm, price: parseFloat(productForm.price) || 0, cost: parseFloat(productForm.cost) || 0, category: finalCategory }; onSave(dataToSave, editingProduct); setIsProductModalOpen(false); };

  return (
    <div className="space-y-8 animate-fade-in pb-20 md:pb-0"><div className="flex justify-between items-end"><div><h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Catálogo e Inventario</h2><p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Gestión administrativa de ítems</p></div><div className="flex gap-3"><Button variant="outline" icon={Tags} onClick={() => setIsCategoryModalOpen(true)}>Categorías</Button><Button icon={Plus} onClick={() => openProductModal()}>Nuevo Producto</Button></div></div><div className="grid grid-cols-1 lg:grid-cols-3 gap-8"><div className="lg:col-span-2"><Card title="Lista de Productos"><div className="overflow-x-auto"><table className="w-full text-left"><thead><tr className="border-b border-slate-100 dark:border-slate-700 text-slate-400 text-[10px] font-black uppercase tracking-widest"><th className="pb-4">Producto</th><th className="pb-4">Categoría</th><th className="pb-4">Márgenes</th><th className="pb-4 text-right">Acciones</th></tr></thead><tbody className="divide-y divide-slate-50 dark:divide-slate-700">{products.map(p => { const ganancia = p.price - (p.cost || 0); const margen = p.price > 0 ? (ganancia / p.price) * 100 : 0; return (<tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group"><td className="py-4"><p className="font-black text-slate-800 dark:text-slate-200 leading-none text-sm">{p.name}</p><p className="text-xs font-bold text-blue-600 mt-1">${p.price.toLocaleString()}</p></td><td className="py-4"><span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 rounded-lg text-[9px] font-black uppercase tracking-widest">{p.category || 'Sin Cat.'}</span></td><td className="py-4"><div className="flex items-center gap-2"><div className={`w-1.5 h-1.5 rounded-full ${margen > 30 ? 'bg-emerald-500' : 'bg-amber-500'}`} /><span className={`font-black text-sm ${margen > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>{margen.toFixed(1)}%</span></div></td><td className="py-4 text-right space-x-1"><button onClick={() => openProductModal(p)} className="p-2 text-slate-300 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-all"><Edit3 size={16} /></button><button onClick={() => onDelete(p.id, p.name)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all"><Trash2 size={16} /></button></td></tr>); })}</tbody></table></div></Card></div><div><Card title="Categorías"><div className="space-y-2">{categories.map(cat => (<div key={cat.id} className="flex justify-between items-center bg-slate-50 dark:bg-slate-700 p-3 rounded-2xl border border-slate-100 dark:border-slate-600 group"><span className="font-black text-slate-700 dark:text-slate-200 text-xs uppercase tracking-wider">{cat.name}</span><button onClick={() => onDeleteCategory(cat.id, cat.name)} className="opacity-0 group-hover:opacity-100 p-2 text-red-300 hover:text-red-500 transition-all"><X size={14} /></button></div>))}</div></Card></div></div>{isCategoryModalOpen && <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in"><Card className="w-full max-w-sm shadow-2xl border-none p-0 overflow-hidden"><div className="bg-slate-900 p-6 text-white flex justify-between items-center"><h2 className="text-xl font-black">Nueva Categoría</h2><button onClick={() => setIsCategoryModalOpen(false)}><X size={20} /></button></div><div className="p-6 space-y-4"><FormInput value={categoryNameInput} onChange={e => setCategoryNameInput(e.target.value)} placeholder="Nombre de categoría" /><Button full onClick={() => { onAddCategory(categoryNameInput); setCategoryNameInput(""); setIsCategoryModalOpen(false); }} disabled={!categoryNameInput.trim()} icon={CheckCircle2}>Crear Categoría</Button></div></Card></div>}{isProductModalOpen && <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in"><Card className="w-full max-w-lg shadow-2xl border-none p-0 overflow-hidden"><div className="bg-slate-900 p-6 text-white flex justify-between items-center"><h2 className="text-xl font-black">{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</h2><button onClick={() => setIsProductModalOpen(false)}><X size={20} /></button></div><form onSubmit={handleSaveProduct} className="p-8 space-y-6"><div className="grid grid-cols-2 gap-4"><div className="col-span-2"><FormInput label="Nombre Comercial" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} required /></div><div className="col-span-2"><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{isAddingInlineCategory ? 'Nueva Categoría' : 'Categoría'}</label><div className="flex gap-2">{isAddingInlineCategory ? (<div className="flex-1 flex gap-2"><input type="text" placeholder="Nombre..." className="flex-1 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl outline-none font-bold text-blue-700 dark:text-blue-300" value={newCategoryInlineName} onChange={e => setNewCategoryInlineName(e.target.value)} autoFocus /><button type="button" onClick={() => setIsAddingInlineCategory(false)} className="p-4 bg-slate-100 dark:bg-slate-700 text-slate-400 rounded-2xl"><RotateCcw size={20} /></button></div>) : (<div className="flex-1 flex gap-2"><select className="flex-1 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none font-bold dark:text-white" value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})}><option value="">Seleccionar...</option>{categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}</select><button type="button" onClick={() => setIsAddingInlineCategory(true)} className="p-4 bg-blue-600 text-white rounded-2xl"><Plus size={20} /></button></div>)}</div></div><div><FormInput label="Costo Unitario" type="number" value={productForm.cost} onChange={e => setProductForm({...productForm, cost: e.target.value})} /></div><div><FormInput label="Precio Venta" type="number" value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} required /></div></div><div className="flex gap-3 pt-4"><Button full variant="secondary" onClick={() => setIsProductModalOpen(false)}>Cancelar</Button><Button full type="submit" icon={Save}>{editingProduct ? 'Guardar Cambios' : 'Crear Producto'}</Button></div></form></Card></div>}</div>); };

// --- VISTA: CONFIGURACIÓN ---
const ConfigView = ({ panConfig, setPanConfig, users, theme, setTheme, onSavePanConfig, onAddUser, onDeleteUser, shiftHistory, onForceCloseShift }) => {
  const [newUser, setNewUser] = useState({ name: '', username: '', password: '', role: 'vendedor' });
  const handleAddUser = (e) => { e.preventDefault(); if (!newUser.name || !newUser.username || !newUser.password) return; onAddUser(newUser); setNewUser({ name: '', username: '', password: '', role: 'vendedor' }); };

  return (
    <div className="space-y-8 animate-fade-in pb-24 md:pb-10">
      <Card title="Apariencia"><div className="flex items-center justify-between"><div className="flex items-center gap-4"><div className={`p-3 rounded-full ${theme === 'dark' ? 'bg-slate-700 text-yellow-400' : 'bg-blue-100 text-blue-600'}`}>{theme === 'dark' ? <Moon size={24} /> : <Sun size={24} />}</div><div><p className="font-bold text-slate-800 dark:text-slate-100">Modo {theme === 'dark' ? 'Oscuro' : 'Claro'}</p></div></div><div className="flex items-center bg-slate-100 dark:bg-slate-700 rounded-full p-1 border border-slate-200 dark:border-slate-600"><button onClick={() => setTheme('light')} className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${theme === 'light' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}>Claro</button><button onClick={() => setTheme('dark')} className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${theme === 'dark' ? 'bg-slate-600 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}>Oscuro</button></div></div></Card>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8"><Card title="Parámetros (PAN)"><div className="space-y-4"><div><FormInput label="Kilos por Bandeja" type="number" value={panConfig.kilosPorBandeja} onChange={(e) => setPanConfig({...panConfig, kilosPorBandeja: e.target.value})} /></div><div><FormInput label="Precio por Kilo ($)" type="number" value={panConfig.precioPorKilo} onChange={(e) => setPanConfig({...panConfig, precioPorKilo: e.target.value})} /></div><Button full icon={Save} onClick={onSavePanConfig}>Guardar</Button></div></Card><Card title="Agregar Usuario"><form onSubmit={handleAddUser} className="space-y-4"><FormInput label="Nombre" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} /><FormInput label="Usuario" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} /><FormInput label="Contraseña" type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} /><div><label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Rol</label><div className="flex gap-2 bg-slate-50 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700"><button type="button" onClick={() => setNewUser({...newUser, role: 'vendedor'})} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${newUser.role === 'vendedor' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-300' : 'text-slate-400'}`}>Vendedor</button><button type="button" onClick={() => setNewUser({...newUser, role: 'admin'})} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${newUser.role === 'admin' ? 'bg-white dark:bg-slate-700 shadow-sm text-purple-600 dark:text-purple-300' : 'text-slate-400'}`}>Admin</button></div></div><Button full type="submit" icon={UserPlus}>Crear Usuario</Button></form></Card></div><div className="grid grid-cols-1 lg:grid-cols-2 gap-8"><Card title="Usuarios del Sistema"><div className="overflow-x-auto"><table className="w-full text-left"><thead><tr className="border-b border-slate-100 dark:border-slate-700 text-slate-400 text-xs font-black uppercase tracking-widest"><th className="pb-4">Nombre</th><th className="pb-4">Usuario</th><th className="pb-4">Rol</th><th className="pb-4 text-right">Acción</th></tr></thead><tbody className="divide-y divide-slate-50 dark:divide-slate-700">{users.map(u => (<tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"><td className="py-4 font-bold text-slate-700 dark:text-slate-200">{u.name}</td><td className="py-4 text-sm text-slate-500 dark:text-slate-400">{u.username}</td><td className="py-4"><span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${u.role === 'admin' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300'}`}>{u.role}</span></td><td className="py-4 text-right"><button onClick={() => onDeleteUser(u.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button></td></tr>))}</tbody></table></div></Card><Card title="Historial de Turnos"><div className="overflow-x-auto max-h-[300px]"><table className="w-full text-left"><thead><tr className="border-b border-slate-100 dark:border-slate-700 text-slate-400 text-xs font-black uppercase tracking-widest"><th className="pb-4">Fecha</th><th className="pb-4">Responsable</th><th className="pb-4">Estado</th><th className="pb-4 text-right">Acción</th></tr></thead><tbody className="divide-y divide-slate-50 dark:divide-slate-700">{shiftHistory.map(s => { const dateStr = new Date(s.openedAt).toLocaleString('es-ES', { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' }); return (<tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50"><td className="py-4 font-bold text-slate-700 dark:text-slate-200 text-xs">{dateStr}</td><td className="py-4 text-xs font-bold text-blue-600 dark:text-blue-400">{s.openedByName || 'Desconocido'}</td><td className="py-4"><span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${s.status === 'OPEN' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>{s.status}</span></td><td className="py-4 text-right">{s.status === 'OPEN' && (<button onClick={() => onForceCloseShift(s.id)} className="px-2 py-1 bg-red-100 text-red-600 text-[10px] font-bold rounded hover:bg-red-200 transition-colors">Cerrar Remoto</button>)}</td></tr>); })}</tbody></table></div></Card></div></div>); };

// --- MODALES (CIERRE, APERTURA, CONFIRMACIÓN) ---
const ShiftClosingModal = ({ shift, stats, onClose, onConfirm }) => {
  const [step, setStep] = useState(1);
  const [adjustments, setAdjustments] = useState({ panAdjustment: '', panReason: '', countedCash: '' });
  const expectedCash = stats.cashInDrawer;
  const countedCashNum = adjustments.countedCash === '' ? 0 : parseFloat(adjustments.countedCash);
  const panAdjustmentNum = adjustments.panAdjustment === '' ? 0 : parseInt(adjustments.panAdjustment);
  const cashDifference = countedCashNum - expectedCash;
  const updatePanAdj = (delta) => { const current = adjustments.panAdjustment === '' ? 0 : parseInt(adjustments.panAdjustment); setAdjustments({...adjustments, panAdjustment: current + delta}); };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm animate-fade-in"><Card className="w-full max-w-lg bg-white dark:bg-slate-800 border-none shadow-2xl p-0 overflow-hidden"><div className="bg-slate-900 p-6 text-white flex justify-between items-center"><div><h2 className="text-xl font-black">Cierre de Turno</h2><p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Paso {step} de 3</p></div><button onClick={onClose}><X size={24} /></button></div><div className="p-6">
    {step === 1 && (<><div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl flex justify-between items-center mb-6"><span className="text-sm font-bold text-slate-600 dark:text-slate-300">Bandejas Registradas</span><span className="text-2xl font-black text-slate-900 dark:text-white">{shift?.bandejasSacadas || 0}</span></div><div className="mb-4"><label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Ajuste / Merma (+/-)</label><div className="flex gap-4"><button onClick={() => updatePanAdj(-1)} className="p-3 rounded-xl bg-red-100 text-red-600 hover:bg-red-200"><Minus size={20}/></button><input type="number" placeholder="0" className="flex-1 text-center font-black text-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white" value={adjustments.panAdjustment} onChange={(e) => setAdjustments({...adjustments, panAdjustment: e.target.value})} /><button onClick={() => updatePanAdj(1)} className="p-3 rounded-xl bg-green-100 text-green-600 hover:bg-green-200"><Plus size={20}/></button></div></div><FormInput label="Motivo" value={adjustments.panReason} onChange={(e) => setAdjustments({...adjustments, panReason: e.target.value})} /><div className="mt-4"><Button full onClick={() => setStep(2)} icon={ChevronRight}>Siguiente: Arqueo</Button></div></>)}
    {step === 2 && (<><div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl space-y-2 mb-6"><div className="flex justify-between"><span className="text-xs font-bold text-slate-500 dark:text-slate-400">Fondo Inicial</span><span className="text-xs font-bold text-slate-700 dark:text-slate-200">{formatCurrency(shift?.openingCash)}</span></div><div className="flex justify-between"><span className="text-xs font-bold text-slate-500 dark:text-slate-400">Ventas (Est.)</span><span className="text-xs font-bold text-emerald-600">+{formatCurrency(stats.brutoNoPan + stats.brutoPan)}</span></div><div className="flex justify-between"><span className="text-xs font-bold text-slate-500 dark:text-slate-400">Gastos Caja</span><span className="text-xs font-bold text-red-500">-{formatCurrency(stats.gastosCaja)}</span></div><div className="border-t border-slate-200 dark:border-slate-600 pt-2 flex justify-between items-center"><span className="font-black text-slate-800 dark:text-white uppercase text-xs tracking-widest">Esperado</span><span className="font-black text-slate-900 dark:text-white text-lg">{formatCurrency(expectedCash)}</span></div></div><FormInput label="Dinero Contado (Real)" type="number" autoFocus value={adjustments.countedCash} onChange={(e) => setAdjustments({...adjustments, countedCash: e.target.value})} placeholder="0" />{adjustments.countedCash !== '' && (<div className={`p-3 rounded-xl flex justify-between items-center mt-4 ${cashDifference === 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}><span className="font-bold text-xs uppercase tracking-widest">Diferencia</span><span className="font-black text-lg">{formatCurrency(cashDifference)}</span></div>)}<div className="flex gap-2 mt-4"><Button variant="secondary" onClick={() => setStep(1)}>Atrás</Button><Button full onClick={() => setStep(3)} disabled={adjustments.countedCash === ''}>Revisar</Button></div></>)}
    {step === 3 && (<><div className="space-y-3 mb-6"><div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl"><span className="text-sm text-slate-600 dark:text-slate-300">Bandejas Finales</span><span className="font-bold dark:text-white">{(shift?.bandejasSacadas || 0) + panAdjustmentNum}</span></div><div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl"><span className="text-sm text-slate-600 dark:text-slate-300">Dinero en Caja</span><div className="text-right"><p className="font-bold dark:text-white">{formatCurrency(countedCashNum)}</p><p className={`text-[10px] font-bold ${cashDifference === 0 ? '