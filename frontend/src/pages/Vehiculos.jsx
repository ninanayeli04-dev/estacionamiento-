import { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function Vehiculos() {
  const [vehiculos, setVehiculos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [form, setForm] = useState({ placa: '', marca: '', modelo: '', color: '', tipo: 'Auto', cliente_id: '' });

  const API_URL = 'http://localhost:3001/api';

  const cargarDatos = async () => {
    const resV = await axios.get(`${API_URL}/vehiculos`);
    const resC = await axios.get(`${API_URL}/clientes`);
    setVehiculos(resV.data);
    // Solo mostramos clientes activos en el select
    setClientes(resC.data.filter(c => c.estado === 'Activo')); 
  };

  useEffect(() => { cargarDatos(); }, []);

  const guardar = async (e) => {
    e.preventDefault();
    // Si cliente_id está vacío, lo mandamos como null para la base de datos
    const dataAEnviar = { ...form, cliente_id: form.cliente_id === '' ? null : form.cliente_id };
    await axios.post(`${API_URL}/vehiculos`, dataAEnviar);
    setForm({ placa: '', marca: '', modelo: '', color: '', tipo: 'Auto', cliente_id: '' });
    cargarDatos();
  };

  const cambiarEstado = async (id, estadoActual) => {
    const nuevoEstado = estadoActual === 'Activo' ? 'Inactivo' : 'Activo';
    await axios.put(`${API_URL}/vehiculos/estado/${id}`, { estado: nuevoEstado });
    cargarDatos();
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.text("Reporte de Vehículos - Estacionamiento", 14, 15);
    const tableColumn = ["ID", "Placa", "Marca", "Modelo", "Tipo", "Dueño", "Estado"];
    const tableRows = vehiculos.map(v => [v.id, v.placa, v.marca, v.modelo, v.tipo, v.cliente_nombre || 'Visitante', v.estado]);
    autoTable(doc, { head: [tableColumn], body: tableRows, startY: 20 });
    doc.save("reporte_vehiculos.pdf");
  };

  return (
    <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Vehículos</h1>
        <button onClick={exportarPDF} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition">
          Exportar PDF
        </button>
      </div>

      {/* Formulario */}
      <form onSubmit={guardar} className="grid grid-cols-3 gap-4 mb-8 bg-blue-50 p-4 rounded-lg">
        <input type="text" placeholder="Placa (Ej. ABC-123)" required className="border p-2 rounded"
          value={form.placa} onChange={e => setForm({...form, placa: e.target.value.toUpperCase()})} />
        <input type="text" placeholder="Marca" className="border p-2 rounded"
          value={form.marca} onChange={e => setForm({...form, marca: e.target.value})} />
        <input type="text" placeholder="Modelo" className="border p-2 rounded"
          value={form.modelo} onChange={e => setForm({...form, modelo: e.target.value})} />
        <input type="text" placeholder="Color" className="border p-2 rounded"
          value={form.color} onChange={e => setForm({...form, color: e.target.value})} />
        
        <select className="border p-2 rounded" value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})}>
          <option value="Auto">Auto</option>
          <option value="Moto">Moto</option>
          <option value="Camioneta">Camioneta</option>
        </select>

        <select className="border p-2 rounded" value={form.cliente_id} onChange={e => setForm({...form, cliente_id: e.target.value})}>
          <option value="">-- Sin dueño (Visitante) --</option>
          {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded col-span-3 hover:bg-blue-700 transition font-bold">
          + Registrar Vehículo
        </button>
      </form>

      {/* Tabla */}
      <table className="w-full text-left">
        <thead className="bg-gray-800 text-white">
          <tr>
            <th className="p-3">Placa</th>
            <th className="p-3">Marca / Modelo</th>
            <th className="p-3">Tipo</th>
            <th className="p-3">Dueño</th>
            <th className="p-3">Estado</th>
            <th className="p-3 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {vehiculos.map(v => (
            <tr key={v.id} className={v.estado === 'Inactivo' ? 'bg-gray-100 text-gray-400' : ''}>
              <td className="p-3 font-bold text-lg">{v.placa}</td>
              <td className="p-3">{v.marca} {v.modelo}</td>
              <td className="p-3">{v.tipo}</td>
              <td className="p-3">{v.cliente_nombre || 'Visitante'}</td>
              <td className="p-3">
                <span className={`px-2 py-1 rounded text-xs font-bold ${v.estado === 'Activo' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                  {v.estado}
                </span>
              </td>
              <td className="p-3 text-center">
                <button onClick={() => cambiarEstado(v.id, v.estado)} 
                  className={`px-3 py-1 rounded text-white text-sm ${v.estado === 'Activo' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}>
                  {v.estado === 'Activo' ? 'Desactivar' : 'Activar'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}