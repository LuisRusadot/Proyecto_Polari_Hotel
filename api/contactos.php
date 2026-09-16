<?php
/**
 * ============================================================
 * HOTEL POLARIS — API · Endpoint de Contactos (CRUD)
 * ============================================================
 * Archivo: api/contactos.php
 *
 * Endpoint REST para la tabla `contactos` del formulario de
 * contacto (contacto.html) y el panel de administración.
 *
 * Métodos soportados:
 *   GET    /api/contactos.php            → lista todos (Read)
 *   GET    /api/contactos.php?id=N       → un contacto (Read)
 *   POST   /api/contactos.php            → crear (Create/Insert)
 *   PUT    /api/contactos.php?id=N       → actualizar (Update)
 *   DELETE /api/contactos.php?id=N       → eliminar (Delete)
 *
 * Cuerpo JSON esperado (POST / PUT):
 *   {
 *     "nombre":   "Ana María Gómez",
 *     "email":    "ana@correo.com",
 *     "telefono": "+57 300 000 0000",
 *     "asunto":   "reserva",        // reserva|astronomia|eventos|otro
 *     "mensaje":  "Texto del mensaje",
 *     "estado":   "nuevo"           // nuevo|leido|respondido|archivado
 *   }
 * ============================================================
 */

require_once __DIR__ . '/conexion.php';

// ---------- Permitir peticiones desde el micrositio ----------
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$pdo = conectarBD();
$metodo = $_SERVER['REQUEST_METHOD'];

// ---------- Leer cuerpo JSON ----------
$entrada = json_decode(file_get_contents('php://input'), true) ?? [];

// ---------- Campos permitidos (evita inyección de columnas) ----------
$ASUNTOS = ['reserva', 'astronomia', 'eventos', 'otro'];
$ESTADOS = ['nuevo', 'leido', 'respondido', 'archivado'];

function limpiar(array $d): array
{
    $r = [];
    foreach (['nombre', 'email', 'telefono', 'mensaje'] as $c) {
        $r[$c] = isset($d[$c]) ? trim((string)$d[$c]) : '';
    }
    $r['asunto'] = isset($d['asunto']) ? (string)$d['asunto'] : 'otro';
    $r['estado'] = isset($d['estado']) ? (string)$d['estado'] : 'nuevo';
    return $r;
}

switch ($metodo) {

    // ========================================================
    // READ — Listar todos los contactos (opcional ?id=N o ?estado=)
    // ========================================================
    case 'GET':
        if (isset($_GET['id'])) {
            $st = $pdo->prepare('SELECT * FROM contactos WHERE id = ? LIMIT 1');
            $st->execute([(int)$_GET['id']]);
            $fila = $st->fetch();

            if (!$fila) {
                responder(['ok' => false, 'error' => 'Contacto no encontrado'], 404);
            }
            responder(['ok' => true, 'contacto' => $fila]);
        }

        $sql = 'SELECT * FROM contactos';
        $params = [];

        if (isset($_GET['estado']) && in_array($_GET['estado'], $ESTADOS, true)) {
            $sql .= ' WHERE estado = ?';
            $params[] = $_GET['estado'];
        }

        $sql .= ' ORDER BY id DESC';
        $st = $pdo->prepare($sql);
        $st->execute($params);

        responder(['ok' => true, 'total' => $st->rowCount(), 'contactos' => $st->fetchAll()]);
        break;

    // ========================================================
    // CREATE — Insertar un nuevo contacto
    // ========================================================
    case 'POST':
        $d = limpiar($entrada);

        if ($d['nombre'] === '' || $d['email'] === '' || $d['mensaje'] === '') {
            responder(['ok' => false, 'error' => 'Nombre, correo y mensaje son obligatorios.'], 422);
        }
        if (!filter_var($d['email'], FILTER_VALIDATE_EMAIL)) {
            responder(['ok' => false, 'error' => 'El correo electrónico no es válido.'], 422);
        }
        if (!in_array($d['asunto'], $ASUNTOS, true)) {
            $d['asunto'] = 'otro';
        }
        if (!in_array($d['estado'], $ESTADOS, true)) {
            $d['estado'] = 'nuevo';
        }

        $st = $pdo->prepare(
            'INSERT INTO contactos (nombre, email, telefono, asunto, mensaje, estado)
             VALUES (?, ?, ?, ?, ?, ?)'
        );
        $st->execute([
            $d['nombre'],
            $d['email'],
            $d['telefono'] !== '' ? $d['telefono'] : null,
            $d['asunto'],
            $d['mensaje'],
            $d['estado'],
        ]);

        responder([
            'ok' => true,
            'mensaje' => 'Mensaje guardado correctamente.',
            'id' => (int)$pdo->lastInsertId(),
        ], 201);
        break;

    // ========================================================
    // UPDATE — Modificar un contacto existente
    // ========================================================
    case 'PUT':
        $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
        if ($id <= 0) {
            responder(['ok' => false, 'error' => 'Falta el parámetro id.'], 422);
        }

        $st = $pdo->prepare('SELECT id FROM contactos WHERE id = ?');
        $st->execute([$id]);
        if (!$st->fetch()) {
            responder(['ok' => false, 'error' => 'Contacto no encontrado.'], 404);
        }

        $d = limpiar($entrada);

        if ($d['nombre'] === '' || $d['email'] === '' || $d['mensaje'] === '') {
            responder(['ok' => false, 'error' => 'Nombre, correo y mensaje son obligatorios.'], 422);
        }
        if (!filter_var($d['email'], FILTER_VALIDATE_EMAIL)) {
            responder(['ok' => false, 'error' => 'El correo electrónico no es válido.'], 422);
        }
        if (!in_array($d['asunto'], $ASUNTOS, true)) {
            $d['asunto'] = 'otro';
        }
        if (!in_array($d['estado'], $ESTADOS, true)) {
            $d['estado'] = 'nuevo';
        }

        $st = $pdo->prepare(
            'UPDATE contactos
             SET nombre = ?, email = ?, telefono = ?, asunto = ?, mensaje = ?, estado = ?
             WHERE id = ?'
        );
        $st->execute([
            $d['nombre'],
            $d['email'],
            $d['telefono'] !== '' ? $d['telefono'] : null,
            $d['asunto'],
            $d['mensaje'],
            $d['estado'],
            $id,
        ]);

        responder(['ok' => true, 'mensaje' => 'Contacto actualizado correctamente.', 'id' => $id]);
        break;

    // ========================================================
    // DELETE — Eliminar un contacto
    // ========================================================
    case 'DELETE':
        $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
        if ($id <= 0) {
            responder(['ok' => false, 'error' => 'Falta el parámetro id.'], 422);
        }

        $st = $pdo->prepare('DELETE FROM contactos WHERE id = ?');
        $st->execute([$id]);

        if ($st->rowCount() === 0) {
            responder(['ok' => false, 'error' => 'Contacto no encontrado.'], 404);
        }

        responder(['ok' => true, 'mensaje' => 'Contacto eliminado correctamente.', 'id' => $id]);
        break;

    default:
        responder(['ok' => false, 'error' => 'Método no permitido.'], 405);
}