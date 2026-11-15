import { useState, useEffect } from 'react';
import axios from 'axios';
import { LogIn, LogOut, Clock } from 'lucide-react';

export default function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [espaciosLibres, setEspaciosLibres] = useState([]);
  const [form, setForm] = useState({ vehiculo_id: '', espacio_id: '' });

  const API_URL = 'http://localhost:3001/api';

  const cargarDatos = async () => {
    const resT = await axios.get(`${API_URL}/tickets`);
    const resV = await axios.get(`${API_URL}/vehiculos`);
    const resE = await axios.get(`${API_URL}/espacios`);
    
    setTickets(resT.data);
    // Solo mostrar vehículos activos
    setVehiculos(resV.data.filter(v => v.estado === 'Activo'));
    // Solo mostrar espacios disponibles
    setEspaciosLibres(resE.data.filter(e => e.estado === 'Disponible'));
  };

  useEffect(() => { cargarDatos(); }, []);

  const registrarEntrada = async (e) => {
    e.preventDefault();
    await axios.post(`${API_URL}/tickets/entrada`, form);
    setForm({ vehiculo_id: '', espacio_id: '' });
    cargarDatos();
  };

      const registrarSalida = async (id) => {
    try {
      // Vamos a cobrar un monto fijo de 10 Bs en efectivo para la prueba
      const confirmar = window.confirm("¿Desea cobrar 10 Bs en efectivo y liberar el espacio?");
      
      if (confirmar) {
        await axios.put(`${API_URL}/tickets/salida/${id}`, { 
          total_pagado: 10, 
          metodo_pago: 'Efectivo' 
        });
        alert("¡Cobro registrado con éxito!");
        cargarDatos();
      }
    } catch (error) {
      console.error("Error al cobrar:", error);
      alert("Hubo un error al cobrar. Revisa la consola (F12).");
    }
  };

  return (
    <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Control de Entradas y Salidas</h1>

      {/* Formulario de Entrada */}
      <form onSubmit={registrarEntrada} className="flex gap-4 mb-8 bg-blue-50 p-4 rounded-lg items-end">
        <div className="flex-1">
          <label className="block text-sm font-bold mb-1">Vehículo</label>
          <select required className="w-full border p-2 rounded" value={form.vehiculo_id} onChange={e => setForm({...form, vehiculo_id: e.target.value})}>
            <option value="">Seleccione un vehículo...</option>
            {vehiculos.map(v => <option key={v.id} value={v.id}>{v.placa} - {v.marca}</option>)}
          </select>
        </div>
        
        <div className="flex-1">
          <label className="block text-sm font-bold mb-1">Asignar Espacio Libre</label>
          <select required className="w-full border p-2 rounded" value={form.espacio_id} onChange={e => setForm({...form, espacio_id: e.target.value})}>
            <option value="">Seleccione un espacio...</option>
            {espaciosLibres.map(e => <option key={e.id} value={e.id}>Piso {e.piso} - {e.numero}</option>)}
          </select>
        </div>

        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition font-bold flex items-center gap-2">
          <LogIn size={18}/> Registrar Entrada
        </button>
      </form>

      {/* Tabla de Tickets */}
      <table className="w-full text-left">
        <thead className="bg-gray-800 text-white">
          <tr>
            <th className="p-3">Ticket</th>
            <th className="p-3">Vehículo</th>
            <th className="p-3">Espacio</th>
            <th className="p-3">Hora Entrada</th>
            <th className="p-3">Estado</th>
            <th className="p-3 text-center">Acción</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {tickets.map(t => (
            <tr key={t.id} className={t.estado === 'Pagado' ? 'bg-gray-50' : ''}>
              <td className="p-3 font-bold">#{t.id}</td>
              <td className="p-3 font-bold text-blue-700">{t.placa}</td>
              <td className="p-3">Piso {t.piso} - {t.espacio_numero}</td>
              <td className="p-3 text-sm">{new Date(t.hora_entrada).toLocaleString()}</td>
              <td className="p-3">
                <span className={`px-2 py-1 rounded text-xs font-bold ${t.estado === 'Abierto' ? 'bg-yellow-200 text-yellow-800' : 'bg-green-200 text-green-800'}`}>
                  {t.estado}
                </span>
              </td>
              <td className="p-3 text-center">
                {t.estado === 'Abierto' ? (
                  <button onClick={() => registrarSalida(t.id)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1 mx-auto transition">
                    <LogOut size={14}/> Cobrar Salida
                  </button>
                ) : (
                  <span className="text-green-600 font-bold text-sm">Pagado: Bs. {t.total_pagado}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}