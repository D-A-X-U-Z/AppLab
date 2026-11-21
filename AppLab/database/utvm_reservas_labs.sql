-- =====================================================================================
-- SISTEMA ADMINISTRADOR WEB DE RESERVACIÓN DE LABORATORIOS ACADÉMICOS - UTVM
-- Sincronizado con App Móvil "Reservas Labs UTVM"
-- Entorno: XAMPP Local (Apache + MySQL / MariaDB + phpMyAdmin)
-- Puerto MySQL: 3306 | Usuario: root | Contraseña: "" (vacía)
-- =====================================================================================
-- Institución: Universidad Tecnológica del Valle del Mezquital (UTVM)
-- Asignatura:  Metodología No Code con IA
-- Docente:     Mtro. Omar Hernández Landeros
-- Grupo:       "C", Cuatrimestre 4, T.S.U. en Inteligencia Artificial
-- Equipo 4:
--   1. Erick Francisco Ramírez Bautista (2530706)
--   2. Jonathan Axel Rafael Reyes (2530701)
--   3. Diana (2530702)
--   4. Misael López Lucio (2530703)
--   5. Daniel Emiliano García Cardón (2530704)
-- =====================================================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "-06:00";

-- -------------------------------------------------------------------------------------
-- 1. CREACIÓN DE LA BASE DE DATOS
-- -------------------------------------------------------------------------------------
CREATE DATABASE IF NOT EXISTS `utvm_reservas_labs`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `utvm_reservas_labs`;

-- Desactivar temporalmente claves foráneas para recreación limpia
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `bitacora_accesos`;
DROP TABLE IF EXISTS `reservaciones`;
DROP TABLE IF EXISTS `laboratorios`;
DROP TABLE IF EXISTS `usuarios_admin`;

SET FOREIGN_KEY_CHECKS = 1;

-- -------------------------------------------------------------------------------------
-- 2. TABLA: usuarios_admin
-- -------------------------------------------------------------------------------------
CREATE TABLE `usuarios_admin` (
  `id_usuario` INT(11) NOT NULL AUTO_INCREMENT,
  `nombre_completo` VARCHAR(120) NOT NULL,
  `correo` VARCHAR(120) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `rol` ENUM('Administrador', 'Encargado') NOT NULL DEFAULT 'Encargado',
  `activo` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------------------------
-- 3. TABLA: laboratorios
-- -------------------------------------------------------------------------------------
CREATE TABLE `laboratorios` (
  `id_laboratorio` INT(11) NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(120) NOT NULL,
  `edificio` VARCHAR(60) NOT NULL,
  `planta` VARCHAR(60) NOT NULL,
  `capacidad_maxima` INT(11) NOT NULL DEFAULT 25,
  `cupo_ocupado_actual` INT(11) NOT NULL DEFAULT 0,
  `horario_atencion` VARCHAR(80) NOT NULL DEFAULT '07:00 - 19:00 hrs',
  `inventario_equipos` TEXT NOT NULL,
  `requisitos_obligatorios` TEXT NOT NULL,
  `estatus_operativo` ENUM('Disponible', 'Saturado', 'En Mantenimiento') NOT NULL DEFAULT 'Disponible',
  `id_encargado` INT(11) DEFAULT NULL,
  PRIMARY KEY (`id_laboratorio`),
  KEY `fk_lab_encargado` (`id_encargado`),
  CONSTRAINT `fk_lab_encargado` FOREIGN KEY (`id_encargado`) REFERENCES `usuarios_admin` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------------------------
-- 4. TABLA: reservaciones
-- -------------------------------------------------------------------------------------
CREATE TABLE `reservaciones` (
  `id_reservacion` INT(11) NOT NULL AUTO_INCREMENT,
  `folio` VARCHAR(30) DEFAULT NULL UNIQUE,
  `matricula_estudiante` VARCHAR(20) NOT NULL,
  `nombre_estudiante` VARCHAR(120) NOT NULL,
  `carrera` VARCHAR(120) NOT NULL,
  `id_laboratorio` INT(11) NOT NULL,
  `fecha_reserva` DATE NOT NULL,
  `bloque_horario` VARCHAR(50) NOT NULL,
  `motivo_uso` TEXT NOT NULL,
  `acepto_requisitos` TINYINT(1) NOT NULL DEFAULT 1,
  `estado` ENUM('Pendiente', 'Confirmado', 'Asistio', 'Cancelado') NOT NULL DEFAULT 'Pendiente',
  `motivo_cancelacion` TEXT DEFAULT NULL,
  `codigo_qr_hash` VARCHAR(150) DEFAULT NULL,
  `fecha_solicitud` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_reservacion`),
  KEY `fk_reserva_laboratorio` (`id_laboratorio`),
  KEY `idx_matricula_fecha_bloque` (`matricula_estudiante`, `fecha_reserva`, `bloque_horario`),
  CONSTRAINT `fk_reserva_laboratorio` FOREIGN KEY (`id_laboratorio`) REFERENCES `laboratorios` (`id_laboratorio`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------------------------
-- 5. TABLA: bitacora_accesos
-- -------------------------------------------------------------------------------------
CREATE TABLE `bitacora_accesos` (
  `id_acceso` INT(11) NOT NULL AUTO_INCREMENT,
  `id_reservacion` INT(11) DEFAULT NULL,
  `folio_validado` VARCHAR(30) NOT NULL,
  `id_encargado_valido` INT(11) DEFAULT NULL,
  `metodo_validacion` ENUM('Escaner_QR', 'Folio_Manual') NOT NULL DEFAULT 'Escaner_QR',
  `resultado_validacion` ENUM('Valido', 'Invalido', 'Ya_Utilizado') NOT NULL DEFAULT 'Valido',
  `fecha_hora_ingreso` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_acceso`),
  KEY `fk_bitacora_reservacion` (`id_reservacion`),
  KEY `fk_bitacora_encargado` (`id_encargado_valido`),
  CONSTRAINT `fk_bitacora_reservacion` FOREIGN KEY (`id_reservacion`) REFERENCES `reservaciones` (`id_reservacion`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_bitacora_encargado` FOREIGN KEY (`id_encargado_valido`) REFERENCES `usuarios_admin` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================================
-- 6. DATOS SEMILLA OBLIGATORIOS (SEED DATA)
-- =====================================================================================

-- 6.1 Usuarios Administradores y Encargados
INSERT INTO `usuarios_admin` (`id_usuario`, `nombre_completo`, `correo`, `password_hash`, `rol`, `activo`) VALUES
(1, 'Mtro. Omar Hernández Landeros', 'ohernandez@utvm.edu.mx', '$2y$10$utvmAdminHash2026CoordinadorAcademicoTI', 'Administrador', 1),
(2, 'Ing. Roberto Carlos Mejía Vega', 'rmejia.labs@utvm.edu.mx', '$2y$10$utvmEncargadoHash2026LabSistemasEmbebidos', 'Encargado', 1),
(3, 'Mtra. Laura Patricia Gómez Soto', 'lgomez.labs@utvm.edu.mx', '$2y$10$utvmEncargadoHash2026LabInteligenciaArt', 'Encargado', 1);

-- 6.2 Catálogo de Laboratorios Académicos UTVM
INSERT INTO `laboratorios` (
  `id_laboratorio`,
  `nombre`,
  `edificio`,
  `planta`,
  `capacidad_maxima`,
  `cupo_ocupado_actual`,
  `horario_atencion`,
  `inventario_equipos`,
  `requisitos_obligatorios`,
  `estatus_operativo`,
  `id_encargado`
) VALUES
(
  1,
  'Laboratorio de Sistemas Embebidos',
  'Edificio K',
  'Planta Alta',
  20,
  8,
  '07:00 - 18:00 hrs',
  'Kits ESP32, Arduino, Sensores PIR/DHT11, Osciloscopios, Multímetros Digitales, Fuentes Reguladas',
  'Credencial institucional vigente, Bata de laboratorio abotonada, Pulsera antiestática, No introducir alimentos ni bebidas',
  'Disponible',
  2
),
(
  2,
  'Laboratorio de Inteligencia Artificial',
  'Edificio K',
  'Planta Alta',
  25,
  14,
  '07:00 - 19:00 hrs',
  'Workstations GPU RTX, Python/TensorFlow, Cámaras Visión Artificial, Jetson Nano, Entornos Jupyter/CUDA',
  'Credencial institucional vigente, Cuenta institucional activa, Respaldo en nube propio, Prohibido alterar configuraciones CUDA',
  'Disponible',
  3
),
(
  3,
  'Laboratorio de Desarrollo de Software',
  'Edificio D',
  'Planta Baja',
  30,
  29,
  '07:00 - 20:00 hrs',
  'PCs con VS Code, XAMPP, MySQL, SQL Server, Flutter SDK, Android Studio, Git',
  'Credencial institucional vigente, Registro en bitácora digital, No desconectar cables de red UTP, Cerrar sesión al finalizar',
  'Disponible',
  2
),
(
  4,
  'Laboratorio de Redes y Ciberseguridad',
  'Edificio D',
  'Planta Alta',
  20,
  0,
  '08:00 - 17:00 hrs',
  'Racks de Servidores, Routers/Switches Cisco, Entornos de Pentesting, Analizadores de Protocolos, Patch Panels',
  'Credencial institucional vigente, Autorización docente firmada para prácticas en rack, No reiniciar switches troncales',
  'En Mantenimiento',
  3
);

-- 6.3 Reservaciones (Integrantes del Equipo 4 + Registros de Auditoría/Cancelados)
INSERT INTO `reservaciones` (
  `id_reservacion`,
  `folio`,
  `matricula_estudiante`,
  `nombre_estudiante`,
  `carrera`,
  `id_laboratorio`,
  `fecha_reserva`,
  `bloque_horario`,
  `motivo_uso`,
  `acepto_requisitos`,
  `estado`,
  `motivo_cancelacion`,
  `codigo_qr_hash`,
  `fecha_solicitud`
) VALUES
(
  1,
  NULL,
  '2530706',
  'Erick Francisco Ramírez Bautista',
  'T.S.U. en Inteligencia Artificial',
  1,
  '2026-09-28',
  '10:00 - 11:30 hrs',
  'Práctica de microcontroladores y sensores de movimiento PIR',
  1,
  'Pendiente',
  NULL,
  NULL,
  '2026-09-28 08:15:00'
),
(
  2,
  'LAB-2026-9813',
  '2530701',
  'Jonathan Axel Rafael Reyes',
  'T.S.U. en Inteligencia Artificial',
  2,
  '2026-09-28',
  '11:30 - 13:00 hrs',
  'Entrenamiento de modelo predictivo con TensorFlow e integración IoT con ESP32',
  1,
  'Confirmado',
  NULL,
  'UTVM-QR|LAB-2026-9813|2530701|LAB2|2026-09-28|11:30-13:00',
  '2026-09-28 07:50:00'
),
(
  3,
  'LAB-2026-9814',
  '2530702',
  'Diana',
  'T.S.U. en Inteligencia Artificial',
  2,
  '2026-09-28',
  '11:30 - 13:00 hrs',
  'Pruebas de visión artificial y optimización de redes neuronales',
  1,
  'Confirmado',
  NULL,
  'UTVM-QR|LAB-2026-9814|2530702|LAB2|2026-09-28|11:30-13:00',
  '2026-09-28 07:55:00'
),
(
  4,
  'LAB-2026-9810',
  '2530703',
  'Misael López Lucio',
  'T.S.U. en Inteligencia Artificial',
  1,
  '2026-09-28',
  '08:30 - 10:00 hrs',
  'Calibración de sensores ultrasónicos y pantalla OLED I2C',
  1,
  'Asistio',
  NULL,
  'UTVM-QR|LAB-2026-9810|2530703|LAB1|2026-09-28|08:30-10:00',
  '2026-09-27 18:20:00'
),
(
  5,
  NULL,
  '2530704',
  'Daniel Emiliano García Cardón',
  'T.S.U. en Inteligencia Artificial',
  3,
  '2026-09-28',
  '13:00 - 14:30 hrs',
  'Conexión de base de datos MySQL con XAMPP/phpMyAdmin y pruebas de API',
  1,
  'Pendiente',
  NULL,
  NULL,
  '2026-09-28 08:40:00'
),
(
  6,
  'LAB-2026-9805',
  '2530719',
  'Carlos Eduardo Mendoza Pérez',
  'T.S.U. en Desarrollo de Software Multiplataforma',
  4,
  '2026-09-28',
  '10:00 - 11:30 hrs',
  'Configuración de VLANs y enrutamiento dinámico OSPF en routers Cisco',
  1,
  'Cancelado',
  'El Laboratorio de Redes y Ciberseguridad se encuentra en mantenimiento preventivo de racks y actualización de firmware.',
  NULL,
  '2026-09-27 16:10:00'
),
(
  7,
  'LAB-2026-9808',
  '2530725',
  'Fernanda Guadalupe Torres Ángeles',
  'Ingeniería en Tecnologías de la Información e Innovación Digital',
  3,
  '2026-09-28',
  '08:30 - 10:00 hrs',
  'Despliegue de contenedores y pruebas de estrés en servidor Apache local',
  1,
  'Cancelado',
  'Cancelación solicitada por traslape con evaluación parcial extraordinaria de Base de Datos.',
  NULL,
  '2026-09-27 19:05:00'
);

-- 6.4 Bitácora de Accesos Inicial (Check-in de Misael López Lucio a las 08:32 hrs)
INSERT INTO `bitacora_accesos` (
  `id_acceso`,
  `id_reservacion`,
  `folio_validado`,
  `id_encargado_valido`,
  `metodo_validacion`,
  `resultado_validacion`,
  `fecha_hora_ingreso`
) VALUES
(
  1,
  4,
  'LAB-2026-9810',
  2,
  'Escaner_QR',
  'Valido',
  '2026-09-28 08:32:14'
);

COMMIT;
