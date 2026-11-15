import { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function Caja() {
  const [pagos, setPagos] = useState([]);
  const API_URL = 'http://localhost:3001/api';

  useEffect(() => {
    const cargarPagos = async () => {
      try {
        const res = await axios.get(`${API_URL}/caja`);
        setPagos(res.data);
      } catch (error) {
        console.error("Error al cargar caja", error);
      }
    };
    cargarPagos();
  }, []);

  // Calcular total recaudado
  const totalRecaudado = pagos.reduce((acc, p) => acc + Number(p.monto || 0), 0);

  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.text("Reporte de Caja - Estacionamiento", 14, 15);
    doc.text(`Total Recaudado: Bs. ${totalRecaudado.toFixed(2)}`, 14, 25);
    
    const tableColumn = ["Nro. Recibo", "Fecha", "Placa Vehículo", "Método", "Monto (Bs)"];
    const tableRows = pagos.map(p => [
      p.pago_id, 
      new Date(p.fecha).toLocaleString(), 
      p.placa, 
      p.metodo_pago, 
      `Bs. ${p.monto}`
    ]);

    autoTable(doc, { head: [tableColumn], body: tableRows, startY: 30 });
    doc.save("reporte_caja.pdf");
  };

  return (
    <div className="max-w-5xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Historial de Caja</h1>
        <button onClick={exportarPDF} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition flex items-center gap-2 font-bold">
          <FileText size={18} /> Exportar PDF
        </button>
      </div>

      {/* Tarjeta de Total Recaudado */}
      <div className="bg-green-100 border-l-4 border-green-500 p-6 mb-8 rounded-r-lg flex items-center justify-between">
        <div>
          <p className="text-green-700 font-bold text-lg uppercase tracking-wide">Ingresos Totales</p>
          <p className="text-sm text-green-600 mt-1">Dinero recaudado por concepto de tarifas</p>
        </div>
        <div className="text-4xl font-black text-green-700 flex items-center gap-2">
          Bs. {totalRecaudado.toFixed(2)}
        </div>
      </div>

      {/* Tabla de Pagos */}
      <table className="w-full text-left">
        <thead className="bg-gray-800 text-white">
          <tr>
            <th className="p-3">Nro. Recibo</th>
            <th className="p-3">Fecha y Hora</th>
            <th className="p-3">Vehículo</th>
            <th className="p-3">Método de Pago</th>
            <th className="p-3 text-right">Monto</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {pagos.map(p => (
            <tr key={p.pago_id} className="hover:bg-gray-50">
              <td className="p-3 font-bold text-gray-700">#{p.pago_id}</td>
              <td className="p-3 text-gray-600">{new Date(p.fecha).toLocaleString()}</td>
              <td className="p-3 font-bold text-blue-700">{p.placa}</td>
              <td className="p-3">
                <span className={`px-2 py-1 rounded text-xs font-bold ${p.metodo_pago === 'Efectivo' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                  {p.metodo_pago}
                </span>
              </td>
              <td className="p-3 text-right font-bold text-gray-800">Bs. {p.monto}</td>
            </tr>
          ))}
          {pagos.length === 0 && (
            <tr><td colSpan="5" className="p-6 text-center text-gray-500">Aún no hay cobros registrados</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}