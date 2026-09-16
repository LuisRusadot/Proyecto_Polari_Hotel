<?php
/**
 * ============================================================
 * HOTEL POLARIS — API · Endpoint de Experiencias (CRUD)
 * ============================================================
 * Archivo: api/experiencias.php
 *
 * Endpoint REST para la tabla `experiencias` (catálogo de
 * servicios que se muestra en experiencias.html).
 *
 * Métodos soportados:
 *   GET    /api/experiencias.php              → listar (Read)
 *   GET    /api/experiencias.php?id=N         → una experiencia
 *   POST   /api/experiencias.php              → crear (Create)
 *   PUT    /api/experiencias.php?id=N         → actualizar (Update)
 *   DELETE /api/experiencias.php?id=N         → eliminar (Delete)
 *
 * Cuerpo JSON esperado (POST / PUT):
 *   {
 *     "titulo":      "Suites Observatorio",
 *     "descripcion": "Habitaciones de lujo...",
 *     "precio":      "Desde $180 / noche",
 *     "imagen":      "https://...jpg",
 *     "activo":      1
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

function limpiarExp(array $d): array
{
    return [
        'titulo'      => isset($d['titulo']) ? trim((string)$d['titulo']) : '',
        'descripcion' => isset($d['descripcion']) ? trim((string)$d['descripcion']) : '',
        'precio'      => isset($d['precio']) ? trim((string)$d['precio']) : '',
        'imagen'      => isset($d['imagen']) ? trim((string)$d['imagen']) : '',
        'activo'      => isset($d['activo']) ? (int)(bool)$d['activo'] : 1,
    ];
}

switch ($metodo) {

    case 'GET':
        if (isset($_GET['id'])) {
            $st = $pdo->prepare('SELECT * FROM experiencias WHERE id = ? LIMIT 1');
            $st->execute([(int)$_GET['id']]);
            $fila = $st->fetch();
            if (!$fila) {
                responder(['ok' => false, 'error' => 'Experiencia no encontrada.'], 404);
            }
            responder(['ok' => true, 'experiencia' => $fila]);
        }

        $sql = 'SELECT * FROM experiencias';
        $params = [];
        if (isset($_GET['activas']) && $_GET['activas'] === '1') {
            $sql .= ' WHERE activo = 1';
        }
        $sql .= ' ORDER BY id ASC';
        $st = $pdo->prepare($sql);
        $st->execute($params);

        responder(['ok' => true, 'total' => $st->rowCount(), 'experiencias' => $st->fetchAll()]);
        break;

    case 'POST':
        $d = limpiarExp($entrada);
        if ($d['titulo'] === '' || $d['descripcion'] === '') {
            responder(['ok' => false, 'error' => 'Título y descripción son obligatorios.'], 422);
        }

        $st = $pdo->prepare(
            'INSERT INTO experiencias (titulo, descripcion, precio, imagen, activo)
             VALUES (?, ?, ?, ?, ?)'
        );
        $st->execute([$d['titulo'], $d['descripcion'], $d['precio'], $d['imagen'], $d['activo']]);

        responder(['ok' => true, 'mensaje' => 'Experiencia creada.', 'id' => (int)$pdo->lastInsertId()], 201);
        break;

    case 'PUT':
        $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
        if ($id <= 0) {
            responder(['ok' => false, 'error' => 'Falta el parámetro id.'], 422);
        }

        $st = $pdo->prepare('SELECT id FROM experiencias WHERE id = ?');
        $st->execute([$id]);
        if (!$st->fetch()) {
            responder(['ok' => false, 'error' => 'Experiencia no encontrada.'], 404);
        }

        $d = limpiarExp($entrada);
        if ($d['titulo'] === '' || $d['descripcion'] === '') {
            responder(['ok' => false, 'error' => 'Título y descripción son obligatorios.'], 422);
        }

        $st = $pdo->prepare(
            'UPDATE experiencias
             SET titulo = ?, descripcion = ?, precio = ?, imagen = ?, activo = ?
             WHERE id = ?'
        );
        $st->execute([$d['titulo'], $d['descripcion'], $d['precio'], $d['imagen'], $d['activo'], $id]);

        responder(['ok' => true, 'mensaje' => 'Experiencia actualizada.', 'id' => $id]);
        break;

    case 'DELETE':
        $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
        if ($id <= 0) {
            responder(['ok' => false, 'error' => 'Falta el parámetro id.'], 422);
        }

        $st = $pdo->prepare('DELETE FROM experiencias WHERE id = ?');
        $st->execute([$id]);
        if ($st->rowCount() === 0) {
            responder(['ok' => false, 'error' => 'Experiencia no encontrada.'], 404);
        }

        responder(['ok' => true, 'mensaje' => 'Experiencia eliminada.', 'id' => $id]);
        break;

    default:
        responder(['ok' => false, 'error' => 'Método no permitido.'], 405);
}