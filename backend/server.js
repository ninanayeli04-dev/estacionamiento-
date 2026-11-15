const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// Obtener clientes
app.get('/api/clientes', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM clientes ORDER BY id DESC');
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Crear cliente
app.post('/api/clientes', async (req, res) => {
    try {
        const { nombre, telefono, email, tipo_cliente } = req.body;
        const result = await pool.query(
            'INSERT INTO clientes (nombre, telefono, email, tipo_cliente) VALUES ($1, $2, $3, $4) RETURNING *',
            [nombre, telefono, email, tipo_cliente]
        );
        res.json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Activar / Desactivar (Soft Delete)
app.put('/api/clientes/estado/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body; 
        await pool.query('UPDATE clientes SET estado = $1 WHERE id = $2', [estado, id]);
        res.json({ message: 'Estado actualizado' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});
// --- MÓDULO 2: VEHÍCULOS ---

// Obtener todos los vehículos con el nombre de su dueño (JOIN)
app.get('/api/vehiculos', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT v.*, c.nombre as cliente_nombre 
            FROM vehiculos v 
            LEFT JOIN clientes c ON v.cliente_id = c.id 
            ORDER BY v.id DESC
        `);
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Registrar un vehículo
app.post('/api/vehiculos', async (req, res) => {
    try {
        const { placa, marca, modelo, color, tipo, cliente_id } = req.body;
        const result = await pool.query(
            'INSERT INTO vehiculos (placa, marca, modelo, color, tipo, cliente_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [placa, marca, modelo, color, tipo, cliente_id]
        );
        res.json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Activar / Desactivar Vehículo
app.put('/api/vehiculos/estado/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body; 
        await pool.query('UPDATE vehiculos SET estado = $1 WHERE id = $2', [estado, id]);
        res.json({ message: 'Estado actualizado' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});
// --- MÓDULO 3: ESPACIOS ---

// Obtener todos los espacios (con datos del vehículo si está ocupado)
app.get('/api/espacios', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT e.*, v.placa as vehiculo_placa 
            FROM espacios e 
            LEFT JOIN vehiculos v ON e.vehiculo_id = v.id 
            ORDER BY e.piso ASC, e.sector ASC, e.numero ASC
        `);
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Crear un nuevo espacio
app.post('/api/espacios', async (req, res) => {
    try {
        const { piso, sector, numero } = req.body;
        
        // Validar si ya existe un espacio con ese piso, sector y número
        const existe = await pool.query(
            'SELECT * FROM espacios WHERE piso = $1 AND sector = $2 AND numero = $3',
            [piso, sector, numero]
        );
        
        if (existe.rows.length > 0) {
            return res.status(400).json({ error: 'Este espacio ya existe en ese piso y sector.' });
        }

        const result = await pool.query(
            'INSERT INTO espacios (piso, sector, numero) VALUES ($1, $2, $3) RETURNING *',
            [piso, sector, numero]
        );
        res.json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Cambiar estado del espacio (Disponible / Mantenimiento)
app.put('/api/espacios/:id/estado', async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body; 
        await pool.query('UPDATE espacios SET estado = $1 WHERE id = $2', [estado, id]);
        res.json({ message: 'Estado del espacio actualizado' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});
// --- MÓDULO 4: TICKETS (ENTRADAS Y SALIDAS) ---

// Obtener todos los tickets (con datos del auto y el espacio)
app.get('/api/tickets', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT t.*, v.placa, v.marca, e.numero as espacio_numero, e.piso, e.sector
            FROM tickets t
            JOIN vehiculos v ON t.vehiculo_id = v.id
            JOIN espacios e ON t.espacio_id = e.id
            ORDER BY t.id DESC
        `);
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Registrar ENTRADA (Ocupar un espacio)
app.post('/api/tickets/entrada', async (req, res) => {
    const client = await pool.connect();
    try {
        const { vehiculo_id, espacio_id } = req.body;
        await client.query('BEGIN'); // Iniciar transacción

        // 1. Crear el ticket
        const ticketResult = await client.query(
            'INSERT INTO tickets (vehiculo_id, espacio_id) VALUES ($1, $2) RETURNING *',
            [vehiculo_id, espacio_id]
        );

        // 2. Poner el espacio en Ocupado y asignarle el vehículo
        await client.query(
            'UPDATE espacios SET estado = $1, vehiculo_id = $2 WHERE id = $3',
            ['Ocupado', vehiculo_id, espacio_id]
        );

        await client.query('COMMIT'); // Guardar cambios
        res.json(ticketResult.rows[0]);
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});

// Registrar SALIDA (Liberar espacio y guardar en Caja)
app.put('/api/tickets/salida/:id', async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        const { total_pagado, metodo_pago } = req.body; // Agregamos el método de pago

        // 1. Actualizar el ticket
        await client.query(
            'UPDATE tickets SET hora_salida = CURRENT_TIMESTAMP, total_pagado = $1, estado = $2 WHERE id = $3',
            [total_pagado, 'Pagado', id]
        );

        // 2. Guardar en la tabla de PAGOS (Caja)
        // 2. Guardar en la tabla de PAGOS (Caja)
await client.query(
    'INSERT INTO pagos (ticket_id, monto, metodo_pago) VALUES ($1, $2, $3)',
    [id, total_pagado, metodo_pago]
);

        // 3. Obtener el ID del espacio para liberarlo
        const ticketInfo = await client.query('SELECT espacio_id FROM tickets WHERE id = $1', [id]);
        const espacio_id = ticketInfo.rows[0].espacio_id;

        // 4. Liberar el espacio
        await client.query(
            'UPDATE espacios SET estado = $1, vehiculo_id = NULL WHERE id = $2',
            ['Disponible', espacio_id]
        );

        res.json({ message: 'Salida y pago registrados con éxito' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});
// --- MÓDULO 5: CAJA ---
app.get('/api/caja', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT p.id as pago_id, p.monto, p.metodo_pago, p.fecha, 
                   v.placa, t.id as ticket_id
            FROM pagos p
            JOIN tickets t ON p.ticket_id = t.id
            JOIN vehiculos v ON t.vehiculo_id = v.id
            ORDER BY p.id DESC
        `);
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.listen(process.env.PORT, () => {
    console.log(`Servidor backend en http://localhost:${process.env.PORT}`);
});