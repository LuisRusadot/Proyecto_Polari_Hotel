-- ============================================================
-- HOTEL POLARIS — FASE 3 · Base de Datos
-- Instituto Técnico Industrial Pascual Bravo · Proyecto web
--
-- Base de datos: hotel_polaris
-- Motor: MySQL (phpMyAdmin / XAMPP)
-- Juego de caracteres: utf8mb4 (soporta acentos y emojis)
--
-- CÓMO IMPORTAR EN phpMyAdmin:
-- 1. Abre XAMPP → inicia Apache y MySQL.
-- 2. Entra a http://localhost/phpmyadmin
-- 3. Pestaña "Importar" → elige este archivo (hotel_polaris.sql)
--    → "Continuar".
-- 4. Se crea la base, las 3 tablas y los datos de ejemplo.
-- ============================================================

-- ------------------------------------------------------------
-- 1. CREAR LA BASE DE DATOS
-- ------------------------------------------------------------
CREATE DATABASE IF NOT EXISTS hotel_polaris
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE hotel_polaris;

-- ------------------------------------------------------------
-- 2. TABLA: contactos
-- Almacena los mensajes enviados desde el formulario de
-- contacto (contacto.html). Es la tabla principal del CRUD.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contactos (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(120) NOT NULL,
    email VARCHAR(160) NOT NULL,
    telefono VARCHAR(30) NULL,
    asunto ENUM('reserva','astronomia','eventos','otro') NOT NULL DEFAULT 'otro',
    mensaje TEXT NOT NULL,
    estado ENUM('nuevo','leido','respondido','archivado') NOT NULL DEFAULT 'nuevo',
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 3. TABLA: experiencias
-- Catálogo de servicios del hotel (se muestra en
-- experiencias.html). Permite el CRUD para actualizar
-- el catálogo desde el panel de administración.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS experiencias (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    titulo VARCHAR(140) NOT NULL,
    descripcion TEXT NOT NULL,
    precio VARCHAR(60) NULL,
    imagen VARCHAR(500) NULL,
    activo TINYINT(1) NOT NULL DEFAULT 1,
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 4. TABLA: reservas
-- Intenciones de reserva registradas por los huéspedes
-- (llegan desde el formulario de contacto cuando el asunto
-- es "reserva"). Relaciona cada reserva con un contacto.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reservas (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    contacto_id INT UNSIGNED NOT NULL,
    fecha_llegada DATE NULL,
    fecha_salida DATE NULL,
    huespedes TINYINT UNSIGNED NULL DEFAULT 1,
    tipo_habitacion VARCHAR(80) NULL,
    estado ENUM('pendiente','confirmada','cancelada','completada') NOT NULL DEFAULT 'pendiente',
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_reservas_contacto
        FOREIGN KEY (contacto_id) REFERENCES contactos (id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 5. DATOS DE EJEMPLO (opcionales)
-- Coinciden con la información real del micrositio.
-- ------------------------------------------------------------
INSERT INTO experiencias (titulo, descripcion, precio, imagen, activo) VALUES
('Suites Observatorio', 'Habitaciones de lujo con techos panorámicos y vistas despejadas al cielo nocturno.', 'Desde $180 / noche', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQAEZ910METY4TxBxUEAn4qpecTHz0YdsPScCkxqAQODQ&s', 1),
('Terraza Observatorio', 'Equipada con telescopios de alta gama para la observación de estrellas, constelaciones y fenómenos astronómicos.', 'Incluido en la estadía', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQeQyK-LIkpEmG-H6E3ta5Aa5XNDs6QXtsDWND4Aq_L1fUcHOwbyoklOCw&s=10', 1),
('Bar & Restaurante Constelación', 'Gastronomía de autor y coctelería temática bajo una atmósfera tenue diseñada para realzar la luz estelar.', 'A la carta', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTc11_dKTti_gygZOY0lVYqXwplxlBAUp4A1puuVn0C5Q&s=10', 1),
('Spa & Ritual Nocturno', 'Tratamientos relajantes, piscinas climatizadas e hidromasajes al aire libre guiados por el entorno estelar.', 'Desde $75 / sesión', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRo_-tANFW16oAkqneIvwiqYmmwdnLMlo0hlCwxuI7TBA&s=10', 1),
('Tours Astronómicos', 'Recorridos guiados por astrónomos locales con talleres de astrofotografía nocturna y senderismo nocturno.', 'Desde $45 / persona', 'https://media.tacdn.com/media/attractions-splice-spp-674x446/0b/17/4e/a0.jpg', 1);

-- Un mensaje de ejemplo (se puede borrar desde el panel)
INSERT INTO contactos (nombre, email, telefono, asunto, mensaje, estado) VALUES
('Ana María Gómez', 'ana.gomez@correo.com', '+57 300 000 0000', 'reserva', 'Hola, me gustaría reservar la Suite Observatorio para dos noches a fin de mes.', 'nuevo');