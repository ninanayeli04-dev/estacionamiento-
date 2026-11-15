import { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [form, setForm] = useState({ nombre: '', telefono: '', email: '', tipo_cliente: 'Visitante' });

  const API_URL = 'http://localhost:3001/api/clientes';

  const cargarClientes = async () => {
    const res = await axios.get(API_URL);
    setClientes(res.data);
  };

  useEffect(() => { cargarClientes(); }, []);

  const guardar = async (e) => {
    e.preventDefault();
    await axios.post(API_URL, form);
    setForm({ nombre: '', telefono: '', email: '', tipo_cliente: 'Visitante' });
    cargarClientes();
  };

  const cambiarEstado = async (id, estadoActual) => {
    const nuevoEstado = estadoActual === 'Activo' ? 'Inactivo' : 'Activo';
    await axios.put(`${API_URL}/estado/${id}`, { estado: nuevoEstado });
    cargarClientes();
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.text("Reporte de Clientes - Estacionamiento", 14, 15);
    const tableColumn = ["ID", "Nombre", "Teléfono", "Email", "Tipo", "Estado"];
    const tableRows = clientes.map(c => [c.id, c.nombre, c.telefono, c.email, c.tipo_cliente, c.estado]);
    autoTable(doc, {
  head: [tableColumn],
  body: tableRows,
  startY: 20,
});
    doc.save("reporte_clientes.pdf");
  };

  return (
    <div className="max-w-5xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Clientes</h1>
        <button onClick={exportarPDF} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition">
          Exportar PDF
        </button>
      </div>

      <form onSubmit={guardar} className="grid grid-cols-4 gap-4 mb-8 bg-blue-50 p-4 rounded-lg">
        <input type="text" placeholder="Nombre completo" required className="border p-2 rounded"
          value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} />
        <input type="text" placeholder="Teléfono" className="border p-2 rounded"
          value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})} />
        <input type="email" placeholder="Correo" className="border p-2 rounded"
          value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
        <select className="border p-2 rounded" value={form.tipo_cliente} onChange={e => setForm({...form, tipo_cliente: e.target.value})}>
          <option value="Visitante">Visitante</option>
          <option value="Habitual">Habitual</option>
        </select>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded col-span-4 hover:bg-blue-700 transition font-bold">
          + Registrar Cliente
        </button>
      </form>

      <table className="w-full text-left">
        <thead className="bg-gray-800 text-white">
          <tr>
            <th className="p-3">ID</th>
            <th className="p-3">Nombre</th>
            <th className="p-3">Teléfono</th>
            <th className="p-3">Tipo</th>
            <th className="p-3">Estado</th>
            <th className="p-3 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {clientes.map(c => (
            <tr key={c.id} className={c.estado === 'Inactivo' ? 'bg-gray-100 text-gray-400' : ''}>
              <td className="p-3">{c.id}</td>
              <td className="p-3 font-semibold">{c.nombre}</td>
              <td className="p-3">{c.telefono}</td>
              <td className="p-3">{c.tipo_cliente}</td>
              <td className="p-3">
                <span className={`px-2 py-1 rounded text-xs font-bold ${c.estado === 'Activo' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                  {c.estado}
                </span>
              </td>
              <td className="p-3 text-center">
                <button onClick={() => cambiarEstado(c.id, c.estado)} 
                  className={`px-3 py-1 rounded text-white text-sm ${c.estado === 'Activo' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}>
                  {c.estado === 'Activo' ? 'Desactivar' : 'Activar'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}