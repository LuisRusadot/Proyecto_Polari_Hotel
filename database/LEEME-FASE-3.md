# HOTEL POLARIS — FASE 3 · Almacenamiento de información

Micrositio de **Hotel Polaris** (azul noche profundo + dorado, tipografías
Cinzel + Montserrat) con persistencia de datos en **MySQL** mediante una
**API PHP** (CRUD) consumida desde el navegador con `fetch`.

---

## 1. ¿Qué información se almacena?

| Entidad        | Tabla          | Datos que se guardan                                                                 |
|----------------|----------------|--------------------------------------------------------------------------------------|
| **Contactos**  | `contactos`    | Nombre, correo, teléfono, asunto (reserva/astronomía/eventos/otro), mensaje, estado, fecha |
| **Experiencias** | `experiencias` | Título, descripción, precio, URL de imagen, activo (visible o no en el sitio)          |
| **Reservas**   | `reservas`     | Contacto asociado, fecha de llegada, fecha de salida, nº de huéspedes, tipo de habitación, estado |

**No se almacena** (no es necesario para la fase): contraseñas, datos de
tarjetas, credenciales de pago, ni la navegación del visitante (clics,
scroll, etc.).

---

## 2. Esquema de la base de datos

**Base de datos:** `hotel_polaris` (utf8mb4, colación `utf8mb4_unicode_ci`)

### Tabla `contactos`
| Campo        | Tipo                        | Notas                            |
|--------------|-----------------------------|----------------------------------|
| `id`         | INT UNSIGNED AUTO_INCREMENT | **Llave primaria (PK)**          |
| `nombre`     | VARCHAR(120) NOT NULL       |                                  |
| `email`      | VARCHAR(160) NOT NULL       |                                  |
| `telefono`   | VARCHAR(30) NULL            |                                  |
| `asunto`     | ENUM(reserva,astronomia,eventos,otro) | Default `otro`          |
| `mensaje`    | TEXT NOT NULL               |                                  |
| `estado`     | ENUM(nuevo,leido,respondido,archivado) | Default `nuevo`       |
| `creado_en`  | TIMESTAMP                   | Default `CURRENT_TIMESTAMP`      |

### Tabla `experiencias`
| Campo         | Tipo                 | Notas                     |
|---------------|----------------------|---------------------------|
| `id`          | INT UNSIGNED AUTO_INCREMENT | **PK**             |
| `titulo`      | VARCHAR(140) NOT NULL |                           |
| `descripcion` | TEXT NOT NULL         |                           |
| `precio`      | VARCHAR(60) NULL      |                           |
| `imagen`      | VARCHAR(500) NULL     | URL de la imagen          |
| `activo`      | TINYINT(1) DEFAULT 1  | 1 = visible en el sitio   |
| `creado_en`   | TIMESTAMP             | Default `CURRENT_TIMESTAMP` |

### Tabla `reservas`
| Campo            | Tipo                        | Notas                                        |
|------------------|-----------------------------|----------------------------------------------|
| `id`             | INT UNSIGNED AUTO_INCREMENT | **PK**                                       |
| `contacto_id`    | INT UNSIGNED NOT NULL       | **Llave foránea (FK)** → `contactos.id`      |
| `fecha_llegada`  | DATE NULL                   |                                              |
| `fecha_salida`   | DATE NULL                   |                                              |
| `huespedes`      | TINYINT UNSIGNED DEFAULT 1  |                                              |
| `tipo_habitacion`| VARCHAR(80) NULL            |                                              |
| `estado`         | ENUM(pendiente,confirmada,cancelada,completada) | Default `pendiente` |
| `creado_en`      | TIMESTAMP                   | Default `CURRENT_TIMESTAMP`                  |

**Relación:** `reservas.contacto_id` → `contactos.id`
(ON DELETE CASCADE: si se elimina el contacto, se eliminan sus reservas).

---

## 3. Crear la base de datos en phpMyAdmin (XAMPP)

1. Abre **XAMPP Control Panel** → inicia **Apache** y **MySQL**.
2. Entra a `http://localhost/phpmyadmin`.
3. Pestaña **Importar** → selecciona el archivo **`database/hotel_polaris.sql`**.
4. Haz clic en **Continuar**.
   Se crean la base `hotel_polaris`, las 3 tablas con sus llaves,
   AUTO_INCREMENT y datos de ejemplo (5 experiencias + 1 contacto).

> También puedes hacerlo manualmente con la pestaña **SQL**: pega el
> contenido del archivo y ejecuta.

---

## 4. API de conexión (CRUD)

La API está en la carpeta `api/` y usa **PDO** con consultas preparadas
(protección contra inyección SQL).

| Archivo              | Ruta                          | Operaciones                            |
|----------------------|-------------------------------|----------------------------------------|
| `conexion.php`       | — (incluido por los demás)     | Conexión PDO + respuesta JSON           |
| `contactos.php`      | `api/contactos.php`           | CRUD de contactos                       |
| `experiencias.php`   | `api/experiencias.php`        | CRUD de experiencias                    |
| `reservas.php`       | `api/reservas.php`            | CRUD de reservas                        |

### Métodos HTTP soportados

| Verbo      | Uso                          | Ejemplo                                        |
|------------|------------------------------|------------------------------------------------|
| `GET`      | Leer / listar                | `api/contactos.php` · `api/contactos.php?id=1` |
| `POST`     | Crear / insertar             | `api/contactos.php`                            |
| `PUT`      | Actualizar / modificar       | `api/contactos.php?id=1`                       |
| `DELETE`   | Eliminar / borrar            | `api/contactos.php?id=1`                       |

### Ejemplo de petición (desde el navegador)

```js
// CREAR (POST)
await fetch("api/contactos.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
        nombre: "Ana María Gómez",
        email: "ana@correo.com",
        telefono: "+57 300 000 0000",
        asunto: "reserva",
        mensaje: "Quiero reservar la Suite Observatorio.",
    }),
});
```

### Prueba rápida con el navegador

1. Con XAMPP activo, abre `http://localhost/Proyecto_Polari_Hotel/api/contactos.php`
   → verás el JSON con los contactos (READ).
2. Envía el formulario de `contacto.html` → se crea un registro (CREATE).

---

## 5. Integración con el micrositio

- **Formulario de contacto** (`contacto.html` + `contacto-api.js`):
  el botón **Enviar Mensaje** hace `POST` a `api/contactos.php`
  y muestra un mensaje dorado de éxito o un error si no hay conexión.

- **Panel de administración** (`admin/index.html` + `admin/admin.js`):
  CRUD completo con pestañas **Contactos / Experiencias / Reservas**:
  - Leer: tablas con los registros y contadores.
  - Crear: botón **+ Nuevo contacto / experiencia / reserva**.
  - Actualizar: botón **Editar** en cada fila.
  - Eliminar: botón **Eliminar** con confirmación.
  - Ver detalle: botón **Ver**.

---

## 6. Requisitos

- XAMPP (Apache + MySQL) o cualquier servidor con PHP 7.4+ y MySQL 5.7+.
- El micrositio debe servirse por HTTP (no `file://`) para que `fetch`
  hacia `api/*.php` funcione: por ejemplo, copiar la carpeta en
  `C:\xampp\htdocs\` y abrir `http://localhost/Proyecto_Polari_Hotel/`.