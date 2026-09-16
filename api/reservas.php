<?php
/**
 * ============================================================
 * HOTEL POLARIS — API · Endpoint de Reservas
 * ============================================================
 * Archivo: api/reservas.php
 *
 * Endpoint REST para la tabla `reservas`. Las reservas se
 * asocian a un contacto (contacto_id). Usado por el panel de
 * administración para gestionar el estado de cada reserva.
 *
 * Métodos soportados:
 *   GET    /api/reservas.php                 → listar (Read)
 *   GET    /api/reservas.php?id=N            → una reserva
 *   POST   /api/reservas.php                 → crear (Create)
 *   PUT    /api/reservas.php?id=N            → actualizar (Update)
 *   DELETE /api/reservas.php?id=N            → eliminar (Delete)
 *
 * Cuerpo JSON esperado (POST / PUT):
 *   {
 *     "contacto_id":     1,
 *     "fecha_llegada":   "2026-10-01",
 *     "fecha_salida":    "2026-10-03",
 *     "huespedes":       2,
 *     "tipo_habitacion": "Suite Observatorio",
 *     "estado":          "pendiente"   // pendiente|confirmada|cancelada|completada
 *   }
 * ============================================================
 */

require_once __DIR__ . '/conexion.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$pdo = conectarBD();
$metodo = $_SERVER['REQUEST_METHOD'];
$entrada = json_decode(file_get_contents('php://input'), true) ?? [];

$ESTADOS_RESERVA = ['pendiente', 'confirmada', 'cancelada', 'completada'];

function limpiarRes(array $d): array
{
    return [
        'contacto_id'     => isset($d['contacto_id']) ? (int)$d['contacto_id'] : 0,
        'fecha_llegada'   => isset($d['fecha_llegada']) ? trim((string)$d['fecha_llegada']) : '',
        'fecha_salida'    => isset($d['fecha_salida']) ? trim((string)$d['fecha_salida']) : '',
        'huespedes'       => isset($d['huespedes']) ? max(1, (int)$d['huespedes']) : 1,
        'tipo_habitacion' => isset($d['tipo_habitacion']) ? trim((string)$d['tipo_habitacion']) : '',
        'estado'          => isset($d['estado']) ? (string)$d['estado'] : 'pendiente',
    ];
}

switch ($metodo) {

    case 'GET':
        if (isset($_GET['id'])) {
            $st = $pdo->prepare(
                'SELECT r.*, c.nombre AS contacto_nombre, c.email AS contacto_email
                 FROM reservas r
                 JOIN contactos c ON c.id = r.contacto_id
                 WHERE r.id = ? LIMIT 1'
            );
            $st->execute([(int)$_GET['id']]);
            $fila = $st->fetch();
            if (!$fila) {
                responder(['ok' => false, 'error' => 'Reserva no encontrada.'], 404);
            }
            responder(['ok' => true, 'reserva' => $fila]);
        }

        $st = $pdo->query(
            'SELECT r.*, c.nombre AS contacto_nombre, c.email AS contacto_email
             FROM reservas r
             JOIN contactos c ON c.id = r.contacto_id
             ORDER BY r.id DESC'
        );

        responder(['ok' => true, 'total' => $st->rowCount(), 'reservas' => $st->fetchAll()]);
        break;

    case 'POST':
        $d = limpiarRes($entrada);
        if ($d['contacto_id'] <= 0) {
            responder(['ok' => false, 'error' => 'La reserva debe asociarse a un contacto (contacto_id).'], 422);
        }
        if ($d['fecha_llegada'] === '' || $d['fecha_salida'] === '') {
            responder(['ok' => false, 'error' => 'Las fechas de llegada y salida son obligatorias.'], 422);
        }
        if (!in_array($d['estado'], $ESTADOS_RESERVA, true)) {
            $d['estado'] = 'pendiente';
        }

        $st = $pdo->prepare(
            'INSERT INTO reservas (contacto_id, fecha_llegada, fecha_salida, huespedes, tipo_habitacion, estado)
             VALUES (?, ?, ?, ?, ?, ?)'
        );
        $st->execute([
            $d['contacto_id'],
            $d['fecha_llegada'],
            $d['fecha_salida'],
            $d['huespedes'],
            $d['tipo_habitacion'],
            $d['estado'],
        ]);

        responder(['ok' => true, 'mensaje' => 'Reserva creada.', 'id' => (int)$pdo->lastInsertId()], 201);
        break;

    case 'PUT':
        $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
        if ($id <= 0) {
            responder(['ok' => false, 'error' => 'Falta el parámetro id.'], 422);
        }

        $d = limpiarRes($entrada);
        if (!in_array($d['estado'], $ESTADOS_RESERVA, true)) {
            $d['estado'] = 'pendiente';
        }

        $st = $pdo->prepare(
            'UPDATE reservas
             SET contacto_id = ?, fecha_llegada = ?, fecha_salida = ?, huespedes = ?, tipo_habitacion = ?, estado = ?
             WHERE id = ?'
        );
        $st->execute([
            $d['contacto_id'],
            $d['fecha_llegada'],
            $d['fecha_salida'],
            $d['huespedes'],
            $d['tipo_habitacion'],
            $d['estado'],
            $id,
        ]);

        if ($st->rowCount() === 0) {
            responder(['ok' => false, 'error' => 'Reserva no encontrada o sin cambios.'], 404);
        }

        responder(['ok' => true, 'mensaje' => 'Reserva actualizada.', 'id' => $id]);
        break;

    case 'DELETE':
        $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
        if ($id <= 0) {
            responder(['ok' => false, 'error' => 'Falta el parámetro id.'], 422);
        }

        $st = $pdo->prepare('DELETE FROM reservas WHERE id = ?');
        $st->execute([$id]);
        if ($st->rowCount() === 0) {
            responder(['ok' => false, 'error' => 'Reserva no encontrada.'], 404);
        }

        responder(['ok' => true, 'mensaje' => 'Reserva eliminada.', 'id' => $id]);
        break;

    default:
        responder(['ok' => false, 'error' => 'Método no permitido.'], 405);
}