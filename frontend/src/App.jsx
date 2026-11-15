import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Car } from 'lucide-react'; // <-- Importamos el icono del auto
import Clientes from './pages/Clientes';
import Vehiculos from './pages/Vehiculos';
import Espacios from './pages/Espacios';
import Tickets from './pages/Tickets';
import Caja from './pages/Caja'; 

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen bg-gray-100 font-sans">
        {/* Menú Lateral (Sidebar) */}
        <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl">
          
          {/* Encabezado del Menú Corregido */}
          <div className="p-6 flex flex-col items-center justify-center border-b border-slate-700">
            <Car size={40} className="text-blue-500 mb-3" />
            <h1 className="text-lg font-black text-center leading-tight uppercase tracking-wide">
              Estacionamiento <br />
              <span className="text-blue-400 text-xl">"El Rápido"</span>
            </h1>
          </div>
          
          {/* Enlaces de Navegación */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <Link to="/" className="block p-3 rounded-lg hover:bg-slate-800 transition">
              👥 Clientes
            </Link>
            <Link to="/vehiculos" className="block p-3 rounded-lg hover:bg-slate-800 transition">
              🚗 Vehículos
            </Link>
            <Link to="/espacios" className="block p-3 rounded-lg hover:bg-slate-800 transition">
              🅿️ Espacios
            </Link>
            <Link to="/tickets" className="block p-3 rounded-lg hover:bg-slate-800 transition">
              🎟️ Entradas / Salidas
            </Link>
            <Link to="/caja" className="block p-3 rounded-lg hover:bg-slate-800 transition font-bold text-green-400">
              💵 Caja / Cobros
            </Link>
          </nav>
        </aside>

        {/* Contenido Principal */}
        <main className="flex-1 p-8 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Clientes />} />
            <Route path="/vehiculos" element={<Vehiculos />} />
            <Route path="/espacios" element={<Espacios />} />
            <Route path="/tickets" element={<Tickets />} />
            <Route path="/caja" element={<Caja />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}