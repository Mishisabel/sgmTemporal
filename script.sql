-- Eliminar tablas si ya existen (para pruebas)
DROP TABLE IF EXISTS OT_Repuestos CASCADE;
DROP TABLE IF EXISTS HistorialHorometros CASCADE;
DROP TABLE IF EXISTS OrdenesTrabajo CASCADE;
DROP TABLE IF EXISTS Maquinaria CASCADE;
DROP TABLE IF EXISTS Frentes CASCADE;
DROP TABLE IF EXISTS Repuestos CASCADE;
DROP TABLE IF EXISTS Proveedores CASCADE;
DROP TABLE IF EXISTS Usuarios CASCADE;
DROP TABLE IF EXISTS Roles CASCADE;
DROP TABLE IF EXISTS TiposMantenimiento CASCADE;
DROP TABLE IF EXISTS estado CASCADE;
DROP TABLE IF EXISTS ProveedorMaquinaria cascade;

-- 1. Entidades de Catálogo (Independientes)
CREATE TABLE Roles (
    rol_id SERIAL PRIMARY KEY,
    nombre_rol VARCHAR(50) NOT NULL UNIQUE -- (Ej. "Operador", "Analista", "Coordinador")
);

CREATE TABLE TiposMantenimiento (
    tipo_mtto_id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE -- (Ej. "Preventivo", "Correctivo", "Predictivo")
);

CREATE TABLE Proveedores (
    proveedor_id SERIAL PRIMARY KEY,
    nombre_proveedor VARCHAR(100) NOT NULL,
    contacto VARCHAR(100),
    telefono VARCHAR(20),
    email VARCHAR(100)
);

-- 2. Entidades de Usuarios e Inventario
CREATE TABLE Usuarios (
    usuario_id SERIAL PRIMARY KEY,
    rol_id INT NOT NULL,
    nombre_usuario VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL, -- Siempre almacenar contraseñas hasheadas
    nombre_completo VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    FOREIGN KEY (rol_id) REFERENCES Roles(rol_id)
);

CREATE TABLE Repuestos (
    repuesto_id SERIAL PRIMARY KEY,
    proveedor_id INT,
    codigo_repuesto VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    stock_actual INT NOT NULL DEFAULT 0,
    stock_minimo INT NOT NULL DEFAULT 0,
    ubicacion_almacen VARCHAR(100),
    FOREIGN KEY (proveedor_id) REFERENCES Proveedores(proveedor_id) ON DELETE SET NULL
);

CREATE TABLE ProveedorMaquinaria(
    id_proveedor  SERIAL PRIMARY KEY,
    nombre_proveedor_maquinaria VARCHAR(100) NOT NULL UNIQUE,
    contacto VARCHAR(100),
    telefono VARCHAR(20),
    email VARCHAR(100)
);

CREATE TABLE Frentes (
    frente_id SERIAL PRIMARY KEY,
    analista_id INT,
    nombre_frente VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    proveedor_id INT,
    FOREIGN KEY (analista_id) REFERENCES Usuarios(usuario_id) ON DELETE SET NULL,
    FOREIGN KEY (proveedor_id) REFERENCES ProveedorMaquinaria(id_proveedor) ON DELETE SET NULL
);

create table estado(
id_estado serial primary key,
estado varchar(50)
);

CREATE TABLE Maquinaria (
    maquinaria_id SERIAL PRIMARY KEY,
    frente_id INT, -- Frente al que está asignada la máquina
    codigo_activo VARCHAR(50) NOT NULL UNIQUE,
    nombre_equipo VARCHAR(100) NOT NULL,
    modelo VARCHAR(50),
    fabricante VARCHAR(50),
    fecha_adquisicion DATE,
    estado_actual INT NOT NULL DEFAULT 0, -- (Ej. "Operativa", "En Mantenimiento")
    horometro_actual DECIMAL(10, 2) NOT NULL DEFAULT 0.0,
    horometro_ultimo_mtto DECIMAL(10, 2) NOT NULL DEFAULT 0.0,
    horometro_prox_mtto DECIMAL(10, 2) NOT NULL DEFAULT 0.0,
    FOREIGN KEY (frente_id) REFERENCES Frentes(frente_id) ON DELETE SET NULL,
	FOREIGN KEY (estado_actual) REFERENCES estado(id_estado) ON DELETE SET NULL
);

CREATE TABLE prioridad(
    id_prioridad serial primary key,
    nivel_prioridad varchar(50)
);

-- 4. Entidades Transaccionales (Órdenes de Trabajo y Logs)
CREATE TABLE OrdenesTrabajo (
    ot_id SERIAL PRIMARY KEY,
    maquinaria_id INT NOT NULL,
    tipo_mtto_id INT NOT NULL,
    solicitante_id INT NOT NULL,
    tecnico_asignado_id INT, -- Usuario (técnico) que realiza el trabajo
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_programada DATE,
    fecha_cierre TIMESTAMP,
    descripcion_falla TEXT,
    trabajo_realizado TEXT,
    estado_ot INT NOT NULL DEFAULT 0,
    prioridad_ot INT NOT NULL DEFAULT 0,
    
    FOREIGN KEY (maquinaria_id) REFERENCES Maquinaria(maquinaria_id) ON DELETE CASCADE,
    FOREIGN KEY (tipo_mtto_id) REFERENCES TiposMantenimiento(tipo_mtto_id),
    FOREIGN KEY (solicitante_id) REFERENCES Usuarios(usuario_id) ON DELETE RESTRICT,
    FOREIGN KEY (tecnico_asignado_id) REFERENCES Usuarios(usuario_id) ON DELETE SET NULL,
	FOREIGN KEY (estado_ot) REFERENCES estado(id_estado) ON DELETE SET NULL
    FOREIGN KEY (prioridad_ot) REFERENCES prioridad(id_prioridad) ON DELETE SET NULL
);

CREATE TABLE HistorialHorometros (
    log_id SERIAL PRIMARY KEY,
    maquinaria_id INT NOT NULL,
    operador_id INT NOT NULL, -- Usuario (operador) que registra la lectura
    lectura_horometro DECIMAL(10, 2) NOT NULL,
    fecha_lectura TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (maquinaria_id) REFERENCES Maquinaria(maquinaria_id) ON DELETE CASCADE,
    FOREIGN KEY (operador_id) REFERENCES Usuarios(usuario_id) ON DELETE RESTRICT
);

-- 5. Tabla Intermedia (Junction Table) para la relación M:N
CREATE TABLE OT_Repuestos (
    ot_repuesto_id SERIAL PRIMARY KEY,
    ot_id INT NOT NULL,
    repuesto_id INT NOT NULL,
    cantidad_usada INT NOT NULL,
    
    FOREIGN KEY (ot_id) REFERENCES OrdenesTrabajo(ot_id) ON DELETE CASCADE,
    FOREIGN KEY (repuesto_id) REFERENCES Repuestos(repuesto_id) ON DELETE RESTRICT,
    UNIQUE(ot_id, repuesto_id) -- Evita duplicar el mismo repuesto en la misma OT
);

CREATE TABLE Mensajes (
    mensaje_id SERIAL PRIMARY KEY,
    remitente_id INT NOT NULL,  -- Quien envía (Usuario ID)
    destinatario_id INT NOT NULL, -- Quien recibe (Usuario ID)
    cuerpo TEXT NOT NULL,
    fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    leido BOOLEAN DEFAULT FALSE,
    
    FOREIGN KEY (remitente_id) REFERENCES Usuarios(usuario_id) ON DELETE CASCADE,
    FOREIGN KEY (destinatario_id) REFERENCES Usuarios(usuario_id) ON DELETE CASCADE
);

-- Insertar datos base (Roles)
INSERT INTO Roles (nombre_rol) VALUES ('Operador'), ('Analista'), ('Coordinador'), ('Gerencia'), ('Técnico');
INSERT INTO TiposMantenimiento (nombre) VALUES ('Preventivo'), ('Correctivo'), ('Predictivo'), ('Programado');
INSERT INTO estado (estado) VALUES ('Activo'), ('Cerrado'), ('En proceso'), ('Inactivo'),('Abierto'),('Productivo'),('Improductivo');
--agregar de ultimo, despues de crear usuarios y verificar id de cada usuario
INSERT INTO proveedormaquinaria(nombre_proveedor_maquinaria, contacto, telefono, email) VALUES ('Tecun', 'Juan Perez', '555-1234', 'juan.perez@example.com'),('cogecasa', 'pedro paz', '555-1234', 'Ppaz@example.com'), ('Madrisa', 'duglas cetino', '555-1234', 'dcetino@example.com');
INSERT INTO frentes(analista_id,nombre_frente, descripcion, proveedor_id) VALUES (3,'Frente 15','Frente 15',1), (3,'Frente 16 ', 'Frente 16',1), (3,'Frente 17', ' Frente 17',1), (3,'Frente 18', ' Frente 18', 1);

INSERT INTO prioridad(nivel_prioridad) VALUES ('Sin prioridad'), ('Baja'), ('Media'), ('Alta');




ALTER TABLE OrdenesTrabajo
ADD COLUMN horometro_ingreso DECIMAL(10, 2),
ADD COLUMN horometro_salida DECIMAL(10, 2);