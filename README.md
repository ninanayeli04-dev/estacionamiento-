# Sistema de Estacionamiento - El rapido

Sistema web desarrollado con Node.js, React y PostgreSQL.

## Cómo ejecutar el proyecto

### 1. Base de Datos (PostgreSQL)
Crear una base de datos llamada `estacionamiento` y ejecutar el siguiente script SQL:

```sql
CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    telefono VARCHAR(20),
    email VARCHAR(100),
    tipo_cliente VARCHAR(20) DEFAULT 'Visitante',
    estado VARCHAR(20) DEFAULT 'Activo'
);

CREATE TABLE vehiculos (
    id SERIAL PRIMARY KEY,
    placa VARCHAR(20) UNIQUE NOT NULL,
    marca VARCHAR(50),
    modelo VARCHAR(50),
    color VARCHAR(30),
    tipo VARCHAR(20),
    cliente_id INTEGER REFERENCES clientes(id), 
    estado VARCHAR(20) DEFAULT 'Activo'
);

CREATE TABLE espacios (
    id SERIAL PRIMARY KEY,
    piso VARCHAR(10),
    sector VARCHAR(10),
    numero VARCHAR(10),
    estado VARCHAR(20) DEFAULT 'Disponible',
    vehiculo_id INTEGER REFERENCES vehiculos(id)
);

CREATE TABLE tickets (
    id SERIAL PRIMARY KEY,
    vehiculo_id INTEGER REFERENCES vehiculos(id),
    espacio_id INTEGER REFERENCES espacios(id),
    hora_entrada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    hora_salida TIMESTAMP,
    total_pagado DECIMAL(10, 2) DEFAULT 0,
    estado VARCHAR(20) DEFAULT 'Abierto'
);

CREATE TABLE pagos (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER REFERENCES tickets(id),
    monto DECIMAL(10, 2) NOT NULL,
    metodo_pago VARCHAR(30),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
