import { useState, useEffect } from 'react';
import axios from 'axios';
import { Car, Wrench, CheckCircle, PlusCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function Espacios() {
  const [espacios, setEspacios] = useState([]);
  const [form, setForm] = useState({ piso: '', sector: '', numero: '' });

  const API_URL = 'http://localhost:3001/api';

  const cargarEspacios = async () => {
    const res = await axios.get(`${API_URL}/espacios`);
    setEspacios(res.data);
  };

  useEffect(() => { cargarEspacios(); }, []);

   const guardar = async (e) => {
    e.preventDefault();
    try {
        await axios.post(`${API_URL}/espacios`, form);
        setForm({ piso: '', sector: '', numero: '' });
        cargarEspacios();
    } catch (error) {
        alert(error.response?.data?.error || 'Error al guardar el espacio');
    }
  };

    const cambiarEstado = async (id) => {
    // Buscamos el espacio actual por su ID para saber en qué estado está
    const espacioActual = espacios.find(e => e.id === id);
    if (!espacioActual) return;

    const nuevoEstado = espacioActual.estado === 'Disponible' ? 'Mantenimiento' : 'Disponible';
    
    try {
        await axios.put(`${API_URL}/espacios/${id}/estado`, { estado: nuevoEstado });
        cargarEspacios();
    } catch (error) {
        console.error("Error al cambiar estado", error);
    }
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.text("Reporte de Espacios de Estacionamiento", 14, 15);
    const tableColumn = ["ID", "Piso", "Sector", "Número", "Estado", "Vehículo"];
    const tableRows = espacios.map(e => [e.id, e.piso, e.sector, e.numero, e.estado, e.vehiculo_placa || 'Ninguno']);
    autoTable(doc, { head: [tableColumn], body: tableRows, startY: 20 });
    doc.save("reporte_espacios.pdf");
  };

  const pisosUnicos = [...new Set(espacios.map(e => e.piso))].sort();

  // Componente visual para el pilar de concreto
  const Pilar = () => (
    <div style={{
      width: '30px', height: '160px', 
      background: 'repeating-linear-gradient(45deg, #facc15, #facc15 10px, #1e293b 10px, #1e293b 20px)',
      border: '2px solid #cbd5e1', borderRadius: '4px', margin: '0 10px',
      boxShadow: '0 8px 12px rgba(0,0,0,0.5)', zIndex: 5
    }}></div>
  );

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Encabezado */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #e2e8f0', paddingBottom: '15px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#1e293b', margin: 0 }}>Plano de Estacionamiento</h1>
          <p style={{ fontSize: '15px', color: '#64748b', margin: '5px 0 0 0' }}>Monitoreo visual - Sincronización en vivo</p>
        </div>
        <button onClick={exportarPDF} style={{ backgroundColor: '#dc2626', color: 'white', padding: '12px 24px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 6px rgba(220,38,38,0.3)' }}>
          Exportar PDF
        </button>
      </div>

            {/* Formulario para agregar espacio */}
      <form onSubmit={guardar} style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
        gap: '15px', 
        backgroundColor: '#f8fafc', 
        padding: '20px', 
        borderRadius: '12px', 
        marginBottom: '40px', 
        border: '1px solid #e2e8f0', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)' 
      }}>
        <input type="text" placeholder="Piso (Ej. 1)" required style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
          value={form.piso} onChange={e => setForm({...form, piso: e.target.value})} />
        <input type="text" placeholder="Sector (Ej. A)" required style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
          value={form.sector} onChange={e => setForm({...form, sector: e.target.value.toUpperCase()})} />
        <input type="text" placeholder="Número (Ej. A1)" required style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
          value={form.numero} onChange={e => setForm({...form, numero: e.target.value.toUpperCase()})} />
        <button type="submit" style={{ backgroundColor: '#2563eb', color: 'white', padding: '12px 24px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 6px rgba(37,99,235,0.3)' }}>
          <PlusCircle size={20}/> Agregar
        </button>
      </form>

      {/* PLANO DEL ESTACIONAMIENTO */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '50px' }}>
        {pisosUnicos.map(piso => (
          <div key={piso} style={{ position: 'relative' }}>
            
            {/* Letrero del Piso colgante */}
            <div style={{ position: 'absolute', top: '-20px', left: '40px', backgroundColor: '#0f172a', color: 'white', padding: '8px 30px', borderRadius: '8px', fontWeight: '900', fontSize: '20px', zIndex: 10, boxShadow: '0 4px 10px rgba(0,0,0,0.5)', borderBottom: '4px solid #3b82f6' }}>
              PISO {piso}
            </div>

            {/* Área de Asfalto */}
            <div style={{ 
              backgroundColor: '#334155', 
              backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)', // Textura de asfalto
              backgroundSize: '20px 20px',
              padding: '60px 20px 30px 20px', 
              borderRadius: '16px', 
              border: '6px solid #1e293b', 
              position: 'relative',
              boxShadow: 'inset 0 0 50px rgba(0,0,0,0.5)'
            }}>
              
              {/* Calle Central */}
              <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '60px', backgroundColor: '#1e293b', transform: 'translateY(-50%)', zIndex: 0, borderTop: '2px solid #475569', borderBottom: '2px solid #475569' }}>
                {/* Línea amarilla punteada */}
                <div style={{ height: '100%', width: '8px', backgroundImage: 'linear-gradient(to bottom, #facc15 50%, transparent 50%)', backgroundSize: '8px 30px', margin: '0 auto' }}></div>
                {/* Flechas en el piso */}
                <div style={{ position: 'absolute', top: '15px', left: '20%', color: '#facc15', fontSize: '24px', opacity: 0.6 }}>➡️</div>
                <div style={{ position: 'absolute', top: '15px', left: '50%', color: '#facc15', fontSize: '24px', opacity: 0.6 }}>➡️</div>
                <div style={{ position: 'absolute', top: '15px', left: '80%', color: '#facc15', fontSize: '24px', opacity: 0.6 }}>➡️</div>
              </div>

              {/* Fila Superior (Autos mirando hacia el centro) */}
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', marginBottom: '60px', position: 'relative', zIndex: 1 }}>
                <Pilar />
                {espacios.filter(e => e.piso === piso && e.sector === 'A').map(e => (
                  <div key={e.id} style={{ 
                    width: '110px', height: '160px', 
                    background: 'linear-gradient(to bottom, #0f172a, #1e293b)',
                    borderTop: '2px solid #94a3b8', borderLeft: '4px solid white', borderRight: '4px solid white', borderBottom: '4px solid white',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px', margin: '0 4px', borderRadius: '0 0 6px 6px', // Redondeado abajo
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.4)',
                    position: 'relative'
                  }}>
                    
                    {/* Luz led superior */}
                    <div style={{ position: 'absolute', top: '5px', width: '40px', height: '6px', borderRadius: '3px', backgroundColor: e.estado === 'Disponible' ? '#4ade80' : e.estado === 'Ocupado' ? '#ef4444' : '#facc15', boxShadow: `0 0 10px ${e.estado === 'Disponible' ? '#4ade80' : e.estado === 'Ocupado' ? '#ef4444' : '#facc15'}` }}></div>

                    <span style={{ color: 'white', fontWeight: 'bold', fontSize: '18px', marginTop: '15px' }}>{e.numero}</span>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      {e.estado === 'Ocupado' ? (
                        <>
                          <Car size={36} color="#ef4444" />
                          <span style={{ color: 'white', fontSize: '11px', backgroundColor: '#ef4444', padding: '2px 8px', borderRadius: '4px', marginTop: '5px', fontWeight: 'bold' }}>{e.vehiculo_placa}</span>
                        </>
                      ) : e.estado === 'Mantenimiento' ? (
                        <>
                          <Wrench size={32} color="#facc15" />
                          <span style={{ color: '#facc15', fontSize: '10px', fontWeight: 'bold', marginTop: '5px' }}>MANTENIMIENTO</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle size={32} color="#4ade80" />
                          <span style={{ color: '#4ade80', fontSize: '11px', fontWeight: 'bold', marginTop: '5px' }}>LIBRE</span>
                        </>
                      )}
                    </div>

                    {/* Botón de mantenimiento */}
                    {e.estado !== 'Ocupado' && (
  <button onClick={() => cambiarEstado(e.id)} 
    style={{ position: 'absolute', bottom: '8px', right: '8px', backgroundColor: '#1e293b', border: '1px solid #64748b', borderRadius: '6px', padding: '6px', cursor: 'pointer', zIndex: 10 }}>
    <Wrench size={18} color={e.estado === 'Mantenimiento' ? '#facc15' : '#cbd5e1'} />
  </button>
)}
                  </div>
                ))}
                <Pilar />
              </div>

              {/* Fila Inferior (Autos mirando hacia el centro) */}
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                <Pilar />
                {espacios.filter(e => e.piso === piso && e.sector === 'B').map(e => (
                  <div key={e.id} style={{ 
                    width: '110px', height: '160px', 
                    background: 'linear-gradient(to top, #0f172a, #1e293b)',
                    borderBottom: '2px solid #94a3b8', borderLeft: '4px solid white', borderRight: '4px solid white', borderTop: '4px solid white',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px', margin: '0 4px', borderRadius: '6px 6px 0 0',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.4)',
                    position: 'relative'
                  }}>
                    
                    {/* Luz led inferior */}
                    <div style={{ position: 'absolute', bottom: '5px', width: '40px', height: '6px', borderRadius: '3px', backgroundColor: e.estado === 'Disponible' ? '#4ade80' : e.estado === 'Ocupado' ? '#ef4444' : '#facc15', boxShadow: `0 0 10px ${e.estado === 'Disponible' ? '#4ade80' : e.estado === 'Ocupado' ? '#ef4444' : '#facc15'}` }}></div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '10px' }}>
                      {e.estado === 'Ocupado' ? (
                        <>
                          <Car size={36} color="#ef4444" />
                          <span style={{ color: 'white', fontSize: '11px', backgroundColor: '#ef4444', padding: '2px 8px', borderRadius: '4px', marginTop: '5px', fontWeight: 'bold' }}>{e.vehiculo_placa}</span>
                        </>
                      ) : e.estado === 'Mantenimiento' ? (
                        <>
                          <Wrench size={32} color="#facc15" />
                          <span style={{ color: '#facc15', fontSize: '10px', fontWeight: 'bold', marginTop: '5px' }}>MANTENIMIENTO</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle size={32} color="#4ade80" />
                          <span style={{ color: '#4ade80', fontSize: '11px', fontWeight: 'bold', marginTop: '5px' }}>LIBRE</span>
                        </>
                      )}
                    </div>

                    <span style={{ color: 'white', fontWeight: 'bold', fontSize: '18px', marginBottom: '15px' }}>{e.numero}</span>

                    {e.estado !== 'Ocupado' && (
  <button onClick={() => cambiarEstado(e.id)} 
    style={{ position: 'absolute', top: '8px', right: '8px', backgroundColor: '#1e293b', border: '1px solid #64748b', borderRadius: '6px', padding: '6px', cursor: 'pointer', zIndex: 10 }}>
    <Wrench size={18} color={e.estado === 'Mantenimiento' ? '#facc15' : '#cbd5e1'} />
  </button>
)}
                  </div>
                ))}
                <Pilar />
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}