<?php
/**
 * =====================================================================================
 * ARCHIVO DE CONEXIÓN A BASE DE DATOS MYSQL EN XAMPP - UTVM RESERVAS LABS
 * =====================================================================================
 * Parámetros de entorno XAMPP por defecto:
 *   Host:       localhost (127.0.0.1)
 *   Puerto:     3306
 *   Usuario:    root
 *   Contraseña: "" (vacía)
 *   Base Datos: utvm_reservas_labs
 *   Gestor:     http://localhost/phpmyadmin
 * =====================================================================================
 */

// Habilitar cabeceras CORS para permitir peticiones desde cualquier origen local o puerto
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

// Responder inmediatamente a preflight requests de CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Configuración de credenciales XAMPP
define('DB_HOST', '127.0.0.1');
define('DB_PORT', '3306');
define('DB_NAME', 'utvm_reservas_labs');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_CHARSET', 'utf8mb4');

/**
 * Obtiene una instancia PDO conectada a MySQL en XAMPP.
 * Si la base de datos aún no ha sido importada en phpMyAdmin pero el motor MySQL de XAMPP
 * está activo, intenta aprovisionarla automáticamente desde ../database/utvm_reservas_labs.sql.
 *
 * @param bool $autoProvision Intentar crear e importar la BD si no existe
 * @return PDO
 * @throws Exception
 */
function obtenerConexionPDO($autoProvision = true) {
    $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
    $opciones = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
        PDO::ATTR_TIMEOUT            => 3
    ];

    try {
        return new PDO($dsn, DB_USER, DB_PASS, $opciones);
    } catch (PDOException $e) {
        // Código 1049 = Unknown database 'utvm_reservas_labs'
        if ($autoProvision && (strpos($e->getMessage(), '1049') !== false || strpos($e->getMessage(), 'Unknown database') !== false)) {
            $dsnServer = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";charset=" . DB_CHARSET;
            $pdoServer = new PDO($dsnServer, DB_USER, DB_PASS, $opciones);
            $sqlPath = __DIR__ . '/../database/utvm_reservas_labs.sql';
            if (file_exists($sqlPath)) {
                $sqlContent = file_get_contents($sqlPath);
                $pdoServer->exec($sqlContent);
                return new PDO($dsn, DB_USER, DB_PASS, $opciones);
            }
        }
        throw $e;
    }
}

/**
 * Función auxiliar para enviar respuestas JSON estandarizadas.
 */
function responderJSON($exito, $mensaje, $datos = [], $codigoHttp = 200) {
    http_response_code($codigoHttp);
    echo json_encode([
        'success'   => $exito,
        'message'   => $mensaje,
        'timestamp' => date('Y-m-d H:i:s'),
        'engine'    => 'XAMPP MySQL (utvm_reservas_labs:3306)',
        'data'      => $datos
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit();
}
?>
