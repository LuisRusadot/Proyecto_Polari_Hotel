<?php
/**
 * ============================================================
 * HOTEL POLARIS — API de conexión a la base de datos
 * ============================================================
 * Archivo: api/conexion.php
 *
 * Centraliza la conexión PDO a MySQL (XAMPP / phpMyAdmin).
 * Todas las rutas de la API incluyen este archivo.
 *
 * Configuración por defecto de XAMPP:
 *   host     = localhost
 *   usuario  = root
 *   contraseña = (vacía)
 *   base     = hotel_polaris
 * ============================================================
 */

// ---------- Configuración de la conexión ----------
define('DB_HOST', 'localhost');
define('DB_NAME', 'hotel_polaris');
define('DB_USER', 'root');
define('DB_PASS', '');   // En XAMPP por defecto está vacía
define('DB_CHARSET', 'utf8mb4');

/**
 * Devuelve una instancia única de PDO (patrón singleton).
 * Si la conexión falla, responde con JSON 500 y termina.
 */
function conectarBD(): PDO
{
    static $pdo = null;

    if ($pdo === null) {
        $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=' . DB_CHARSET;
        $opciones = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];

        try {
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $opciones);
        } catch (PDOException $e) {
            http_response_code(500);
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode([
                'ok'    => false,
                'error' => 'No se pudo conectar a la base de datos: ' . $e->getMessage(),
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }

    return $pdo;
}

/**
 * Responde en JSON con código HTTP y sale.
 */
function responder($datos, int $codigo = 200): void
{
    http_response_code($codigo);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($datos, JSON_UNESCAPED_UNICODE);
    exit;
}