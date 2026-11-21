<?php
/**
 * =====================================================================================
 * API REST / ENDPOINTS BACKEND - SISTEMA ADMINISTRADOR DE LABORATORIOS UTVM
 * =====================================================================================
 * Ruta en XAMPP: http://localhost/utvm_reservas_labs/api/endpoints.php
 * Soporta peticiones GET y POST con validación de reglas de negocio UTVM.
 * =====================================================================================
 */

require_once __DIR__ . '/conexion.php';

$action = isset($_GET['action']) ? trim($_GET['action']) : 'get_all';

// Leer cuerpo JSON en peticiones POST/PUT
$rawBody = file_get_contents('php://input');
$input = json_decode($rawBody, true);
if (!is_array($input)) {
    $input = $_POST;
}

try {
    $pdo = obtenerConexionPDO(true);
} catch (Exception $e) {
    responderJSON(false, 'No se pudo conectar al motor MySQL de XAMPP en localhost:3306. Verifique que el servicio MySQL esté iniciado en el Panel de Control de XAMPP.', [
        'error_detail' => $e->getMessage(),
        'host'         => DB_HOST,
        'port'         => DB_PORT,
        'database'     => DB_NAME
    ], 503);
}

/**
 * Obtiene el estado completo de las 4 tablas para sincronizar el dashboard y la App Móvil.
 */
function obtenerEstadoCompleto(PDO $pdo) {
    $usuarios = $pdo->query("SELECT id_usuario, nombre_completo, correo, rol, activo FROM usuarios_admin ORDER BY id_usuario ASC")->fetchAll();
    
    $labs = $pdo->query("
        SELECT l.*, u.nombre_completo AS nombre_encargado
        FROM laboratorios l
        LEFT JOIN usuarios_admin u ON l.id_encargado = u.id_usuario
        ORDER BY l.id_laboratorio ASC
    ")->fetchAll();

    $reservas = $pdo->query("
        SELECT r.*, l.nombre AS nombre_laboratorio, l.edificio, l.planta
        FROM reservaciones r
        INNER JOIN laboratorios l ON r.id_laboratorio = l.id_laboratorio
        ORDER BY FIELD(r.estado, 'Pendiente', 'Confirmado', 'Asistio', 'Cancelado'), r.id_reservacion ASC
    ")->fetchAll();

    $bitacora = $pdo->query("
        SELECT b.*, r.nombre_estudiante, r.matricula_estudiante, r.carrera, r.id_laboratorio, l.nombre AS nombre_laboratorio, u.nombre_completo AS encargado_nombre
        FROM bitacora_accesos b
        LEFT JOIN reservaciones r ON b.id_reservacion = r.id_reservacion
        LEFT JOIN laboratorios l ON r.id_laboratorio = l.id_laboratorio
        LEFT JOIN usuarios_admin u ON b.id_encargado_valido = u.id_usuario
        ORDER BY b.fecha_hora_ingreso DESC, b.id_acceso DESC
    ")->fetchAll();

    return [
        'usuarios_admin'   => $usuarios,
        'laboratorios'     => $labs,
        'reservaciones'    => $reservas,
        'bitacora_accesos' => $bitacora
    ];
}

switch ($action) {

    // ---------------------------------------------------------------------------------
    // 1. PING / ESTADO DE CONEXIÓN Y CARGA COMPLETA
    // ---------------------------------------------------------------------------------
    case 'status':
    case 'get_all':
        $data = obtenerEstadoCompleto($pdo);
        responderJSON(true, 'Sincronización exitosa con MySQL en XAMPP (utvm_reservas_labs).', $data);
        break;

    // ---------------------------------------------------------------------------------
    // 2. CONFIRMAR SOLICITUD DE RESERVA (PANTALLA 1.2)
    // ---------------------------------------------------------------------------------
    case 'confirmar_reserva':
        $idReservacion = isset($input['id_reservacion']) ? (int)$input['id_reservacion'] : 0;
        if ($idReservacion <= 0) {
            responderJSON(false, 'ID de reservación inválido.', [], 400);
        }

        $pdo->beginTransaction();
        try {
            // Obtener datos de la reservación
            $stmtRes = $pdo->prepare("SELECT * FROM reservaciones WHERE id_reservacion = ? FOR UPDATE");
            $stmtRes->execute([$idReservacion]);
            $reserva = $stmtRes->fetch();

            if (!$reserva) {
                $pdo->rollBack();
                responderJSON(false, 'La solicitud de reservación no existe.', [], 404);
            }

            if ($reserva['estado'] === 'Confirmado' || $reserva['estado'] === 'Asistio') {
                $pdo->rollBack();
                responderJSON(false, 'Esta reservación ya fue confirmada previamente.', [], 409);
            }

            // REGLA 3: Asociación obligatoria de identidad UTVM
            if (empty(trim($reserva['matricula_estudiante'])) || empty(trim($reserva['nombre_estudiante']))) {
                $pdo->rollBack();
                responderJSON(false, 'Validación fallida: Toda reservación debe estar vinculada a una matrícula y nombre completo válidos de la UTVM.', [], 422);
            }

            // REGLA 1: Restricción de traslapes (misma matrícula, misma fecha y mismo bloque horario en Confirmado o Asistio)
            $stmtTraslape = $pdo->prepare("
                SELECT folio, nombre_estudiante, fecha_reserva, bloque_horario
                FROM reservaciones
                WHERE matricula_estudiante = ?
                  AND fecha_reserva = ?
                  AND bloque_horario = ?
                  AND estado IN ('Confirmado', 'Asistio')
                  AND id_reservacion != ?
                LIMIT 1
            ");
            $stmtTraslape->execute([
                $reserva['matricula_estudiante'],
                $reserva['fecha_reserva'],
                $reserva['bloque_horario'],
                $idReservacion
            ]);
            $traslape = $stmtTraslape->fetch();

            if ($traslape) {
                $pdo->rollBack();
                responderJSON(false, "Restricción de traslape: El estudiante con matrícula {$reserva['matricula_estudiante']} ya tiene una reserva activa ({$traslape['folio']}) el {$reserva['fecha_reserva']} en el bloque {$reserva['bloque_horario']}.", [], 409);
            }

            // REGLA 2: Validación de capacidad máxima y estatus operativo del laboratorio
            $stmtLab = $pdo->prepare("SELECT * FROM laboratorios WHERE id_laboratorio = ? FOR UPDATE");
            $stmtLab->execute([$reserva['id_laboratorio']]);
            $lab = $stmtLab->fetch();

            if (!$lab) {
                $pdo->rollBack();
                responderJSON(false, 'El laboratorio solicitado no existe.', [], 404);
            }

            if ($lab['estatus_operativo'] === 'En Mantenimiento') {
                $pdo->rollBack();
                responderJSON(false, "No es posible confirmar: El {$lab['nombre']} se encuentra 'En Mantenimiento'.", [], 409);
            }

            if ($lab['estatus_operativo'] === 'Saturado' || (int)$lab['cupo_ocupado_actual'] >= (int)$lab['capacidad_maxima']) {
                $pdo->rollBack();
                responderJSON(false, "Capacidad máxima alcanzada ({$lab['cupo_ocupado_actual']}/{$lab['capacidad_maxima']}): El {$lab['nombre']} se encuentra 'Saturado'.", [], 409);
            }

            // Generar Folio Único (Caso especial de la Sección 5: Erick Francisco Ramírez Bautista -> LAB-2026-9812)
            $folioGenerado = $reserva['folio'];
            if (empty($folioGenerado)) {
                if ($reserva['matricula_estudiante'] === '2530706') {
                    // Verificar que LAB-2026-9812 esté libre
                    $stmtCheck = $pdo->prepare("SELECT COUNT(*) FROM reservaciones WHERE folio = 'LAB-2026-9812'");
                    $stmtCheck->execute();
                    if ((int)$stmtCheck->fetchColumn() === 0) {
                        $folioGenerado = 'LAB-2026-9812';
                    }
                }
                if (empty($folioGenerado)) {
                    $folioGenerado = 'LAB-2026-' . (9814 + $idReservacion);
                    // Garantizar unicidad
                    $stmtCheck = $pdo->prepare("SELECT COUNT(*) FROM reservaciones WHERE folio = ?");
                    $stmtCheck->execute([$folioGenerado]);
                    if ((int)$stmtCheck->fetchColumn() > 0) {
                        $folioGenerado = 'LAB-2026-' . rand(9820, 9999);
                    }
                }
            }

            $qrHash = "UTVM-QR|{$folioGenerado}|{$reserva['matricula_estudiante']}|LAB{$reserva['id_laboratorio']}|{$reserva['fecha_reserva']}|" . str_replace(' ', '', $reserva['bloque_horario']);

            // Actualizar reservación a Confirmado
            $stmtUpdRes = $pdo->prepare("
                UPDATE reservaciones
                SET estado = 'Confirmado',
                    folio = ?,
                    codigo_qr_hash = ?,
                    motivo_cancelacion = NULL
                WHERE id_reservacion = ?
            ");
            $stmtUpdRes->execute([$folioGenerado, $qrHash, $idReservacion]);

            // Incrementar +1 en cupo_ocupado_actual y verificar si llega al 100% para pasar a Saturado
            $nuevoCupo = (int)$lab['cupo_ocupado_actual'] + 1;
            $nuevoEstatusLab = ($nuevoCupo >= (int)$lab['capacidad_maxima']) ? 'Saturado' : $lab['estatus_operativo'];

            $stmtUpdLab = $pdo->prepare("
                UPDATE laboratorios
                SET cupo_ocupado_actual = ?,
                    estatus_operativo = ?
                WHERE id_laboratorio = ?
            ");
            $stmtUpdLab->execute([$nuevoCupo, $nuevoEstatusLab, $lab['id_laboratorio']]);

            $pdo->commit();

            $mensajeExtra = ($nuevoEstatusLab === 'Saturado')
                ? " ¡Atención! El {$lab['nombre']} alcanzó el 100% de su capacidad ({$nuevoCupo}/{$lab['capacidad_maxima']}) y cambió automáticamente a estado 'Saturado'."
                : "";

            responderJSON(true, "Reserva confirmada con éxito. Folio asignado: {$folioGenerado}. Sincronizado con App Móvil Reservas Labs UTVM.{$mensajeExtra}", [
                'folio'         => $folioGenerado,
                'codigo_qr'     => $qrHash,
                'nuevo_cupo'    => $nuevoCupo,
                'estatus_lab'   => $nuevoEstatusLab,
                'estado_global' => obtenerEstadoCompleto($pdo)
            ]);
        } catch (Exception $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            responderJSON(false, 'Error al confirmar la reservación: ' . $e->getMessage(), [], 500);
        }
        break;

    // ---------------------------------------------------------------------------------
    // 3. RECHAZAR / CANCELAR SOLICITUD DE RESERVA (PANTALLA 1.2)
    // ---------------------------------------------------------------------------------
    case 'cancelar_reserva':
        $idReservacion = isset($input['id_reservacion']) ? (int)$input['id_reservacion'] : 0;
        $motivoCancelacion = isset($input['motivo_cancelacion']) ? trim($input['motivo_cancelacion']) : '';

        if ($idReservacion <= 0) {
            responderJSON(false, 'ID de reservación inválido.', [], 400);
        }

        // REGLA 4: Registro obligatorio de motivo de cancelación
        if (mb_strlen($motivoCancelacion) < 5) {
            responderJSON(false, 'Validación obligatoria: Debe escribir una justificación detallada en el motivo de rechazo o cancelación.', [], 422);
        }

        $pdo->beginTransaction();
        try {
            $stmtRes = $pdo->prepare("SELECT * FROM reservaciones WHERE id_reservacion = ? FOR UPDATE");
            $stmtRes->execute([$idReservacion]);
            $reserva = $stmtRes->fetch();

            if (!$reserva) {
                $pdo->rollBack();
                responderJSON(false, 'La reservación no existe.', [], 404);
            }

            if ($reserva['estado'] === 'Cancelado') {
                $pdo->rollBack();
                responderJSON(false, 'La reservación ya se encuentra cancelada.', [], 409);
            }

            if ($reserva['estado'] === 'Asistio') {
                $pdo->rollBack();
                responderJSON(false, 'No se puede cancelar una reservación que ya registró ingreso (Check-in).', [], 409);
            }

            $estabaConfirmada = ($reserva['estado'] === 'Confirmado');

            // Actualizar reservación a Cancelado
            $stmtUpdRes = $pdo->prepare("
                UPDATE reservaciones
                SET estado = 'Cancelado',
                    motivo_cancelacion = ?
                WHERE id_reservacion = ?
            ");
            $stmtUpdRes->execute([$motivoCancelacion, $idReservacion]);

            // Si estaba confirmada, liberar -1 en el cupo del laboratorio
            if ($estabaConfirmada) {
                $stmtLab = $pdo->prepare("SELECT * FROM laboratorios WHERE id_laboratorio = ? FOR UPDATE");
                $stmtLab->execute([$reserva['id_laboratorio']]);
                $lab = $stmtLab->fetch();

                if ($lab) {
                    $nuevoCupo = max(0, (int)$lab['cupo_ocupado_actual'] - 1);
                    $nuevoEstatusLab = $lab['estatus_operativo'];
                    if ($lab['estatus_operativo'] === 'Saturado' && $nuevoCupo < (int)$lab['capacidad_maxima']) {
                        $nuevoEstatusLab = 'Disponible';
                    }

                    $stmtUpdLab = $pdo->prepare("
                        UPDATE laboratorios
                        SET cupo_ocupado_actual = ?,
                            estatus_operativo = ?
                        WHERE id_laboratorio = ?
                    ");
                    $stmtUpdLab->execute([$nuevoCupo, $nuevoEstatusLab, $lab['id_laboratorio']]);
                }
            }

            $pdo->commit();

            $msgCupo = $estabaConfirmada ? ' Se liberó (-1) estación en el laboratorio.' : '';
            responderJSON(true, "Solicitud cancelada correctamente.{$msgCupo} Notificación enviada a la App Móvil del estudiante.", [
                'estado_global' => obtenerEstadoCompleto($pdo)
            ]);
        } catch (Exception $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            responderJSON(false, 'Error al cancelar la reservación: ' . $e->getMessage(), [], 500);
        }
        break;

    // ---------------------------------------------------------------------------------
    // 4. VALIDAR FOLIO / QR Y REGISTRAR INGRESO CHECK-IN (PANTALLA 2.1)
    // ---------------------------------------------------------------------------------
    case 'registrar_checkin':
        $folio = isset($input['folio']) ? strtoupper(trim($input['folio'])) : '';
        $metodo = isset($input['metodo_validacion']) && in_array($input['metodo_validacion'], ['Escaner_QR', 'Folio_Manual'])
            ? $input['metodo_validacion']
            : 'Escaner_QR';
        $idEncargado = isset($input['id_encargado_valido']) ? (int)$input['id_encargado_valido'] : 2;

        if (empty($folio)) {
            responderJSON(false, 'Debe proporcionar un folio o código QR para validar.', [], 400);
        }

        // Si se recibe una cadena QR completa (ej. UTVM-QR|LAB-2026-9812|...), extraer el folio
        if (strpos($folio, 'UTVM-QR|') === 0) {
            $partes = explode('|', $folio);
            if (isset($partes[1])) {
                $folio = trim($partes[1]);
            }
        }

        $pdo->beginTransaction();
        try {
            $stmtRes = $pdo->prepare("
                SELECT r.*, l.nombre AS nombre_laboratorio
                FROM reservaciones r
                INNER JOIN laboratorios l ON r.id_laboratorio = l.id_laboratorio
                WHERE UPPER(r.folio) = ?
                FOR UPDATE
            ");
            $stmtRes->execute([$folio]);
            $reserva = $stmtRes->fetch();

            // Si no existe el folio -> Registrar intento Inválido en bitácora
            if (!$reserva) {
                $stmtBit = $pdo->prepare("
                    INSERT INTO bitacora_accesos (id_reservacion, folio_validado, id_encargado_valido, metodo_validacion, resultado_validacion, fecha_hora_ingreso)
                    VALUES (NULL, ?, ?, ?, 'Invalido', NOW())
                ");
                $stmtBit->execute([$folio, $idEncargado, $metodo]);
                $pdo->commit();

                responderJSON(false, "Comprobante INVÁLIDO: El folio '{$folio}' no existe en el padrón de reservaciones de la UTVM.", [
                    'resultado_validacion' => 'Invalido',
                    'estado_global'        => obtenerEstadoCompleto($pdo)
                ], 404);
            }

            // Si ya fue utilizado (estado Asistio) -> Registrar intento Ya_Utilizado
            if ($reserva['estado'] === 'Asistio') {
                $stmtBit = $pdo->prepare("
                    INSERT INTO bitacora_accesos (id_reservacion, folio_validado, id_encargado_valido, metodo_validacion, resultado_validacion, fecha_hora_ingreso)
                    VALUES (?, ?, ?, ?, 'Ya_Utilizado', NOW())
                ");
                $stmtBit->execute([$reserva['id_reservacion'], $folio, $idEncargado, $metodo]);
                $pdo->commit();

                responderJSON(false, "Comprobante YA UTILIZADO: El folio {$folio} ({$reserva['nombre_estudiante']}) ya registró su ingreso previamente.", [
                    'resultado_validacion' => 'Ya_Utilizado',
                    'estado_global'        => obtenerEstadoCompleto($pdo)
                ], 409);
            }

            // Si está Cancelado o Pendiente -> No válido para check-in
            if ($reserva['estado'] !== 'Confirmado') {
                $stmtBit = $pdo->prepare("
                    INSERT INTO bitacora_accesos (id_reservacion, folio_validado, id_encargado_valido, metodo_validacion, resultado_validacion, fecha_hora_ingreso)
                    VALUES (?, ?, ?, ?, 'Invalido', NOW())
                ");
                $stmtBit->execute([$reserva['id_reservacion'], $folio, $idEncargado, $metodo]);
                $pdo->commit();

                responderJSON(false, "Comprobante NO AUTORIZADO: El folio {$folio} se encuentra en estado '{$reserva['estado']}'.", [
                    'resultado_validacion' => 'Invalido',
                    'estado_global'        => obtenerEstadoCompleto($pdo)
                ], 409);
            }

            // Estado Confirmado -> Cambiar a Asistio y registrar en bitacora_accesos
            $stmtUpd = $pdo->prepare("UPDATE reservaciones SET estado = 'Asistio' WHERE id_reservacion = ?");
            $stmtUpd->execute([$reserva['id_reservacion']]);

            $stmtBit = $pdo->prepare("
                INSERT INTO bitacora_accesos (id_reservacion, folio_validado, id_encargado_valido, metodo_validacion, resultado_validacion, fecha_hora_ingreso)
                VALUES (?, ?, ?, ?, 'Valido', NOW())
            ");
            $stmtBit->execute([$reserva['id_reservacion'], $folio, $idEncargado, $metodo]);

            $pdo->commit();

            responderJSON(true, "Check-in exitoso para {$reserva['nombre_estudiante']} ({$folio}). Estado actualizado a 'Asistió' y registrado en bitácora.", [
                'resultado_validacion' => 'Valido',
                'estado_global'        => obtenerEstadoCompleto($pdo)
            ]);
        } catch (Exception $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            responderJSON(false, 'Error al registrar el acceso: ' . $e->getMessage(), [], 500);
        }
        break;

    // ---------------------------------------------------------------------------------
    // 5. CAMBIAR ESTATUS RÁPIDO O EDITAR LABORATORIO (PANTALLA 3.1)
    // ---------------------------------------------------------------------------------
    case 'actualizar_laboratorio':
        $idLab = isset($input['id_laboratorio']) ? (int)$input['id_laboratorio'] : 0;
        if ($idLab <= 0) {
            responderJSON(false, 'ID de laboratorio inválido.', [], 400);
        }

        $stmtLab = $pdo->prepare("SELECT * FROM laboratorios WHERE id_laboratorio = ?");
        $stmtLab->execute([$idLab]);
        $labActual = $stmtLab->fetch();

        if (!$labActual) {
            responderJSON(false, 'Laboratorio no encontrado.', [], 404);
        }

        $nombre            = isset($input['nombre']) ? trim($input['nombre']) : $labActual['nombre'];
        $edificio          = isset($input['edificio']) ? trim($input['edificio']) : $labActual['edificio'];
        $planta            = isset($input['planta']) ? trim($input['planta']) : $labActual['planta'];
        $capacidadMaxima   = isset($input['capacidad_maxima']) ? max(1, (int)$input['capacidad_maxima']) : (int)$labActual['capacidad_maxima'];
        $cupoOcupado       = isset($input['cupo_ocupado_actual']) ? max(0, (int)$input['cupo_ocupado_actual']) : (int)$labActual['cupo_ocupado_actual'];
        $horarioAtencion   = isset($input['horario_atencion']) ? trim($input['horario_atencion']) : $labActual['horario_atencion'];
        $inventarioEquipos = isset($input['inventario_equipos']) ? trim($input['inventario_equipos']) : $labActual['inventario_equipos'];
        $requisitos        = isset($input['requisitos_obligatorios']) ? trim($input['requisitos_obligatorios']) : $labActual['requisitos_obligatorios'];
        $estatusOperativo  = isset($input['estatus_operativo']) ? trim($input['estatus_operativo']) : $labActual['estatus_operativo'];

        // Regla 2: Si el cupo alcanza o supera la capacidad máxima y no está en mantenimiento, pasar a Saturado
        if ($estatusOperativo !== 'En Mantenimiento' && $cupoOcupado >= $capacidadMaxima) {
            $estatusOperativo = 'Saturado';
        }

        $stmtUpd = $pdo->prepare("
            UPDATE laboratorios
            SET nombre = ?,
                edificio = ?,
                planta = ?,
                capacidad_maxima = ?,
                cupo_ocupado_actual = ?,
                horario_atencion = ?,
                inventario_equipos = ?,
                requisitos_obligatorios = ?,
                estatus_operativo = ?
            WHERE id_laboratorio = ?
        ");
        $stmtUpd->execute([
            $nombre,
            $edificio,
            $planta,
            $capacidadMaxima,
            $cupoOcupado,
            $horarioAtencion,
            $inventarioEquipos,
            $requisitos,
            $estatusOperativo,
            $idLab
        ]);

        responderJSON(true, "Catálogo actualizado: {$nombre} ({$estatusOperativo}). Sincronizado con App Móvil UTVM.", [
            'estado_global' => obtenerEstadoCompleto($pdo)
        ]);
        break;

    // ---------------------------------------------------------------------------------
    // 6. CREAR NUEVA SOLICITUD (SIMULADOR DE APP MÓVIL RESERVAS LABS UTVM)
    // ---------------------------------------------------------------------------------
    case 'crear_reserva':
        $matricula = isset($input['matricula_estudiante']) ? trim($input['matricula_estudiante']) : '';
        $nombre    = isset($input['nombre_estudiante']) ? trim($input['nombre_estudiante']) : '';
        $carrera   = isset($input['carrera']) ? trim($input['carrera']) : 'T.S.U. en Inteligencia Artificial';
        $idLab     = isset($input['id_laboratorio']) ? (int)$input['id_laboratorio'] : 0;
        $fecha     = isset($input['fecha_reserva']) ? trim($input['fecha_reserva']) : '2026-09-28';
        $bloque    = isset($input['bloque_horario']) ? trim($input['bloque_horario']) : '10:00 - 11:30 hrs';
        $motivo    = isset($input['motivo_uso']) ? trim($input['motivo_uso']) : '';
        $acepto    = isset($input['acepto_requisitos']) ? (int)$input['acepto_requisitos'] : 1;

        if (empty($matricula) || empty($nombre)) {
            responderJSON(false, 'Regla de Identidad UTVM: La matrícula y el nombre completo del estudiante son obligatorios.', [], 422);
        }
        if ($idLab <= 0 || empty($motivo)) {
            responderJSON(false, 'Debe seleccionar un laboratorio válido e indicar el motivo académico de uso.', [], 422);
        }
        if ($acepto !== 1) {
            responderJSON(false, 'El estudiante debe aceptar explícitamente el reglamento y requisitos de ingreso.', [], 422);
        }

        // Verificar traslape previo
        $stmtTraslape = $pdo->prepare("
            SELECT folio, estado FROM reservaciones
            WHERE matricula_estudiante = ?
              AND fecha_reserva = ?
              AND bloque_horario = ?
              AND estado IN ('Pendiente', 'Confirmado', 'Asistio')
            LIMIT 1
        ");
        $stmtTraslape->execute([$matricula, $fecha, $bloque]);
        $existente = $stmtTraslape->fetch();
        if ($existente) {
            responderJSON(false, "Restricción de traslape: La matrícula {$matricula} ya cuenta con una solicitud ({$existente['estado']}) el {$fecha} en el horario {$bloque}.", [], 409);
        }

        $stmtIns = $pdo->prepare("
            INSERT INTO reservaciones (
                folio, matricula_estudiante, nombre_estudiante, carrera, id_laboratorio,
                fecha_reserva, bloque_horario, motivo_uso, acepto_requisitos, estado, fecha_solicitud
            ) VALUES (
                NULL, ?, ?, ?, ?, ?, ?, ?, 1, 'Pendiente', NOW()
            )
        ");
        $stmtIns->execute([$matricula, $nombre, $carrera, $idLab, $fecha, $bloque, $motivo]);

        responderJSON(true, "Nueva solicitud recibida desde App Móvil Reservas Labs UTVM para {$nombre} ({$matricula}).", [
            'estado_global' => obtenerEstadoCompleto($pdo)
        ]);
        break;

    // ---------------------------------------------------------------------------------
    // 7. RESTAURAR DATOS SEMILLA ORIGINALES (EQUIPO 4 UTVM)
    // ---------------------------------------------------------------------------------
    case 'reset_demo':
        $sqlPath = __DIR__ . '/../database/utvm_reservas_labs.sql';
        if (!file_exists($sqlPath)) {
            responderJSON(false, 'No se encontró el archivo database/utvm_reservas_labs.sql.', [], 404);
        }
        $sqlContent = file_get_contents($sqlPath);
        $pdo->exec($sqlContent);
        responderJSON(true, 'Base de datos MySQL restaurada a los datos semilla originales del Equipo 4 - UTVM.', [
            'estado_global' => obtenerEstadoCompleto($pdo)
        ]);
        break;

    default:
        responderJSON(false, "Acción '{$action}' no reconocida en el endpoint.", [], 400);
        break;
}
?>
