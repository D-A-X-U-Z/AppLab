/**
 * =====================================================================================
 * LÓGICA PRINCIPAL Y MODO HÍBRIDO (XAMPP MYSQL + LOCALSTORAGE FALLBACK)
 * SISTEMA ADMINISTRADOR WEB DE RESERVACIÓN DE LABORATORIOS ACADÉMICOS - UTVM
 * =====================================================================================
 * Institución: Universidad Tecnológica del Valle del Mezquital (UTVM)
 * Asignatura:  Metodología No Code con IA
 * Docente:     Mtro. Omar Hernández Landeros
 * Grupo:       "C", Cuatrimestre 4, T.S.U. en Inteligencia Artificial
 * Equipo 4:
 *   - Erick Francisco Ramírez Bautista (2530706)
 *   - Jonathan Axel Rafael Reyes (2530701)
 *   - Diana (2530702)
 *   - Misael López Lucio (2530703)
 *   - Daniel Emiliano García Cardón (2530704)
 * =====================================================================================
 */

const STORAGE_KEY = 'utvm_reservas_labs_state_v2';

//Endpoints candidatos para detección automática de XAMPP
const API_CANDIDATES = [
  './api/endpoints.php',
  'http://localhost/utvm_reservas_labs/api/endpoints.php',
  'http://127.0.0.1/utvm_reservas_labs/api/endpoints.php'
];

// Datos Semilla Iniciales (Idénticos a database/utvm_reservas_labs.sql)
const INITIAL_SEED_DATA = {
  usuarios_admin: [
    {
      id_usuario: 1,
      nombre_completo: 'Mtro. Omar Hernández Landeros',
      correo: 'ohernandez@utvm.edu.mx',
      rol: 'Administrador',
      activo: 1
    },
    {
      id_usuario: 2,
      nombre_completo: 'Ing. Roberto Carlos Mejía Vega',
      correo: 'rmejia.labs@utvm.edu.mx',
      rol: 'Encargado',
      activo: 1
    },
    {
      id_usuario: 3,
      nombre_completo: 'Mtra. Laura Patricia Gómez Soto',
      correo: 'lgomez.labs@utvm.edu.mx',
      rol: 'Encargado',
      activo: 1
    }
  ],
  laboratorios: [
    {
      id_laboratorio: 1,
      nombre: 'Laboratorio de Sistemas Embebidos',
      edificio: 'Edificio K',
      planta: 'Planta Alta',
      capacidad_maxima: 20,
      cupo_ocupado_actual: 8,
      horario_atencion: '07:00 - 18:00 hrs',
      inventario_equipos: 'Kits ESP32, Arduino, Sensores PIR/DHT11, Osciloscopios, Multímetros Digitales, Fuentes Reguladas',
      requisitos_obligatorios: 'Credencial institucional vigente, Bata de laboratorio abotonada, Pulsera antiestática, No introducir alimentos ni bebidas',
      estatus_operativo: 'Disponible',
      id_encargado: 2,
      nombre_encargado: 'Ing. Roberto Carlos Mejía Vega'
    },
    {
      id_laboratorio: 2,
      nombre: 'Laboratorio de Inteligencia Artificial',
      edificio: 'Edificio K',
      planta: 'Planta Alta',
      capacidad_maxima: 25,
      cupo_ocupado_actual: 14,
      horario_atencion: '07:00 - 19:00 hrs',
      inventario_equipos: 'Workstations GPU RTX, Python/TensorFlow, Cámaras Visión Artificial, Jetson Nano, Entornos Jupyter/CUDA',
      requisitos_obligatorios: 'Credencial institucional vigente, Cuenta institucional activa, Respaldo en nube propio, Prohibido alterar configuraciones CUDA',
      estatus_operativo: 'Disponible',
      id_encargado: 3,
      nombre_encargado: 'Mtra. Laura Patricia Gómez Soto'
    },
    {
      id_laboratorio: 3,
      nombre: 'Laboratorio de Desarrollo de Software',
      edificio: 'Edificio D',
      planta: 'Planta Baja',
      capacidad_maxima: 30,
      cupo_ocupado_actual: 29,
      horario_atencion: '07:00 - 20:00 hrs',
      inventario_equipos: 'PCs con VS Code, XAMPP, MySQL, SQL Server, Flutter SDK, Android Studio, Git',
      requisitos_obligatorios: 'Credencial institucional vigente, Registro en bitácora digital, No desconectar cables de red UTP, Cerrar sesión al finalizar',
      estatus_operativo: 'Disponible',
      id_encargado: 2,
      nombre_encargado: 'Ing. Roberto Carlos Mejía Vega'
    },
    {
      id_laboratorio: 4,
      nombre: 'Laboratorio de Redes y Ciberseguridad',
      edificio: 'Edificio D',
      planta: 'Planta Alta',
      capacidad_maxima: 20,
      cupo_ocupado_actual: 0,
      horario_atencion: '08:00 - 17:00 hrs',
      inventario_equipos: 'Racks de Servidores, Routers/Switches Cisco, Entornos de Pentesting, Analizadores de Protocolos, Patch Panels',
      requisitos_obligatorios: 'Credencial institucional vigente, Autorización docente firmada para prácticas en rack, No reiniciar switches troncales',
      estatus_operativo: 'En Mantenimiento',
      id_encargado: 3,
      nombre_encargado: 'Mtra. Laura Patricia Gómez Soto'
    }
  ],
  reservaciones: [
    {
      id_reservacion: 1,
      folio: null,
      matricula_estudiante: '2530706',
      nombre_estudiante: 'Erick Francisco Ramírez Bautista',
      carrera: 'T.S.U. en Inteligencia Artificial',
      id_laboratorio: 1,
      nombre_laboratorio: 'Laboratorio de Sistemas Embebidos',
      edificio: 'Edificio K',
      planta: 'Planta Alta',
      fecha_reserva: '2026-09-28',
      bloque_horario: '10:00 - 11:30 hrs',
      motivo_uso: 'Práctica de microcontroladores y sensores de movimiento PIR',
      acepto_requisitos: 1,
      estado: 'Pendiente',
      motivo_cancelacion: null,
      codigo_qr_hash: null,
      fecha_solicitud: '2026-09-28 08:15:00'
    },
    {
      id_reservacion: 2,
      folio: 'LAB-2026-9813',
      matricula_estudiante: '2530701',
      nombre_estudiante: 'Jonathan Axel Rafael Reyes',
      carrera: 'T.S.U. en Inteligencia Artificial',
      id_laboratorio: 2,
      nombre_laboratorio: 'Laboratorio de Inteligencia Artificial',
      edificio: 'Edificio K',
      planta: 'Planta Alta',
      fecha_reserva: '2026-09-28',
      bloque_horario: '11:30 - 13:00 hrs',
      motivo_uso: 'Entrenamiento de modelo predictivo con TensorFlow e integración IoT con ESP32',
      acepto_requisitos: 1,
      estado: 'Confirmado',
      motivo_cancelacion: null,
      codigo_qr_hash: 'UTVM-QR|LAB-2026-9813|2530701|LAB2|2026-09-28|11:30-13:00',
      fecha_solicitud: '2026-09-28 07:50:00'
    },
    {
      id_reservacion: 3,
      folio: 'LAB-2026-9814',
      matricula_estudiante: '2530702',
      nombre_estudiante: 'Diana',
      carrera: 'T.S.U. en Inteligencia Artificial',
      id_laboratorio: 2,
      nombre_laboratorio: 'Laboratorio de Inteligencia Artificial',
      edificio: 'Edificio K',
      planta: 'Planta Alta',
      fecha_reserva: '2026-09-28',
      bloque_horario: '11:30 - 13:00 hrs',
      motivo_uso: 'Pruebas de visión artificial y optimización de redes neuronales',
      acepto_requisitos: 1,
      estado: 'Confirmado',
      motivo_cancelacion: null,
      codigo_qr_hash: 'UTVM-QR|LAB-2026-9814|2530702|LAB2|2026-09-28|11:30-13:00',
      fecha_solicitud: '2026-09-28 07:55:00'
    },
    {
      id_reservacion: 4,
      folio: 'LAB-2026-9810',
      matricula_estudiante: '2530703',
      nombre_estudiante: 'Misael López Lucio',
      carrera: 'T.S.U. en Inteligencia Artificial',
      id_laboratorio: 1,
      nombre_laboratorio: 'Laboratorio de Sistemas Embebidos',
      edificio: 'Edificio K',
      planta: 'Planta Alta',
      fecha_reserva: '2026-09-28',
      bloque_horario: '08:30 - 10:00 hrs',
      motivo_uso: 'Calibración de sensores ultrasónicos y pantalla OLED I2C',
      acepto_requisitos: 1,
      estado: 'Asistio',
      motivo_cancelacion: null,
      codigo_qr_hash: 'UTVM-QR|LAB-2026-9810|2530703|LAB1|2026-09-28|08:30-10:00',
      fecha_solicitud: '2026-09-27 18:20:00'
    },
    {
      id_reservacion: 5,
      folio: null,
      matricula_estudiante: '2530704',
      nombre_estudiante: 'Daniel Emiliano García Cardón',
      carrera: 'T.S.U. en Inteligencia Artificial',
      id_laboratorio: 3,
      nombre_laboratorio: 'Laboratorio de Desarrollo de Software',
      edificio: 'Edificio D',
      planta: 'Planta Baja',
      fecha_reserva: '2026-09-28',
      bloque_horario: '13:00 - 14:30 hrs',
      motivo_uso: 'Conexión de base de datos MySQL con XAMPP/phpMyAdmin y pruebas de API',
      acepto_requisitos: 1,
      minus_one_alert: true,
      estado: 'Pendiente',
      motivo_cancelacion: null,
      codigo_qr_hash: null,
      fecha_solicitud: '2026-09-28 08:40:00'
    },
    {
      id_reservacion: 6,
      folio: 'LAB-2026-9805',
      matricula_estudiante: '2530719',
      nombre_estudiante: 'Carlos Eduardo Mendoza Pérez',
      carrera: 'T.S.U. en Desarrollo de Software Multiplataforma',
      id_laboratorio: 4,
      nombre_laboratorio: 'Laboratorio de Redes y Ciberseguridad',
      edificio: 'Edificio D',
      planta: 'Planta Alta',
      fecha_reserva: '2026-09-28',
      bloque_horario: '10:00 - 11:30 hrs',
      motivo_uso: 'Configuración de VLANs y enrutamiento dinámico OSPF en routers Cisco',
      acepto_requisitos: 1,
      estado: 'Cancelado',
      motivo_cancelacion: 'El Laboratorio de Redes y Ciberseguridad se encuentra en mantenimiento preventivo de racks y actualización de firmware.',
      codigo_qr_hash: null,
      fecha_solicitud: '2026-09-27 16:10:00'
    },
    {
      id_reservacion: 7,
      folio: 'LAB-2026-9808',
      matricula_estudiante: '2530725',
      nombre_estudiante: 'Fernanda Guadalupe Torres Ángeles',
      carrera: 'Ingeniería en Tecnologías de la Información e Innovación Digital',
      id_laboratorio: 3,
      nombre_laboratorio: 'Laboratorio de Desarrollo de Software',
      edificio: 'Edificio D',
      planta: 'Planta Baja',
      fecha_reserva: '2026-09-28',
      bloque_horario: '08:30 - 10:00 hrs',
      motivo_uso: 'Despliegue de contenedores y pruebas de estrés en servidor Apache local',
      acepto_requisitos: 1,
      estado: 'Cancelado',
      motivo_cancelacion: 'Cancelación solicitada por traslape con evaluación parcial extraordinaria de Base de Datos.',
      codigo_qr_hash: null,
      fecha_solicitud: '2026-09-27 19:05:00'
    }
  ],
  bitacora_accesos: [
    {
      id_acceso: 1,
      id_reservacion: 4,
      folio_validado: 'LAB-2026-9810',
      id_encargado_valido: 2,
      encargado_nombre: 'Ing. Roberto Carlos Mejía Vega',
      nombre_estudiante: 'Misael López Lucio',
      matricula_estudiante: '2530703',
      carrera: 'T.S.U. en Inteligencia Artificial',
      id_laboratorio: 1,
      nombre_laboratorio: 'Laboratorio de Sistemas Embebidos',
      metodo_validacion: 'Escaner_QR',
      resultado_validacion: 'Valido',
      fecha_hora_ingreso: '2026-09-28 08:32:14'
    }
  ]
};

// Estado Reactivo Global de la Aplicación
const appState = {
  connectionMode: 'local', // 'xampp' | 'local'
  activeEndpoint: null,
  activeModule: 'mod1', // 'mod1' | 'mod2' | 'mod3' | 'mod4'
  activeRole: 'Administrador', // 'Administrador' | 'Encargado'
  usuarios_admin: [],
  laboratorios: [],
  reservaciones: [],
  bitacora_accesos: [],
  filtersMod1: {
    search: '',
    fecha: '',
    id_laboratorio: 'Todos',
    estado: 'Todos'
  },
  filtersMod4: {
    fechaInicio: '2026-09-01',
    fechaFin: '2026-10-31',
    id_laboratorio: 'Todos',
    carrera: 'Todas'
  },
  selectedReservaId: null,
  selectedLabEditId: null,
  qrValidationResult: null, // { status: 'VAL' | 'USED' | 'INV', title, subtitle, reserva, metodo, folio }
  cameraStream: null
};

// =====================================================================================
// 1. INICIALIZACIÓN Y SINCRONIZACIÓN HÍBRIDA (XAMPP MYSQL + LOCALSTORAGE)
// =====================================================================================

document.addEventListener('DOMContentLoaded', async () => {
  cargarEstadoLocal();
  await intentarConexionXAMPP(false);
  renderizarTodo();
});

function cargarEstadoLocal() {
  try {
    const guardado = localStorage.getItem(STORAGE_KEY);
    if (guardado) {
      const parsed = JSON.parse(guardado);
      appState.usuarios_admin = parsed.usuarios_admin || structuredClone(INITIAL_SEED_DATA.usuarios_admin);
      appState.laboratorios = parsed.laboratorios || structuredClone(INITIAL_SEED_DATA.laboratorios);
      appState.reservaciones = parsed.reservaciones || structuredClone(INITIAL_SEED_DATA.reservaciones);
      appState.bitacora_accesos = parsed.bitacora_accesos || structuredClone(INITIAL_SEED_DATA.bitacora_accesos);
      return;
    }
  } catch (e) {
    console.warn('Error leyendo localStorage, usando datos semilla UTVM:', e);
  }
  restaurarSemillaLocal();
}

function guardarEstadoLocal() {
  try {
    // Asegurar nombres de laboratorio sincronizados en reservaciones
    appState.reservaciones.forEach(r => {
      const lab = appState.laboratorios.find(l => Number(l.id_laboratorio) === Number(r.id_laboratorio));
      if (lab) {
        r.nombre_laboratorio = lab.nombre;
        r.edificio = lab.edificio;
        r.planta = lab.planta;
      }
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      usuarios_admin: appState.usuarios_admin,
      laboratorios: appState.laboratorios,
      reservaciones: appState.reservaciones,
      bitacora_accesos: appState.bitacora_accesos
    }));
  } catch (e) {
    console.warn('No se pudo guardar en localStorage:', e);
  }
}

function restaurarSemillaLocal() {
  appState.usuarios_admin = JSON.parse(JSON.stringify(INITIAL_SEED_DATA.usuarios_admin));
  appState.laboratorios = JSON.parse(JSON.stringify(INITIAL_SEED_DATA.laboratorios));
  appState.reservaciones = JSON.parse(JSON.stringify(INITIAL_SEED_DATA.reservaciones));
  appState.bitacora_accesos = JSON.parse(JSON.stringify(INITIAL_SEED_DATA.bitacora_accesos));
  guardarEstadoLocal();
}

/**
 * Intenta conectarse con el backend Apache/PHP + MySQL de XAMPP.
 * Si responde con éxito, sincroniza todas las tablas desde MySQL.
 * Si falla (XAMPP apagado o abierto vía archivo local), activa el Modo Demo Local sin errores.
 */
async function intentarConexionXAMPP(mostrarAlerta = false) {
  for (const url of API_CANDIDATES) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2200);
      const resp = await fetch(`${url}?action=get_all`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (resp.ok) {
        const json = await resp.json();
        if (json && json.success && json.data) {
          appState.connectionMode = 'xampp';
          appState.activeEndpoint = url;
          aplicarEstadoDesdeServidor(json.data);
          actualizarIndicadorConexionUI();
          if (mostrarAlerta) {
            mostrarToast('success', 'Conexión XAMPP MySQL Activa', 'Sincronizado en vivo con la base de datos utvm_reservas_labs (puerto 3306).');
          }
          return true;
        }
      }
    } catch (_) {
      // Continuar probando siguiente candidato o pasar a Modo Local
    }
  }

  appState.connectionMode = 'local';
  appState.activeEndpoint = null;
  actualizarIndicadorConexionUI();
  if (mostrarAlerta) {
    mostrarToast('warning', 'Modo Demo Local Activo', 'No se detectó Apache/MySQL en localhost:3306. Operando con base de datos local persistente.');
  }
  return false;
}

function aplicarEstadoDesdeServidor(data) {
  if (data.usuarios_admin) appState.usuarios_admin = data.usuarios_admin;
  if (data.laboratorios) appState.laboratorios = data.laboratorios;
  if (data.reservaciones) appState.reservaciones = data.reservaciones;
  if (data.bitacora_accesos) appState.bitacora_accesos = data.bitacora_accesos;
  guardarEstadoLocal();
}

function actualizarIndicadorConexionUI() {
  const badge = document.getElementById('xampp-status-badge');
  const modalStatus = document.getElementById('modal-xampp-live-status');
  if (!badge) return;

  if (appState.connectionMode === 'xampp') {
    badge.className = 'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-sm cursor-pointer hover:bg-emerald-100 transition';
    badge.innerHTML = `
      <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
      <span>🟢 Conectado a XAMPP MySQL (<code class="font-mono font-bold">utvm_reservas_labs</code>)</span>
    `;
    if (modalStatus) {
      modalStatus.className = 'p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between';
      modalStatus.innerHTML = `
        <div class="flex items-center gap-2.5">
          <span class="text-base">🟢</span>
          <div>
            <p class="font-bold">Conectado a XAMPP MySQL (localhost:3306 / utvm_reservas_labs)</p>
            <p class="text-emerald-700">Endpoint activo: <code class="font-mono">${appState.activeEndpoint}</code></p>
          </div>
        </div>
        <span class="px-2.5 py-1 rounded-md bg-emerald-600 text-white font-bold">EN LÍNEA</span>
      `;
    }
  } else {
    badge.className = 'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300 shadow-sm cursor-pointer hover:bg-amber-100 transition';
    badge.innerHTML = `
      <span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
      <span>🟡 Modo Demo Local (XAMPP desconectado)</span>
    `;
    if (modalStatus) {
      modalStatus.className = 'p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between';
      modalStatus.innerHTML = `
        <div class="flex items-center gap-2.5">
          <span class="text-base">🟡</span>
          <div>
            <p class="font-bold">Modo Demo Local Activo (Persistencia Híbrida en LocalStorage)</p>
            <p class="text-amber-700">Inicie Apache y MySQL (puerto 3306) en XAMPP y presione "Probar Conexión XAMPP" para sincronizar con MySQL.</p>
          </div>
        </div>
        <span class="px-2.5 py-1 rounded-md bg-amber-600 text-white font-bold">FALLBACK LOCAL</span>
      `;
    }
  }
}

// =====================================================================================
// 2. NAVEGACIÓN ENTRE MÓDULOS Y CONMUTADOR DE ROL EN VIVO
// =====================================================================================

function cambiarModulo(modId) {
  appState.activeModule = modId;

  // Detener cámara si salimos del Módulo 2
  if (modId !== 'mod2' && appState.cameraStream) {
    detenerCamaraQR();
  }

  document.querySelectorAll('.module-section').forEach(sec => {
    sec.classList.add('hidden');
  });
  const target = document.getElementById(`section-${modId}`);
  if (target) target.classList.remove('hidden');

  // Actualizar estilos del sidebar
  document.querySelectorAll('.nav-btn').forEach(btn => {
    const isCurrent = btn.getAttribute('data-mod') === modId;
    if (isCurrent) {
      btn.className = 'nav-btn w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold bg-[#047857] text-white shadow-sm transition';
    } else {
      btn.className = 'nav-btn w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium text-emerald-100 hover:bg-white/10 hover:text-white transition';
    }
  });

  renderizarTodo();
}

function cambiarRolEnVivo(nuevoRol) {
  appState.activeRole = nuevoRol;

  const selectRol = document.getElementById('role-switcher-select');
  if (selectRol && selectRol.value !== nuevoRol) {
    selectRol.value = nuevoRol;
  }

  const userDisplay = document.getElementById('active-user-display');
  const roleBadgeHeader = document.getElementById('header-role-badge');

  if (nuevoRol === 'Administrador') {
    if (userDisplay) {
      userDisplay.innerHTML = `
        <p class="text-xs font-bold text-white truncate">Mtro. Omar Hernández Landeros</p>
        <p class="text-[11px] text-emerald-200 truncate">2.1 Administrador / Coordinador Académico</p>
      `;
    }
    if (roleBadgeHeader) {
      roleBadgeHeader.className = 'hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-900 text-emerald-100';
      roleBadgeHeader.innerHTML = `<i data-lucide="shield-check" class="w-3.5 h-3.5"></i> Rol: 2.1 Administrador`;
    }
    mostrarToast('info', 'Rol 2.1 Administrador Activo', 'Permisos completos habilitados: Gestión de agenda, validación QR, edición de catálogo y exportación de reportes.');
  } else {
    if (userDisplay) {
      userDisplay.innerHTML = `
        <p class="text-xs font-bold text-white truncate">Ing. Roberto Carlos Mejía Vega</p>
        <p class="text-[11px] text-amber-200 truncate">2.2 Encargado de Laboratorio</p>
      `;
    }
    if (roleBadgeHeader) {
      roleBadgeHeader.className = 'hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300';
      roleBadgeHeader.innerHTML = `<i data-lucide="user-check" class="w-3.5 h-3.5"></i> Rol: 2.2 Encargado`;
    }
    mostrarToast('info', 'Rol 2.2 Encargado de Laboratorio', 'Vista operativa activa: Gestión de solicitudes, check-in por código QR y consulta de espacios.');
  }

  renderizarTodo();
}

// =====================================================================================
// 3. RENDERIZADO INTEGRAL DE LOS 4 MÓDULOS
// =====================================================================================

function renderizarTodo() {
  actualizarContadoresKPI();
  renderizarModulo1();
  renderizarModulo2();
  renderizarModulo3();
  renderizarModulo4();
  actualizarIndicadorConexionUI();
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function actualizarContadoresKPI() {
  const pendientes = appState.reservaciones.filter(r => r.estado === 'Pendiente').length;
  const confirmadas = appState.reservaciones.filter(r => r.estado === 'Confirmado').length;
  const asistencias = appState.reservaciones.filter(r => r.estado === 'Asistio').length;

  // Estaciones disponibles en laboratorios que no estén En Mantenimiento
  const estacionesDisponibles = appState.laboratorios.reduce((acc, lab) => {
    if (lab.estatus_operativo === 'En Mantenimiento') return acc;
    return acc + Math.max(0, Number(lab.capacidad_maxima) - Number(lab.cupo_ocupado_actual));
  }, 0);

  const capacidadTotalOperativa = appState.laboratorios.reduce((acc, lab) => {
    if (lab.estatus_operativo === 'En Mantenimiento') return acc;
    return acc + Number(lab.capacidad_maxima);
  }, 0);

  setText('kpi-pendientes', pendientes);
  setText('kpi-confirmadas', confirmadas);
  setText('kpi-asistencias', asistencias);
  setText('kpi-estaciones', `${estacionesDisponibles} / ${capacidadTotalOperativa}`);

  // Badges en el Sidebar
  const navBadgePendientes = document.getElementById('nav-badge-pendientes');
  if (navBadgePendientes) {
    navBadgePendientes.textContent = pendientes;
    navBadgePendientes.className = pendientes > 0
      ? 'px-2 py-0.5 text-xs font-bold rounded-full bg-amber-400 text-slate-950'
      : 'px-2 py-0.5 text-xs font-bold rounded-full bg-emerald-800 text-emerald-200';
  }
}

// =====================================================================================
// 4. MÓDULO 1: GESTIÓN DE RESERVACIONES Y AGENDA (PANTALLAS 1.1 Y 1.2)
// =====================================================================================

function actualizarFiltroMod1(campo, valor) {
  appState.filtersMod1[campo] = valor;
  if (campo === 'search') {
    const globalSearch = document.getElementById('global-search-input');
    const mod1Search = document.getElementById('mod1-search-input');
    if (globalSearch && globalSearch.value !== valor) globalSearch.value = valor;
    if (mod1Search && mod1Search.value !== valor) mod1Search.value = valor;
  }
  renderizarModulo1();
  if (window.lucide) window.lucide.createIcons();
}

function limpiarFiltrosMod1() {
  appState.filtersMod1 = {
    search: '',
    fecha: '',
    id_laboratorio: 'Todos',
    estado: 'Todos'
  };
  const globalSearch = document.getElementById('global-search-input');
  const mod1Search = document.getElementById('mod1-search-input');
  const mod1Fecha = document.getElementById('mod1-date-input');
  const mod1Lab = document.getElementById('mod1-lab-select');
  const mod1Estado = document.getElementById('mod1-status-select');

  if (globalSearch) globalSearch.value = '';
  if (mod1Search) mod1Search.value = '';
  if (mod1Fecha) mod1Fecha.value = '';
  if (mod1Lab) mod1Lab.value = 'Todos';
  if (mod1Estado) mod1Estado.value = 'Todos';

  renderizarModulo1();
  if (window.lucide) window.lucide.createIcons();
}

function renderizarModulo1() {
  // Llenar selector de laboratorios si está vacío
  const selectLab = document.getElementById('mod1-lab-select');
  if (selectLab && selectLab.options.length <= 1) {
    selectLab.innerHTML = `<option value="Todos">Todos los laboratorios</option>` +
      appState.laboratorios.map(l => `<option value="${l.id_laboratorio}">${escapeHtml(l.nombre)}</option>`).join('');
    selectLab.value = appState.filtersMod1.id_laboratorio;
  }

  const tbody = document.getElementById('tabla-reservaciones-body');
  const contadorTexto = document.getElementById('mod1-results-count');
  if (!tbody) return;

  const { search, fecha, id_laboratorio, estado } = appState.filtersMod1;
  const q = search.trim().toLowerCase();

  const filtradas = appState.reservaciones.filter(r => {
    const matchSearch = !q ||
      (r.nombre_estudiante && r.nombre_estudiante.toLowerCase().includes(q)) ||
      (r.matricula_estudiante && r.matricula_estudiante.toLowerCase().includes(q)) ||
      (r.folio && r.folio.toLowerCase().includes(q)) ||
      (r.motivo_uso && r.motivo_uso.toLowerCase().includes(q));

    const matchFecha = !fecha || r.fecha_reserva === fecha;
    const matchLab = id_laboratorio === 'Todos' || Number(r.id_laboratorio) === Number(id_laboratorio);
    const matchEstado = estado === 'Todos' || r.estado === estado;

    return matchSearch && matchFecha && matchLab && matchEstado;
  });

  if (contadorTexto) {
    contadorTexto.textContent = `Mostrando ${filtradas.length} de ${appState.reservaciones.length} reservaciones registradas`;
  }

  if (filtradas.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9" class="px-6 py-12 text-center text-slate-500">
          <div class="flex flex-col items-center gap-2">
            <i data-lucide="calendar-x" class="w-10 h-10 text-slate-400"></i>
            <p class="font-semibold text-slate-700">No se encontraron reservaciones con los filtros actuales</p>
            <button onclick="limpiarFiltrosMod1()" class="mt-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-700 text-white hover:bg-emerald-800 transition">
              Restablecer filtros
            </button>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtradas.map(r => {
    const lab = appState.laboratorios.find(l => Number(l.id_laboratorio) === Number(r.id_laboratorio));
    const nombreLab = lab ? lab.nombre : (r.nombre_laboratorio || 'Laboratorio UTVM');
    const esEquipo4CasoPrincipal = r.matricula_estudiante === '2530706';

    const folioHtml = r.folio
      ? `<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-slate-100 text-slate-800 border border-slate-300">
           <i data-lucide="qr-code" class="w-3.5 h-3.5 text-emerald-700"></i> ${escapeHtml(r.folio)}
         </span>`
      : `<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
           <i data-lucide="clock" class="w-3 h-3"></i> Sin asignar (Pendiente)
         </span>`;

    return `
      <tr class="hover:bg-slate-50/90 transition border-b border-slate-100 ${esEquipo4CasoPrincipal && r.estado === 'Pendiente' ? 'bg-amber-50/30' : ''}">
        <td class="px-4 py-3.5 whitespace-nowrap">${folioHtml}</td>
        <td class="px-4 py-3.5">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-full bg-emerald-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
              ${obtenerIniciales(r.nombre_estudiante)}
            </div>
            <div>
              <p class="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                ${escapeHtml(r.nombre_estudiante)}
                ${esEquipo4CasoPrincipal ? `<span class="px-1.5 py-0.5 text-[10px] font-bold rounded bg-emerald-100 text-emerald-800 border border-emerald-300">Caso Sección 5</span>` : ''}
              </p>
              <p class="text-xs text-slate-500">${escapeHtml(r.carrera)}</p>
            </div>
          </div>
        </td>
        <td class="px-4 py-3.5 whitespace-nowrap">
          <span class="font-mono text-xs font-bold px-2 py-1 rounded bg-slate-100 text-slate-800">${escapeHtml(r.matricula_estudiante)}</span>
        </td>
        <td class="px-4 py-3.5">
          <p class="text-xs font-semibold text-slate-800">${escapeHtml(nombreLab)}</p>
          <p class="text-[11px] text-slate-500">${lab ? `${escapeHtml(lab.edificio)} • ${escapeHtml(lab.planta)}` : ''}</p>
        </td>
        <td class="px-4 py-3.5 whitespace-nowrap text-xs font-medium text-slate-700">
          ${escapeHtml(r.fecha_reserva)}
        </td>
        <td class="px-4 py-3.5 whitespace-nowrap">
          <span class="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
            <i data-lucide="clock-3" class="w-3.5 h-3.5 text-emerald-700"></i> ${escapeHtml(r.bloque_horario)}
          </span>
        </td>
        <td class="px-4 py-3.5 max-w-xs">
          <p class="text-xs text-slate-600 line-clamp-2" title="${escapeHtml(r.motivo_uso)}">${escapeHtml(r.motivo_uso)}</p>
          ${r.estado === 'Cancelado' && r.motivo_cancelacion ? `<p class="text-[11px] text-rose-600 font-medium mt-1">Motivo rechazo: ${escapeHtml(r.motivo_cancelacion)}</p>` : ''}
        </td>
        <td class="px-4 py-3.5 whitespace-nowrap">
          ${renderBadgeEstadoReserva(r.estado)}
        </td>
        <td class="px-4 py-3.5 whitespace-nowrap text-right">
          <div class="inline-flex items-center gap-1.5">
            <button onclick="abrirModalDetalleReserva(${r.id_reservacion})"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${r.estado === 'Pendiente' ? 'bg-[#047857] text-white hover:bg-[#0F5132] shadow-sm' : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'} transition">
              <i data-lucide="${r.estado === 'Pendiente' ? 'check-square' : 'eye'}" class="w-3.5 h-3.5"></i>
              <span>${r.estado === 'Pendiente' ? 'Evaluar Solicitud' : 'Ver Detalle'}</span>
            </button>
            ${r.estado === 'Confirmado' ? `
              <button onclick="irAEscanerConFolio('${r.folio}')" title="Validar acceso QR en Módulo 2"
                class="p-1.5 rounded-lg text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition">
                <i data-lucide="scan-line" class="w-4 h-4"></i>
              </button>
            ` : ''}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function renderBadgeEstadoReserva(estado) {
  switch (estado) {
    case 'Confirmado':
      return `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> Confirmado
              </span>`;
    case 'Pendiente':
      return `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span> Pendiente
              </span>`;
    case 'Asistio':
      return `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
                <span class="w-1.5 h-1.5 rounded-full bg-blue-600"></span> Asistió (Check-in)
              </span>`;
    case 'Cancelado':
      return `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                <span class="w-1.5 h-1.5 rounded-full bg-rose-600"></span> Cancelado
              </span>`;
    default:
      return `<span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">${escapeHtml(estado)}</span>`;
  }
}

// =====================================================================================
// 5. PANTALLA 1.2: MODAL DETALLE DE SOLICITUD DE RESERVA, CONFIRMACIÓN Y CANCELACIÓN
// =====================================================================================

function abrirModalDetalleReserva(idReservacion) {
  const reserva = appState.reservaciones.find(r => Number(r.id_reservacion) === Number(idReservacion));
  if (!reserva) return;

  appState.selectedReservaId = Number(idReservacion);
  const lab = appState.laboratorios.find(l => Number(l.id_laboratorio) === Number(reserva.id_laboratorio));

  const modal = document.getElementById('modal-detalle-reserva');
  const content = document.getElementById('modal-detalle-reserva-content');
  if (!modal || !content) return;

  const cupoActual = lab ? Number(lab.cupo_ocupado_actual) : 0;
  const capMax = lab ? Number(lab.capacidad_maxima) : 20;
  const porcentajeLab = Math.min(100, Math.round((cupoActual / capMax) * 100));

  const qrSvg = reserva.folio
    ? generarCodigoQRVisualSVG(reserva.codigo_qr_hash || `UTVM-QR|${reserva.folio}|${reserva.matricula_estudiante}`, 148)
    : '';

  content.innerHTML = `
    <!-- Encabezado del Modal -->
    <div class="bg-[#0F5132] text-white px-6 py-4 rounded-t-2xl flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
          <i data-lucide="file-check-2" class="w-5 h-5 text-emerald-200"></i>
        </div>
        <div>
          <span class="text-[11px] uppercase tracking-wider text-emerald-200 font-bold">Pantalla 1.2 • Dictamen de Solicitud de Laboratorio</span>
          <h3 class="text-lg font-bold flex items-center gap-2">
            Solicitud #${reserva.id_reservacion}
            ${reserva.folio ? `<span class="font-mono text-xs bg-emerald-700 px-2.5 py-0.5 rounded-md border border-emerald-400">${escapeHtml(reserva.folio)}</span>` : ''}
          </h3>
        </div>
      </div>
      <button onclick="cerrarModalDetalleReserva()" class="p-1.5 rounded-lg text-emerald-100 hover:bg-white/10 transition">
        <i data-lucide="x" class="w-5 h-5"></i>
      </button>
    </div>

    <!-- Cuerpo del Modal -->
    <div class="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
      <!-- Barra superior de estado y sincronización -->
      <div class="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
        <div class="flex items-center gap-2.5">
          <span class="text-xs font-semibold text-slate-500">Estado Actual:</span>
          ${renderBadgeEstadoReserva(reserva.estado)}
        </div>
        <div class="text-xs text-slate-500 flex items-center gap-1.5">
          <i data-lucide="smartphone" class="w-4 h-4 text-emerald-700"></i>
          <span>Origen: <strong>App Móvil Reservas Labs UTVM</strong> (${escapeHtml(reserva.fecha_solicitud || '2026-09-28')})</span>
        </div>
      </div>

      <!-- Grid Datos del Estudiante y Laboratorio -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Tarjeta Datos del Alumno -->
        <div class="p-4 rounded-xl border border-slate-200 bg-white space-y-2.5">
          <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800 border-b border-slate-100 pb-2">
            <i data-lucide="graduation-cap" class="w-4 h-4"></i> Datos del Estudiante UTVM
          </div>
          <div>
            <p class="text-xs text-slate-500">Nombre Completo</p>
            <p class="text-sm font-bold text-slate-900">${escapeHtml(reserva.nombre_estudiante)}</p>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <p class="text-xs text-slate-500">Matrícula Institucional</p>
              <p class="text-sm font-mono font-bold text-emerald-800">${escapeHtml(reserva.matricula_estudiante)}</p>
            </div>
            <div>
              <p class="text-xs text-slate-500">Programa Educativo</p>
              <p class="text-xs font-semibold text-slate-800">${escapeHtml(reserva.carrera)}</p>
            </div>
          </div>
        </div>

        <!-- Tarjeta Laboratorio y Horario Solicitado -->
        <div class="p-4 rounded-xl border border-slate-200 bg-white space-y-2.5">
          <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800 border-b border-slate-100 pb-2">
            <i data-lucide="cpu" class="w-4 h-4"></i> Espacio Académico y Horario
          </div>
          <div>
            <p class="text-xs text-slate-500">Laboratorio Solicitado</p>
            <p class="text-sm font-bold text-slate-900">${escapeHtml(lab ? lab.nombre : reserva.nombre_laboratorio)}</p>
            <p class="text-xs text-slate-500">${lab ? `${escapeHtml(lab.edificio)} - ${escapeHtml(lab.planta)}` : ''}</p>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <p class="text-xs text-slate-500">Fecha de Reserva</p>
              <p class="text-xs font-bold text-slate-900">${escapeHtml(reserva.fecha_reserva)}</p>
            </div>
            <div>
              <p class="text-xs text-slate-500">Bloque Horario</p>
              <p class="text-xs font-bold text-emerald-800">${escapeHtml(reserva.bloque_horario)}</p>
            </div>
          </div>
          <!-- Cupo actual del laboratorio -->
          <div class="pt-1">
            <div class="flex justify-between text-[11px] font-semibold mb-1">
              <span class="text-slate-600">Ocupación actual del laboratorio:</span>
              <span class="${porcentajeLab >= 95 ? 'text-amber-700 font-bold' : 'text-emerald-700'}">${cupoActual} / ${capMax} estaciones (${porcentajeLab}%)</span>
            </div>
            <div class="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div class="h-full ${porcentajeLab >= 100 ? 'bg-rose-600' : porcentajeLab >= 85 ? 'bg-amber-500' : 'bg-emerald-600'}" style="width: ${porcentajeLab}%"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Justificación Académica y Casilla Verificada de Reglamento -->
      <div class="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
        <div>
          <p class="text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Motivo y Justificación Académica de Uso</p>
          <p class="text-sm text-slate-800 bg-white p-3 rounded-lg border border-slate-200 font-medium">
            "${escapeHtml(reserva.motivo_uso)}"
          </p>
        </div>

        <!-- Casilla verificada obligatoria -->
        <div class="flex items-start gap-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
          <input type="checkbox" checked disabled class="mt-0.5 w-4 h-4 accent-emerald-700 rounded cursor-not-allowed" />
          <div class="text-xs text-emerald-950">
            <p class="font-bold">✅ Aceptación explícita del reglamento y requisitos de ingreso</p>
            <p class="text-emerald-800 mt-0.5">
              Requisitos verificados en App Móvil: <em>${escapeHtml(lab ? lab.requisitos_obligatorios : 'Credencial institucional vigente y cumplimiento de normas de seguridad.')}</em>
            </p>
          </div>
        </div>
      </div>

      <!-- Si ya tiene Folio y Código QR (Confirmado o Asistió) -->
      ${reserva.folio ? `
        <div class="p-4 rounded-xl border-2 border-emerald-600/30 bg-emerald-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="space-y-1.5">
            <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-700 text-white">
              Pase Digital QR Generado
            </span>
            <h4 class="text-base font-bold text-slate-900">Folio Oficial: <span class="font-mono text-emerald-800">${escapeHtml(reserva.folio)}</span></h4>
            <p class="text-xs text-slate-600">Este código QR fue enviado automáticamente a la App Móvil <strong>Reservas Labs UTVM</strong> del estudiante para su lectura en la entrada del laboratorio.</p>
            <p class="text-[11px] font-mono text-slate-500 break-all">Hash: ${escapeHtml(reserva.codigo_qr_hash || '')}</p>
            ${reserva.estado === 'Confirmado' ? `
              <div class="pt-1">
                <button onclick="cerrarModalDetalleReserva(); irAEscanerConFolio('${reserva.folio}');"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-800 text-white hover:bg-emerald-900 transition">
                  <i data-lucide="scan-line" class="w-3.5 h-3.5"></i> Ir a Escáner QR para Check-in
                </button>
              </div>
            ` : ''}
          </div>
          <div class="p-3 bg-white rounded-xl border border-slate-200 shadow-sm shrink-0 flex flex-col items-center">
            ${qrSvg}
            <span class="mt-1 text-[10px] font-mono font-bold text-slate-700">${escapeHtml(reserva.folio)}</span>
          </div>
        </div>
      ` : ''}

      <!-- Si está Cancelado, mostrar motivo registrado -->
      ${reserva.estado === 'Cancelado' ? `
        <div class="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-950 space-y-1">
          <p class="text-xs font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
            <i data-lucide="alert-octagon" class="w-4 h-4"></i> Motivo de Rechazo / Cancelación Registrado
          </p>
          <p class="text-sm font-medium">${escapeHtml(reserva.motivo_cancelacion || 'Sin motivo especificado.')}</p>
        </div>
      ` : ''}

      <!-- Panel desplegable para Rechazar / Cancelar Solicitud (Regla 4: Motivo Obligatorio) -->
      ${reserva.estado !== 'Cancelado' && reserva.estado !== 'Asistio' ? `
        <div id="panel-motivo-cancelacion" class="hidden p-4 rounded-xl bg-rose-50 border border-rose-300 space-y-3">
          <div class="flex items-center justify-between">
            <label for="input-motivo-cancelacion" class="text-xs font-bold uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
              <i data-lucide="alert-triangle" class="w-4 h-4"></i> Justificación Obligatoria de Rechazo o Cancelación *
            </label>
            <span class="text-[11px] text-rose-700 font-semibold">Regla de Validación #4</span>
          </div>
          <textarea id="input-motivo-cancelacion" rows="2"
            placeholder="Escriba el motivo académico u operativo del rechazo/cancelación (ej. Mantenimiento correctivo de equipos, falta de cupo o traslape)..."
            class="w-full px-3 py-2 rounded-lg border border-rose-300 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"></textarea>
          <div class="flex items-center justify-end gap-2">
            <button type="button" onclick="togglePanelCancelacion(false)"
              class="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200 transition">
              Ocultar
            </button>
            <button type="button" onclick="ejecutarCancelacionReserva(${reserva.id_reservacion})"
              class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 shadow-sm transition">
              <i data-lucide="x-circle" class="w-4 h-4"></i> Confirmar Rechazo / Cancelación
            </button>
          </div>
        </div>
      ` : ''}
    </div>

    <!-- Pie de Acciones del Modal -->
    <div class="px-6 py-4 bg-slate-50 border-t border-slate-200 rounded-b-2xl flex flex-wrap items-center justify-between gap-3">
      <button type="button" onclick="cerrarModalDetalleReserva()"
        class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 transition">
        Cerrar Ventana
      </button>

      <div class="flex flex-wrap items-center gap-2.5">
        ${reserva.estado !== 'Cancelado' && reserva.estado !== 'Asistio' ? `
          <button type="button" onclick="togglePanelCancelacion(true)"
            class="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 border border-rose-300 hover:bg-rose-100 transition">
            <i data-lucide="ban" class="w-4 h-4"></i>
            <span>Rechazar / Cancelar Solicitud</span>
          </button>
        ` : ''}

        ${reserva.estado === 'Pendiente' ? `
          <button type="button" onclick="ejecutarConfirmacionReserva(${reserva.id_reservacion})"
            class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#047857] text-white hover:bg-[#0F5132] shadow-md transition">
            <i data-lucide="check-circle-2" class="w-4 h-4"></i>
            <span>Aceptar y Confirmar Reserva ${reserva.matricula_estudiante === '2530706' ? '(Generar LAB-2026-9812)' : ''}</span>
          </button>
        ` : ''}
      </div>
    </div>
  `;

  modal.classList.remove('hidden');
  if (window.lucide) window.lucide.createIcons();
}

function cerrarModalDetalleReserva() {
  const modal = document.getElementById('modal-detalle-reserva');
  if (modal) modal.classList.add('hidden');
  appState.selectedReservaId = null;
}

function togglePanelCancelacion(mostrar) {
  const panel = document.getElementById('panel-motivo-cancelacion');
  if (!panel) return;
  if (mostrar) {
    panel.classList.remove('hidden');
    const textarea = document.getElementById('input-motivo-cancelacion');
    if (textarea) textarea.focus();
  } else {
    panel.classList.add('hidden');
  }
}

/**
 * Acción: Aceptar y Confirmar Reserva (Pantalla 1.2)
 * Cumple Reglas 1, 2, 3 y 5.
 * Para Erick Francisco Ramírez Bautista (2530706) asigna exactamente LAB-2026-9812.
 */
async function ejecutarConfirmacionReserva(idReservacion) {
  // Si estamos conectados a XAMPP MySQL, delegar al backend PHP/MySQL
  if (appState.connectionMode === 'xampp' && appState.activeEndpoint) {
    try {
      const resp = await fetch(`${appState.activeEndpoint}?action=confirmar_reserva`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_reservacion: idReservacion })
      });
      const json = await resp.json();
      if (!json.success) {
        mostrarToast('error', 'No se pudo confirmar la reserva', json.message);
        return;
      }
      if (json.data && json.data.estado_global) {
        aplicarEstadoDesdeServidor(json.data.estado_global);
      }
      renderizarTodo();
      abrirModalDetalleReserva(idReservacion);
      mostrarToast('success', 'Reserva Confirmada en MySQL y App Móvil', json.message);
      return;
    } catch (e) {
      console.warn('Fallo petición a XAMPP, ejecutando en motor local híbrido:', e);
    }
  }

  // Ejecución en Modo Híbrido Local (idéntica a las reglas de MySQL)
  const reserva = appState.reservaciones.find(r => Number(r.id_reservacion) === Number(idReservacion));
  if (!reserva) return;

  // Regla 3: Asociación obligatoria de identidad
  if (!reserva.matricula_estudiante || !reserva.nombre_estudiante) {
    mostrarToast('error', 'Error de Identidad UTVM', 'Toda reservación debe estar vinculada a una matrícula y nombre completo válidos.');
    return;
  }

  // Regla 1: Restricción de traslapes (misma matrícula, misma fecha y bloque horario en Confirmado o Asistio)
  const traslape = appState.reservaciones.find(r =>
    Number(r.id_reservacion) !== Number(idReservacion) &&
    r.matricula_estudiante === reserva.matricula_estudiante &&
    r.fecha_reserva === reserva.fecha_reserva &&
    r.bloque_horario === reserva.bloque_horario &&
    (r.estado === 'Confirmado' || r.estado === 'Asistio')
  );

  if (traslape) {
    mostrarToast(
      'error',
      'Restricción de Traslape de Horario',
      `El estudiante ${reserva.nombre_estudiante} (${reserva.matricula_estudiante}) ya tiene una reserva activa (${traslape.folio}) el ${reserva.fecha_reserva} de ${reserva.bloque_horario}.`
    );
    return;
  }

  // Regla 2: Validación de capacidad máxima y estatus operativo
  const lab = appState.laboratorios.find(l => Number(l.id_laboratorio) === Number(reserva.id_laboratorio));
  if (!lab) return;

  if (lab.estatus_operativo === 'En Mantenimiento') {
    mostrarToast('error', 'Laboratorio en Mantenimiento', `No es posible confirmar reservas en el ${lab.nombre} mientras esté 'En Mantenimiento'.`);
    return;
  }

  if (lab.estatus_operativo === 'Saturado' || Number(lab.cupo_ocupado_actual) >= Number(lab.capacidad_maxima)) {
    mostrarToast('error', 'Capacidad Máxima Alcanzada (Saturado)', `El ${lab.nombre} se encuentra al 100% de su capacidad (${lab.cupo_ocupado_actual}/${lab.capacidad_maxima}).`);
    return;
  }

  // Generar folio único (Erick 2530706 -> LAB-2026-9812)
  let folioAsignado = reserva.folio;
  if (!folioAsignado) {
    if (reserva.matricula_estudiante === '2530706' && !appState.reservaciones.some(r => r.folio === 'LAB-2026-9812')) {
      folioAsignado = 'LAB-2026-9812';
    } else {
      folioAsignado = `LAB-2026-${9810 + Number(reserva.id_reservacion)}`;
      while (appState.reservaciones.some(r => r.folio === folioAsignado)) {
        folioAsignado = `LAB-2026-${Math.floor(9820 + Math.random() * 170)}`;
      }
    }
  }

  const qrHash = `UTVM-QR|${folioAsignado}|${reserva.matricula_estudiante}|LAB${reserva.id_laboratorio}|${reserva.fecha_reserva}|${reserva.bloque_horario.replace(/\s+/g, '')}`;

  reserva.estado = 'Confirmado';
  reserva.folio = folioAsignado;
  reserva.codigo_qr_hash = qrHash;
  reserva.motivo_cancelacion = null;

  // Incrementar +1 en cupo_ocupado_actual
  lab.cupo_ocupado_actual = Number(lab.cupo_ocupado_actual) + 1;
  let avisoSaturado = '';
  if (lab.cupo_ocupado_actual >= Number(lab.capacidad_maxima)) {
    lab.estatus_operativo = 'Saturado';
    avisoSaturado = ` ¡El ${lab.nombre} alcanzó ${lab.cupo_ocupado_actual}/${lab.capacidad_maxima} estaciones y cambió automáticamente a estado 'Saturado'!`;
  }

  guardarEstadoLocal();
  renderizarTodo();
  abrirModalDetalleReserva(idReservacion);

  mostrarToast(
    'success',
    `Folio ${folioAsignado} Confirmado y Sincronizado`,
    `Se envió el código QR a la App Móvil de ${reserva.nombre_estudiante} (+1 cupo en ${lab.nombre}).${avisoSaturado}`
  );
}

/**
 * Acción: Rechazar / Cancelar Solicitud (Pantalla 1.2)
 * Cumple Regla 4 (Motivo obligatorio) y libera -1 en el cupo si estaba Confirmado.
 */
async function ejecutarCancelacionReserva(idReservacion) {
  const inputMotivo = document.getElementById('input-motivo-cancelacion');
  const motivo = inputMotivo ? inputMotivo.value.trim() : '';

  // Regla 4: Registro obligatorio de motivo de cancelación
  if (motivo.length < 5) {
    mostrarToast(
      'error',
      'Motivo de Cancelación Obligatorio',
      'Regla #4: Debe escribir una justificación clara (mínimo 5 caracteres) antes de rechazar o cancelar la solicitud.'
    );
    if (inputMotivo) inputMotivo.focus();
    return;
  }

  if (appState.connectionMode === 'xampp' && appState.activeEndpoint) {
    try {
      const resp = await fetch(`${appState.activeEndpoint}?action=cancelar_reserva`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_reservacion: idReservacion,
          motivo_cancelacion: motivo
        })
      });
      const json = await resp.json();
      if (!json.success) {
        mostrarToast('error', 'No se pudo cancelar', json.message);
        return;
      }
      if (json.data && json.data.estado_global) {
        aplicarEstadoDesdeServidor(json.data.estado_global);
      }
      renderizarTodo();
      abrirModalDetalleReserva(idReservacion);
      mostrarToast('warning', 'Solicitud Cancelada y Sincronizada', json.message);
      return;
    } catch (e) {
      console.warn('Fallo petición a XAMPP, ejecutando en motor local:', e);
    }
  }

  const reserva = appState.reservaciones.find(r => Number(r.id_reservacion) === Number(idReservacion));
  if (!reserva) return;

  const estabaConfirmada = reserva.estado === 'Confirmado';
  reserva.estado = 'Cancelado';
  reserva.motivo_cancelacion = motivo;

  let msgLiberacion = '';
  if (estabaConfirmada) {
    const lab = appState.laboratorios.find(l => Number(l.id_laboratorio) === Number(reserva.id_laboratorio));
    if (lab) {
      lab.cupo_ocupado_actual = Math.max(0, Number(lab.cupo_ocupado_actual) - 1);
      if (lab.estatus_operativo === 'Saturado' && lab.cupo_ocupado_actual < Number(lab.capacidad_maxima)) {
        lab.estatus_operativo = 'Disponible';
      }
      msgLiberacion = ` Se liberó (-1) estación en ${lab.nombre}.`;
    }
  }

  guardarEstadoLocal();
  renderizarTodo();
  abrirModalDetalleReserva(idReservacion);

  mostrarToast(
    'warning',
    'Reserva Rechazada / Cancelada',
    `Se notificó el motivo a la App Móvil de ${reserva.nombre_estudiante}.${msgLiberacion}`
  );
}

// =====================================================================================
// 6. MÓDULO 2: CONTROL DE ACCESO Y VALIDACIÓN QR (PANTALLA 2.1)
// =====================================================================================

function irAEscanerConFolio(folio) {
  cambiarModulo('mod2');
  simularLecturaQR(folio, 'Escaner_QR');
}

function simularLecturaQR(folioInput, metodo = 'Escaner_QR') {
  let folio = (folioInput || '').trim().toUpperCase();
  if (!folio) {
    mostrarToast('warning', 'Folio requerido', 'Ingrese un folio alfanumérico o utilice uno de los botones de simulación QR.');
    return;
  }

  if (folio.startsWith('UTVM-QR|')) {
    const partes = folio.split('|');
    if (partes[1]) folio = partes[1].trim();
  }

  const inputManual = document.getElementById('input-folio-manual');
  if (inputManual) inputManual.value = folio;

  // Buscar en reservaciones
  const reserva = appState.reservaciones.find(r => r.folio && r.folio.toUpperCase() === folio);

  if (!reserva) {
    appState.qrValidationResult = {
      status: 'INV',
      folio,
      metodo,
      title: 'COMPROBANTE INVÁLIDO / NO ENCONTRADO',
      subtitle: `El folio "${folio}" no existe en la base de datos de reservaciones de la UTVM.`,
      reserva: null
    };
    mostrarToast('error', `QR / Folio Inválido (${folio})`, 'El comprobante escaneado no corresponde a ninguna reservación registrada.');
  } else if (reserva.estado === 'Asistio') {
    appState.qrValidationResult = {
      status: 'USED',
      folio,
      metodo,
      title: 'YA UTILIZADO / CHECK-IN PREVIO REGISTRADO',
      subtitle: `El folio ${folio} de ${reserva.nombre_estudiante} ya fue utilizado para ingresar anteriormente. Bloqueado contra doble uso.`,
      reserva
    };
    mostrarToast('warning', `Comprobante Ya Utilizado (${folio})`, `${reserva.nombre_estudiante} ya registró su entrada previamente.`);
  } else if (reserva.estado === 'Cancelado' || reserva.estado === 'Pendiente') {
    appState.qrValidationResult = {
      status: 'INV',
      folio,
      metodo,
      title: `COMPROBANTE NO AUTORIZADO (${reserva.estado.toUpperCase()})`,
      subtitle: `La reservación asociada al folio ${folio} se encuentra en estado "${reserva.estado}" y no tiene acceso autorizado.`,
      reserva
    };
    mostrarToast('error', `Acceso Denegado (${folio})`, `La reserva está en estado ${reserva.estado}.`);
  } else {
    // Estado Confirmado -> VÁLIDO
    appState.qrValidationResult = {
      status: 'VAL',
      folio,
      metodo,
      title: 'COMPROBANTE VÁLIDO • ACCESO AUTORIZADO',
      subtitle: `Reserva confirmada y vigente para ${reserva.nombre_estudiante}. Lista para registrar Check-in.`,
      reserva
    };
    mostrarToast('success', `Código QR Válido (${folio})`, `Alumno verificado: ${reserva.nombre_estudiante}. Presione "Registrar Ingreso (Check-in)".`);
  }

  renderizarModulo2();
  if (window.lucide) window.lucide.createIcons();
}

function validarFolioManual() {
  const input = document.getElementById('input-folio-manual');
  const valor = input ? input.value.trim() : '';
  simularLecturaQR(valor, 'Folio_Manual');
}

/**
 * Acción: Registrar Ingreso (Check-in) en Pantalla 2.1
 * Disponible solo para folios válidos en estado Confirmado.
 * Cambia estado a 'Asistio', inserta en bitacora_accesos y bloquea segundo uso.
 */
async function ejecutarCheckinAcceso() {
  const resultado = appState.qrValidationResult;
  if (!resultado || resultado.status !== 'VAL' || !resultado.reserva) {
    mostrarToast('error', 'Acción no permitida', 'Solo se puede registrar el ingreso de folios VÁLIDOS en estado Confirmado.');
    return;
  }

  const folio = resultado.folio;
  const metodo = resultado.metodo || 'Escaner_QR';
  const idEncargado = appState.activeRole === 'Administrador' ? 1 : 2;

  if (appState.connectionMode === 'xampp' && appState.activeEndpoint) {
    try {
      const resp = await fetch(`${appState.activeEndpoint}?action=registrar_checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          folio,
          metodo_validacion: metodo,
          id_encargado_valido: idEncargado
        })
      });
      const json = await resp.json();
      if (!json.success) {
        mostrarToast('error', 'Error en Check-in', json.message);
        return;
      }
      if (json.data && json.data.estado_global) {
        aplicarEstadoDesdeServidor(json.data.estado_global);
      }
      const resActualizada = appState.reservaciones.find(r => r.folio === folio);
      appState.qrValidationResult = {
        status: 'USED',
        folio,
        metodo,
        title: 'INGRESO REGISTRADO CON ÉXITO (CHECK-IN COMPLETADO)',
        subtitle: `Se registró la asistencia de ${resActualizada ? resActualizada.nombre_estudiante : folio} en bitacora_accesos. Folio bloqueado para segundo uso.`,
        reserva: resActualizada
      };
      renderizarTodo();
      mostrarToast('success', 'Check-in Registrado en MySQL', json.message);
      return;
    } catch (e) {
      console.warn('Fallo petición a XAMPP, ejecutando en motor local:', e);
    }
  }

  // Modo Híbrido Local
  const reserva = appState.reservaciones.find(r => r.folio && r.folio.toUpperCase() === folio);
  if (!reserva || reserva.estado !== 'Confirmado') return;

  reserva.estado = 'Asistio';

  const ahora = obtenerFechaHoraActualSQL();
  const encargadoObj = appState.usuarios_admin.find(u => Number(u.id_usuario) === idEncargado);
  const labObj = appState.laboratorios.find(l => Number(l.id_laboratorio) === Number(reserva.id_laboratorio));

  const nuevoIdAcceso = appState.bitacora_accesos.reduce((max, b) => Math.max(max, Number(b.id_acceso || 0)), 0) + 1;

  appState.bitacora_accesos.unshift({
    id_acceso: nuevoIdAcceso,
    id_reservacion: reserva.id_reservacion,
    folio_validado: folio,
    id_encargado_valido: idEncargado,
    encargado_nombre: encargadoObj ? encargadoObj.nombre_completo : 'Encargado de Laboratorio',
    nombre_estudiante: reserva.nombre_estudiante,
    matricula_estudiante: reserva.matricula_estudiante,
    carrera: reserva.carrera,
    id_laboratorio: reserva.id_laboratorio,
    nombre_laboratorio: labObj ? labObj.nombre : reserva.nombre_laboratorio,
    metodo_validacion: metodo,
    resultado_validacion: 'Valido',
    fecha_hora_ingreso: ahora
  });

  appState.qrValidationResult = {
    status: 'USED',
    folio,
    metodo,
    title: 'INGRESO REGISTRADO CON ÉXITO (CHECK-IN COMPLETADO)',
    subtitle: `Entrada registrada el ${ahora}. El folio ${folio} ha cambiado a estado "Asistió" y quedó bloqueado contra un segundo uso.`,
    reserva
  };

  guardarEstadoLocal();
  renderizarTodo();

  mostrarToast(
    'success',
    `Check-in Exitoso: ${reserva.nombre_estudiante}`,
    `Folio ${folio} validado vía ${metodo}. Estado sincronizado con App Móvil Reservas Labs UTVM.`
  );
}

function renderizarModulo2() {
  const panelResultado = document.getElementById('qr-validation-result-card');
  const tbodyBitacora = document.getElementById('tabla-bitacora-body');

  // Renderizar estado del botón rápido de Erick según si ya fue confirmado o sigue pendiente
  const erickReserva = appState.reservaciones.find(r => r.matricula_estudiante === '2530706');
  const btnSimErick = document.getElementById('btn-sim-qr-erick');
  if (btnSimErick && erickReserva) {
    const estadoErick = erickReserva.estado;
    const badgeErick = estadoErick === 'Confirmado'
      ? `<span class="px-1.5 py-0.5 text-[10px] rounded bg-emerald-200 text-emerald-900 font-bold">Confirmado</span>`
      : estadoErick === 'Asistio'
      ? `<span class="px-1.5 py-0.5 text-[10px] rounded bg-blue-200 text-blue-900 font-bold">Ya Asistió</span>`
      : `<span class="px-1.5 py-0.5 text-[10px] rounded bg-amber-200 text-amber-900 font-bold">Pendiente en Mód. 1</span>`;
    btnSimErick.innerHTML = `
      <div class="flex items-center justify-between w-full">
        <span class="flex items-center gap-1.5 font-bold text-xs">
          <i data-lucide="qr-code" class="w-4 h-4 text-emerald-700"></i>
          Simular QR de Erick (LAB-2026-9812)
        </span>
        ${badgeErick}
      </div>
    `;
  }

  if (panelResultado) {
    const res = appState.qrValidationResult;
    if (!res) {
      panelResultado.innerHTML = `
        <div class="p-8 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 text-center space-y-3">
          <div class="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
            <i data-lucide="scan-qr-code" class="w-7 h-7"></i>
          </div>
          <h4 class="text-base font-bold text-slate-800">Esperando Lectura Óptica QR o Folio Manual</h4>
          <p class="text-xs text-slate-500 max-w-md mx-auto">
            Escanee el código QR desde la App Móvil del estudiante, utilice los botones de simulación rápida o escriba el folio alfanumérico (ej. <code class="font-mono font-bold text-slate-700">LAB-2026-9812</code>).
          </p>
        </div>
      `;
    } else {
      const r = res.reserva;
      const lab = r ? appState.laboratorios.find(l => Number(l.id_laboratorio) === Number(r.id_laboratorio)) : null;

      let colorBox = 'border-emerald-500 bg-emerald-50/70';
      let badgeStatus = `<span class="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-600 text-white">✓ COMPROBANTE VÁLIDO</span>`;
      let iconName = 'shield-check';
      let iconColor = 'text-emerald-600 bg-emerald-100';

      if (res.status === 'USED') {
        colorBox = 'border-amber-500 bg-amber-50/70';
        badgeStatus = `<span class="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-600 text-white">⚠ YA UTILIZADO / VENCIDO</span>`;
        iconName = 'history';
        iconColor = 'text-amber-700 bg-amber-100';
      } else if (res.status === 'INV') {
        colorBox = 'border-rose-500 bg-rose-50/70';
        badgeStatus = `<span class="px-3 py-1 rounded-full text-xs font-extrabold bg-rose-600 text-white">✕ COMPROBANTE INVÁLIDO</span>`;
        iconName = 'shield-alert';
        iconColor = 'text-rose-600 bg-rose-100';
      }

      panelResultado.innerHTML = `
        <div class="p-6 rounded-2xl border-2 ${colorBox} shadow-sm space-y-5 animate-modal">
          <div class="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200/80 pb-4">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl ${iconColor} flex items-center justify-center shrink-0">
                <i data-lucide="${iconName}" class="w-6 h-6"></i>
              </div>
              <div>
                <div class="flex items-center gap-2 flex-wrap">
                  ${badgeStatus}
                  <span class="text-xs font-mono font-bold text-slate-700 bg-white px-2.5 py-0.5 rounded border border-slate-300">
                    Folio: ${escapeHtml(res.folio)}
                  </span>
                  <span class="text-[11px] font-semibold text-slate-500">
                    Método: ${res.metodo === 'Escaner_QR' ? 'Escáner Óptico QR' : 'Folio Manual'}
                  </span>
                </div>
                <h4 class="text-base font-bold text-slate-900 mt-1.5">${escapeHtml(res.title)}</h4>
                <p class="text-xs text-slate-600">${escapeHtml(res.subtitle)}</p>
              </div>
            </div>
          </div>

          ${r ? `
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-4 rounded-xl border border-slate-200">
              <div>
                <p class="text-[11px] text-slate-500">Estudiante</p>
                <p class="text-sm font-bold text-slate-900">${escapeHtml(r.nombre_estudiante)}</p>
                <p class="text-xs font-mono font-semibold text-emerald-800">Matrícula: ${escapeHtml(r.matricula_estudiante)}</p>
              </div>
              <div>
                <p class="text-[11px] text-slate-500">Laboratorio y Horario</p>
                <p class="text-sm font-bold text-slate-900">${escapeHtml(lab ? lab.nombre : r.nombre_laboratorio)}</p>
                <p class="text-xs text-slate-600">${escapeHtml(r.fecha_reserva)} • <strong>${escapeHtml(r.bloque_horario)}</strong></p>
              </div>
              <div class="sm:col-span-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                <span class="text-xs text-slate-600">Práctica: <em>${escapeHtml(r.motivo_uso)}</em></span>
                ${renderBadgeEstadoReserva(r.estado)}
              </div>
            </div>
          ` : `
            <div class="p-4 rounded-xl bg-white border border-rose-200 text-xs text-rose-800 font-medium">
              Sugerencia: Si está probando el folio <code class="font-mono font-bold">LAB-2026-9812</code> de <strong>Erick Francisco Ramírez Bautista</strong>, recuerde primero confirmarlo en el <strong>Módulo 1 (Pantalla 1.2)</strong> para que el sistema genere su código QR oficial.
            </div>
          `}

          <div class="flex items-center justify-end gap-3 pt-1">
            ${res.status === 'VAL' ? `
              <button onclick="ejecutarCheckinAcceso()"
                class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-[#047857] text-white hover:bg-[#0F5132] shadow-md transition">
                <i data-lucide="user-check" class="w-5 h-5"></i>
                <span>Registrar Ingreso (Check-in)</span>
              </button>
            ` : `
              <button disabled
                class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-200 text-slate-500 cursor-not-allowed">
                <i data-lucide="lock" class="w-4 h-4"></i>
                <span>Ingreso Bloqueado (${res.status === 'USED' ? 'Folio Ya Utilizado' : 'Folio No Válido'})</span>
              </button>
            `}
          </div>
        </div>
      `;
    }
  }

  // Renderizar tabla bitacora_accesos
  if (tbodyBitacora) {
    if (appState.bitacora_accesos.length === 0) {
      tbodyBitacora.innerHTML = `
        <tr>
          <td colspan="6" class="px-4 py-8 text-center text-xs text-slate-500">Sin registros en la bitácora de accesos.</td>
        </tr>
      `;
    } else {
      tbodyBitacora.innerHTML = appState.bitacora_accesos.map(b => {
        const badgeRes = b.resultado_validacion === 'Valido'
          ? `<span class="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">Válido (Check-in)</span>`
          : b.resultado_validacion === 'Ya_Utilizado'
          ? `<span class="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">Ya Utilizado</span>`
          : `<span class="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">Inválido</span>`;

        return `
          <tr class="border-b border-slate-100 hover:bg-slate-50">
            <td class="px-4 py-3 font-mono text-xs font-bold text-slate-800">${escapeHtml(b.folio_validado)}</td>
            <td class="px-4 py-3">
              <p class="text-xs font-bold text-slate-900">${escapeHtml(b.nombre_estudiante || 'No identificado')}</p>
              <p class="text-[11px] text-slate-500 font-mono">${escapeHtml(b.matricula_estudiante || '-')}</p>
            </td>
            <td class="px-4 py-3 text-xs text-slate-700">${escapeHtml(b.nombre_laboratorio || '-')}</td>
            <td class="px-4 py-3 text-xs">
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                ${b.metodo_validacion === 'Escaner_QR' ? '📷 Escáner_QR' : '⌨️ Folio_Manual'}
              </span>
            </td>
            <td class="px-4 py-3">${badgeRes}</td>
            <td class="px-4 py-3 text-xs font-mono text-slate-600">${escapeHtml(b.fecha_hora_ingreso)}</td>
          </tr>
        `;
      }).join('');
    }
  }
}

// Control de Cámara Web Óptica (Opcional en vivo para el visor QR)
async function alternarCamaraQR() {
  const video = document.getElementById('qr-webcam-video');
  const placeholder = document.getElementById('qr-webcam-placeholder');
  const btnCam = document.getElementById('btn-toggle-camera');

  if (appState.cameraStream) {
    detenerCamaraQR();
    return;
  }

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    mostrarToast('warning', 'Cámara Web no disponible', 'Su navegador no expone cámara web en este contexto. Utilice los botones de simulación QR rápida.');
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    appState.cameraStream = stream;
    if (video) {
      video.srcObject = stream;
      video.classList.remove('hidden');
      await video.play();
    }
    if (placeholder) placeholder.classList.add('hidden');
    if (btnCam) {
      btnCam.innerHTML = `<i data-lucide="camera-off" class="w-4 h-4"></i> Detener Cámara`;
      btnCam.className = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 transition';
    }
    if (window.lucide) window.lucide.createIcons();
    mostrarToast('info', 'Visor Óptico QR Activo', 'Cámara web encendida. Presente el código QR o use un botón de simulación.');
  } catch (err) {
    mostrarToast('warning', 'Permiso de Cámara Denegado o Sin Dispositivo', 'Puede usar los botones de simulación QR de Erick, Jonathan y Diana.');
  }
}

function detenerCamaraQR() {
  if (appState.cameraStream) {
    appState.cameraStream.getTracks().forEach(t => t.stop());
    appState.cameraStream = null;
  }
  const video = document.getElementById('qr-webcam-video');
  const placeholder = document.getElementById('qr-webcam-placeholder');
  const btnCam = document.getElementById('btn-toggle-camera');
  if (video) {
    video.srcObject = null;
    video.classList.add('hidden');
  }
  if (placeholder) placeholder.classList.remove('hidden');
  if (btnCam) {
    btnCam.innerHTML = `<i data-lucide="camera" class="w-4 h-4"></i> Activar Cámara Web`;
    btnCam.className = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-700 text-white hover:bg-emerald-800 transition';
  }
  if (window.lucide) window.lucide.createIcons();
}

// =====================================================================================
// 7. MÓDULO 3: CATÁLOGO Y DISPONIBILIDAD DE LABORATORIOS Y EQUIPOS (PANTALLA 3.1)
// =====================================================================================

function renderizarModulo3() {
  const grid = document.getElementById('grid-laboratorios');
  const bannerRol = document.getElementById('mod3-role-notice');
  if (!grid) return;

  const esAdmin = appState.activeRole === 'Administrador';

  if (bannerRol) {
    if (!esAdmin) {
      bannerRol.classList.remove('hidden');
    } else {
      bannerRol.classList.add('hidden');
    }
  }

  grid.innerHTML = appState.laboratorios.map(lab => {
    const cupo = Number(lab.cupo_ocupado_actual);
    const max = Number(lab.capacidad_maxima);
    const pct = Math.min(100, Math.round((cupo / max) * 100));
    const lugaresLibres = Math.max(0, max - cupo);

    const equiposTags = (lab.inventario_equipos || '')
      .split(',')
      .map(e => e.trim())
      .filter(Boolean)
      .map(eq => `<span class="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">${escapeHtml(eq)}</span>`)
      .join('');

    const requisitosList = (lab.requisitos_obligatorios || '')
      .split(',')
      .map(r => r.trim())
      .filter(Boolean)
      .map(req => `
        <li class="flex items-start gap-2 text-xs text-slate-700">
          <i data-lucide="check-circle" class="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5"></i>
          <span>${escapeHtml(req)}</span>
        </li>
      `).join('');

    let badgeEstatus = '';
    let barraColor = 'bg-emerald-600';

    if (lab.estatus_operativo === 'Disponible') {
      badgeEstatus = `<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <span class="w-2 h-2 rounded-full bg-emerald-600"></span> Disponible
                      </span>`;
      barraColor = pct >= 90 ? 'bg-amber-500' : 'bg-emerald-600';
    } else if (lab.estatus_operativo === 'Saturado') {
      badgeEstatus = `<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                        <span class="w-2 h-2 rounded-full bg-amber-600"></span> Saturado (100%)
                      </span>`;
      barraColor = 'bg-amber-500';
    } else {
      badgeEstatus = `<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                        <span class="w-2 h-2 rounded-full bg-rose-600"></span> En Mantenimiento
                      </span>`;
      barraColor = 'bg-rose-500';
    }

    return `
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between overflow-hidden">
        <!-- Cabecera de tarjeta -->
        <div>
          <div class="p-5 border-b border-slate-100 flex items-start justify-between gap-3 bg-slate-50/60">
            <div class="flex items-start gap-3">
              <div class="w-11 h-11 rounded-xl bg-[#0F5132] text-white flex items-center justify-center shrink-0 shadow-sm">
                <i data-lucide="cpu" class="w-5 h-5"></i>
              </div>
              <div>
                <h3 class="text-base font-bold text-slate-900">${escapeHtml(lab.nombre)}</h3>
                <p class="text-xs font-medium text-slate-500 flex items-center gap-1.5 mt-0.5">
                  <i data-lucide="map-pin" class="w-3.5 h-3.5 text-emerald-700"></i>
                  <span>${escapeHtml(lab.edificio)} • ${escapeHtml(lab.planta)}</span>
                  <span>|</span>
                  <i data-lucide="clock" class="w-3.5 h-3.5 text-emerald-700"></i>
                  <span>${escapeHtml(lab.horario_atencion)}</span>
                </p>
              </div>
            </div>
            ${badgeEstatus}
          </div>

          <!-- Cuerpo de tarjeta -->
          <div class="p-5 space-y-4">
            <!-- Barra de Progreso de Ocupación -->
            <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div class="flex items-center justify-between text-xs">
                <span class="font-bold text-slate-700">Ocupación en Tiempo Real</span>
                <span class="font-mono font-bold ${pct >= 95 ? 'text-amber-700' : 'text-emerald-800'}">
                  ${cupo} / ${max} estaciones (${pct}%) • ${lugaresLibres} libres
                </span>
              </div>
              <div class="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                <div class="h-full ${barraColor} transition-all duration-300" style="width: ${pct}%"></div>
              </div>
              ${cupo === max - 1 && lab.estatus_operativo === 'Disponible' ? `
                <p class="text-[11px] font-semibold text-amber-700 flex items-center gap-1">
                  <i data-lucide="alert-circle" class="w-3.5 h-3.5"></i>
                  ¡A 1 estación de pasar automáticamente a estado Saturado!
                </p>
              ` : ''}
            </div>

            <!-- Inventario de Equipos y Software -->
            <div>
              <p class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                <i data-lucide="layers" class="w-3.5 h-3.5 text-emerald-700"></i> Inventario de Hardware y Software
              </p>
              <div class="flex flex-wrap gap-1.5">
                ${equiposTags}
              </div>
            </div>

            <!-- Requisitos Obligatorios -->
            <div>
              <p class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                <i data-lucide="clipboard-check" class="w-3.5 h-3.5 text-emerald-700"></i> Requisitos Obligatorios de Ingreso
              </p>
              <ul class="space-y-1 bg-emerald-50/40 p-3 rounded-xl border border-emerald-100">
                ${requisitosList}
              </ul>
            </div>
          </div>
        </div>

        <!-- Controles en Tiempo Real (Pie de Tarjeta) -->
        <div class="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <label class="text-xs font-bold text-slate-600">Estatus Operativo:</label>
            <select onchange="cambiarEstatusRapidoLab(${lab.id_laboratorio}, this.value)"
              ${!esAdmin ? 'disabled' : ''}
              class="text-xs font-bold px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 ${!esAdmin ? 'opacity-60 cursor-not-allowed' : ''}">
              <option value="Disponible" ${lab.estatus_operativo === 'Disponible' ? 'selected' : ''}>🟢 Disponible</option>
              <option value="Saturado" ${lab.estatus_operativo === 'Saturado' ? 'selected' : ''}>🟡 Saturado</option>
              <option value="En Mantenimiento" ${lab.estatus_operativo === 'En Mantenimiento' ? 'selected' : ''}>🔴 En Mantenimiento</option>
            </select>
          </div>

          <button onclick="abrirModalEditarLab(${lab.id_laboratorio})"
            ${!esAdmin ? 'disabled' : ''}
            class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold ${esAdmin ? 'bg-[#0F5132] text-white hover:bg-[#047857] shadow-sm' : 'bg-slate-200 text-slate-500 cursor-not-allowed'} transition">
            <i data-lucide="settings-2" class="w-3.5 h-3.5"></i>
            <span>Editar Laboratorio</span>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

async function cambiarEstatusRapidoLab(idLab, nuevoEstatus) {
  if (appState.activeRole !== 'Administrador') {
    mostrarToast('warning', 'Permiso Restringido', 'Solo el Rol 2.1 Administrador puede modificar el estatus estructural del catálogo.');
    renderizarModulo3();
    return;
  }

  const lab = appState.laboratorios.find(l => Number(l.id_laboratorio) === Number(idLab));
  if (!lab) return;

  if (appState.connectionMode === 'xampp' && appState.activeEndpoint) {
    try {
      const resp = await fetch(`${appState.activeEndpoint}?action=actualizar_laboratorio`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_laboratorio: idLab,
          estatus_operativo: nuevoEstatus
        })
      });
      const json = await resp.json();
      if (json.success && json.data && json.data.estado_global) {
        aplicarEstadoDesdeServidor(json.data.estado_global);
        renderizarTodo();
        mostrarToast('success', 'Estatus Sincronizado en MySQL', json.message);
        return;
      }
    } catch (e) {
      console.warn('Actualizando estatus en modo local:', e);
    }
  }

  lab.estatus_operativo = nuevoEstatus;
  guardarEstadoLocal();
  renderizarTodo();
  mostrarToast(
    'success',
    `Estatus Actualizado: ${lab.nombre}`,
    `El laboratorio ahora aparece como "${nuevoEstatus}" en la App Móvil Reservas Labs UTVM.`
  );
}

function abrirModalEditarLab(idLab) {
  if (appState.activeRole !== 'Administrador') {
    mostrarToast('warning', 'Permiso de Administrador Requerido', 'Active el rol "2.1 Administrador" en el menú lateral para editar laboratorios.');
    return;
  }

  const lab = appState.laboratorios.find(l => Number(l.id_laboratorio) === Number(idLab));
  if (!lab) return;

  appState.selectedLabEditId = Number(idLab);

  setValue('edit-lab-id', lab.id_laboratorio);
  setValue('edit-lab-nombre', lab.nombre);
  setValue('edit-lab-edificio', lab.edificio);
  setValue('edit-lab-planta', lab.planta);
  setValue('edit-lab-horario', lab.horario_atencion);
  setValue('edit-lab-capacidad', lab.capacidad_maxima);
  setValue('edit-lab-cupo', lab.cupo_ocupado_actual);
  setValue('edit-lab-estatus', lab.estatus_operativo);
  setValue('edit-lab-inventario', lab.inventario_equipos);
  setValue('edit-lab-requisitos', lab.requisitos_obligatorios);

  const modal = document.getElementById('modal-editar-lab');
  if (modal) modal.classList.remove('hidden');
}

function cerrarModalEditarLab() {
  const modal = document.getElementById('modal-editar-lab');
  if (modal) modal.classList.add('hidden');
  appState.selectedLabEditId = null;
}

async function guardarEdicionLaboratorio(event) {
  if (event) event.preventDefault();
  const idLab = Number(getValue('edit-lab-id'));
  const lab = appState.laboratorios.find(l => Number(l.id_laboratorio) === idLab);
  if (!lab) return;

  const capacidadMaxima = Math.max(1, Number(getValue('edit-lab-capacidad')) || 20);
  const cupoOcupado = Math.max(0, Number(getValue('edit-lab-cupo')) || 0);
  let estatusOperativo = getValue('edit-lab-estatus');

  // Regla 2: Si el cupo alcanza el 100% de la capacidad máxima y no está en mantenimiento, pasa a Saturado
  if (estatusOperativo !== 'En Mantenimiento' && cupoOcupado >= capacidadMaxima) {
    estatusOperativo = 'Saturado';
  }

  const payload = {
    id_laboratorio: idLab,
    nombre: getValue('edit-lab-nombre').trim(),
    edificio: getValue('edit-lab-edificio').trim(),
    planta: getValue('edit-lab-planta').trim(),
    horario_atencion: getValue('edit-lab-horario').trim(),
    capacidad_maxima: capacidadMaxima,
    cupo_ocupado_actual: cupoOcupado,
    estatus_operativo: estatusOperativo,
    inventario_equipos: getValue('edit-lab-inventario').trim(),
    requisitos_obligatorios: getValue('edit-lab-requisitos').trim()
  };

  if (appState.connectionMode === 'xampp' && appState.activeEndpoint) {
    try {
      const resp = await fetch(`${appState.activeEndpoint}?action=actualizar_laboratorio`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await resp.json();
      if (json.success && json.data && json.data.estado_global) {
        aplicarEstadoDesdeServidor(json.data.estado_global);
        cerrarModalEditarLab();
        renderizarTodo();
        mostrarToast('success', 'Laboratorio Actualizado en MySQL', json.message);
        return;
      }
    } catch (e) {
      console.warn('Guardando edición de laboratorio en modo local:', e);
    }
  }

  Object.assign(lab, payload);
  guardarEstadoLocal();
  cerrarModalEditarLab();
  renderizarTodo();

  mostrarToast(
    'success',
    'Catálogo de Laboratorio Actualizado',
    `Los cambios en ${lab.nombre} se guardaron y sincronizaron con la App Móvil UTVM.`
  );
}

// =====================================================================================
// 8. MÓDULO 4: REPORTES Y ESTADÍSTICAS DE USO (PANTALLA 4.1)
// =====================================================================================

function actualizarFiltroMod4(campo, valor) {
  appState.filtersMod4[campo] = valor;
  renderizarModulo4();
  if (window.lucide) window.lucide.createIcons();
}

function obtenerReservacionesFiltradasMod4() {
  const { fechaInicio, fechaFin, id_laboratorio, carrera } = appState.filtersMod4;
  return appState.reservaciones.filter(r => {
    const matchInicio = !fechaInicio || r.fecha_reserva >= fechaInicio;
    const matchFin = !fechaFin || r.fecha_reserva <= fechaFin;
    const matchLab = id_laboratorio === 'Todos' || Number(r.id_laboratorio) === Number(id_laboratorio);
    const matchCarrera = carrera === 'Todas' || r.carrera === carrera;
    return matchInicio && matchFin && matchLab && matchCarrera;
  });
}

function renderizarModulo4() {
  // Poblar selector de laboratorios en Módulo 4
  const selectLab4 = document.getElementById('mod4-lab-select');
  if (selectLab4 && selectLab4.options.length <= 1) {
    selectLab4.innerHTML = `<option value="Todos">Todos los laboratorios</option>` +
      appState.laboratorios.map(l => `<option value="${l.id_laboratorio}">${escapeHtml(l.nombre)}</option>`).join('');
  }

  const reservasFiltradas = obtenerReservacionesFiltradasMod4();

  // 1. Gráfica 1: Porcentaje de ocupación y demanda por laboratorio
  const chartOcupacion = document.getElementById('chart-ocupacion-labs');
  if (chartOcupacion) {
    chartOcupacion.innerHTML = appState.laboratorios.map(lab => {
      const pctOcupacion = Math.min(100, Math.round((Number(lab.cupo_ocupado_actual) / Number(lab.capacidad_maxima)) * 100));
      const solicitudesLab = reservasFiltradas.filter(r => Number(r.id_laboratorio) === Number(lab.id_laboratorio)).length;

      const barColor = lab.estatus_operativo === 'En Mantenimiento'
        ? 'bg-rose-500'
        : pctOcupacion >= 90
        ? 'bg-amber-500'
        : 'bg-[#047857]';

      return `
        <div class="space-y-1.5">
          <div class="flex items-center justify-between text-xs">
            <span class="font-bold text-slate-800 truncate pr-2">${escapeHtml(lab.nombre)}</span>
            <span class="font-mono font-bold text-slate-700 shrink-0">${lab.cupo_ocupado_actual}/${lab.capacidad_maxima} (${pctOcupacion}%) • ${solicitudesLab} solic.</span>
          </div>
          <div class="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <div class="h-full ${barColor} rounded-full transition-all duration-500" style="width: ${Math.max(4, pctOcupacion)}%"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  // 2. Gráfica 2: Demanda por bloques horarios (identificación de horas pico)
  const chartHorarios = document.getElementById('chart-bloques-horarios');
  if (chartHorarios) {
    const bloques = [
      '08:30 - 10:00 hrs',
      '10:00 - 11:30 hrs',
      '11:30 - 13:00 hrs',
      '13:00 - 14:30 hrs'
    ];
    const conteos = bloques.map(b => ({
      bloque: b,
      total: reservasFiltradas.filter(r => r.bloque_horario === b).length
    }));
    const maxBloque = Math.max(1, ...conteos.map(c => c.total));

    chartHorarios.innerHTML = conteos.map(c => {
      const pct = Math.round((c.total / maxBloque) * 100);
      const esHoraPico = c.total === maxBloque && c.total > 0;
      return `
        <div class="space-y-1.5">
          <div class="flex items-center justify-between text-xs">
            <span class="font-semibold text-slate-700 flex items-center gap-1.5">
              <i data-lucide="clock" class="w-3.5 h-3.5 text-emerald-700"></i>
              ${escapeHtml(c.bloque)}
              ${esHoraPico ? `<span class="px-1.5 py-0.5 text-[10px] font-bold rounded bg-amber-100 text-amber-800 border border-amber-300">🔥 Hora Pico</span>` : ''}
            </span>
            <span class="font-mono font-bold text-slate-800">${c.total} reservaciones</span>
          </div>
          <div class="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <div class="h-full ${esHoraPico ? 'bg-amber-500' : 'bg-emerald-600'} rounded-full transition-all duration-500" style="width: ${Math.max(6, pct)}%"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  // 3. Gráfica 3: Tasa de asistencia efectiva vs. confirmadas/pendientes/cancelaciones y desglose por carrera
  const chartAsistencia = document.getElementById('chart-tasa-asistencia');
  if (chartAsistencia) {
    const total = Math.max(1, reservasFiltradas.length);
    const cAsistio = reservasFiltradas.filter(r => r.estado === 'Asistio').length;
    const cConfirmado = reservasFiltradas.filter(r => r.estado === 'Confirmado').length;
    const cPendiente = reservasFiltradas.filter(r => r.estado === 'Pendiente').length;
    const cCancelado = reservasFiltradas.filter(r => r.estado === 'Cancelado').length;

    const pctEfectiva = Math.round(((cAsistio + cConfirmado) / total) * 100);
    const pctCancel = Math.round((cCancelado / total) * 100);

    // Desglose por carrera
    const carrerasMap = {};
    reservasFiltradas.forEach(r => {
      carrerasMap[r.carrera] = (carrerasMap[r.carrera] || 0) + 1;
    });

    const carrerasHtml = Object.entries(carrerasMap).map(([carreraNombre, count]) => `
      <div class="flex items-center justify-between text-xs py-1 border-b border-slate-100 last:border-0">
        <span class="font-medium text-slate-700 truncate pr-2">${escapeHtml(carreraNombre)}</span>
        <span class="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">${count} (${Math.round((count / total) * 100)}%)</span>
      </div>
    `).join('');

    chartAsistencia.innerHTML = `
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div class="p-3 rounded-xl bg-blue-50 border border-blue-200 text-center">
          <p class="text-lg font-extrabold text-blue-800">${cAsistio}</p>
          <p class="text-[11px] font-bold text-blue-700">Asistió (Check-in)</p>
        </div>
        <div class="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
          <p class="text-lg font-extrabold text-emerald-800">${cConfirmado}</p>
          <p class="text-[11px] font-bold text-emerald-700">Confirmadas</p>
        </div>
        <div class="p-3 rounded-xl bg-amber-50 border border-amber-200 text-center">
          <p class="text-lg font-extrabold text-amber-800">${cPendiente}</p>
          <p class="text-[11px] font-bold text-amber-700">Pendientes</p>
        </div>
        <div class="p-3 rounded-xl bg-rose-50 border border-rose-200 text-center">
          <p class="text-lg font-extrabold text-rose-800">${cCancelado}</p>
          <p class="text-[11px] font-bold text-rose-700">Canceladas (${pctCancel}%)</p>
        </div>
      </div>

      <!-- Barra apilada de efectividad -->
      <div class="space-y-1 pt-2">
        <div class="flex justify-between text-xs font-bold">
          <span class="text-emerald-800">Tasa de Aprobación / Asistencia Activa: ${pctEfectiva}%</span>
          <span class="text-rose-700">Cancelaciones: ${pctCancel}%</span>
        </div>
        <div class="w-full h-3.5 rounded-full bg-slate-200 overflow-hidden flex">
          <div class="bg-blue-600 h-full" style="width: ${(cAsistio / total) * 100}%" title="Asistió"></div>
          <div class="bg-emerald-600 h-full" style="width: ${(cConfirmado / total) * 100}%" title="Confirmado"></div>
          <div class="bg-amber-400 h-full" style="width: ${(cPendiente / total) * 100}%" title="Pendiente"></div>
          <div class="bg-rose-500 h-full" style="width: ${(cCancelado / total) * 100}%" title="Cancelado"></div>
        </div>
      </div>

      <div class="pt-2">
        <p class="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Desglose por Programa Educativo (Carrera)</p>
        <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
          ${carrerasHtml || '<p class="text-xs text-slate-400">Sin datos</p>'}
        </div>
      </div>
    `;
  }

  // Tabla consolidada de auditoría en Módulo 4
  const tbodyAuditoria = document.getElementById('tabla-auditoria-mod4');
  if (tbodyAuditoria) {
    tbodyAuditoria.innerHTML = reservasFiltradas.map(r => {
      const lab = appState.laboratorios.find(l => Number(l.id_laboratorio) === Number(r.id_laboratorio));
      return `
        <tr class="border-b border-slate-100 hover:bg-slate-50 text-xs">
          <td class="px-4 py-3 font-mono font-bold text-slate-800">${escapeHtml(r.folio || 'PENDIENTE')}</td>
          <td class="px-4 py-3 font-bold text-slate-900">${escapeHtml(r.nombre_estudiante)}</td>
          <td class="px-4 py-3 font-mono text-slate-700">${escapeHtml(r.matricula_estudiante)}</td>
          <td class="px-4 py-3 text-slate-600">${escapeHtml(r.carrera)}</td>
          <td class="px-4 py-3 font-semibold text-slate-800">${escapeHtml(lab ? lab.nombre : r.nombre_laboratorio)}</td>
          <td class="px-4 py-3 whitespace-nowrap">${escapeHtml(r.fecha_reserva)} (${escapeHtml(r.bloque_horario)})</td>
          <td class="px-4 py-3">${renderBadgeEstadoReserva(r.estado)}</td>
          <td class="px-4 py-3 text-slate-600 max-w-xs">${escapeHtml(r.estado === 'Cancelado' ? `Cancelado: ${r.motivo_cancelacion}` : r.motivo_uso)}</td>
        </tr>
      `;
    }).join('');
  }
}

/**
 * Exportación a Excel (CSV real con BOM UTF-8) - Pantalla 4.1
 */
function exportarReporteCSV() {
  const filas = obtenerReservacionesFiltradasMod4();
  if (filas.length === 0) {
    mostrarToast('warning', 'Sin datos para exportar', 'No hay registros que coincidan con los filtros seleccionados.');
    return;
  }

  const encabezados = [
    'ID_Reservacion',
    'Folio',
    'Matricula',
    'Nombre_Estudiante',
    'Carrera',
    'Laboratorio',
    'Fecha_Reserva',
    'Bloque_Horario',
    'Estado',
    'Motivo_Academico',
    'Motivo_Cancelacion',
    'Fecha_Solicitud'
  ];

  const lineasCSV = [
    encabezados.join(','),
    ...filas.map(r => {
      const lab = appState.laboratorios.find(l => Number(l.id_laboratorio) === Number(r.id_laboratorio));
      const campos = [
        r.id_reservacion,
        r.folio || 'SIN_FOLIO',
        r.matricula_estudiante,
        r.nombre_estudiante,
        r.carrera,
        lab ? lab.nombre : r.nombre_laboratorio,
        r.fecha_reserva,
        r.bloque_horario,
        r.estado,
        r.motivo_uso,
        r.motivo_cancelacion || 'N/A',
        r.fecha_solicitud || ''
      ];
      return campos.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',');
    })
  ];

  const contenido = '\uFEFF' + lineasCSV.join('\r\n');
  const blob = new Blob([contenido], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Reporte_Auditoria_Laboratorios_UTVM_Equipo4_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  mostrarToast('success', 'Archivo Excel (CSV) Descargado', `Se exportaron ${filas.length} registros de auditoría académica UTVM.`);
}

/**
 * Exportar a PDF / Imprimir Reporte Institucional - Pantalla 4.1
 */
function imprimirReportePDF() {
  cambiarModulo('mod4');
  setTimeout(() => {
    window.print();
  }, 150);
}

// =====================================================================================
// 9. SIMULADOR DE NUEVA SOLICITUD DESDE APP MÓVIL & PANEL XAMPP / MYSQL
// =====================================================================================

function abrirModalNuevaSolicitudApp() {
  const selectLab = document.getElementById('app-sim-lab');
  if (selectLab) {
    selectLab.innerHTML = appState.laboratorios.map(l =>
      `<option value="${l.id_laboratorio}">${escapeHtml(l.nombre)} (${l.cupo_ocupado_actual}/${l.capacidad_maxima} - ${l.estatus_operativo})</option>`
    ).join('');
  }
  const modal = document.getElementById('modal-simular-app');
  if (modal) modal.classList.remove('hidden');
}

function cerrarModalNuevaSolicitudApp() {
  const modal = document.getElementById('modal-simular-app');
  if (modal) modal.classList.add('hidden');
}

async function enviarSolicitudDesdeAppMovil(event) {
  if (event) event.preventDefault();

  const matricula = getValue('app-sim-matricula').trim();
  const nombre = getValue('app-sim-nombre').trim();
  const carrera = getValue('app-sim-carrera').trim();
  const idLab = Number(getValue('app-sim-lab'));
  const fecha = getValue('app-sim-fecha').trim();
  const bloque = getValue('app-sim-bloque').trim();
  const motivo = getValue('app-sim-motivo').trim();
  const acepto = document.getElementById('app-sim-acepto')?.checked ? 1 : 0;

  // Regla 3: Identidad obligatoria
  if (!matricula || !nombre) {
    mostrarToast('error', 'Regla de Identidad UTVM', 'Toda reservación debe incluir una matrícula y nombre completo válidos.');
    return;
  }
  if (!motivo) {
    mostrarToast('error', 'Motivo requerido', 'Especifique la práctica o motivo académico de uso del laboratorio.');
    return;
  }
  if (!acepto) {
    mostrarToast('error', 'Reglamento obligatorio', 'El estudiante debe aceptar el reglamento y requisitos de ingreso.');
    return;
  }

  // Regla 1: Verificar traslape para la misma matrícula, fecha y bloque horario
  const traslape = appState.reservaciones.find(r =>
    r.matricula_estudiante === matricula &&
    r.fecha_reserva === fecha &&
    r.bloque_horario === bloque &&
    ['Pendiente', 'Confirmado', 'Asistio'].includes(r.estado)
  );

  if (traslape) {
    mostrarToast(
      'error',
      'Restricción de Traslape Detectada',
      `El alumno con matrícula ${matricula} ya cuenta con una reservación (${traslape.estado}) el ${fecha} en el bloque ${bloque}.`
    );
    return;
  }

  if (appState.connectionMode === 'xampp' && appState.activeEndpoint) {
    try {
      const resp = await fetch(`${appState.activeEndpoint}?action=crear_reserva`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matricula_estudiante: matricula,
          nombre_estudiante: nombre,
          carrera,
          id_laboratorio: idLab,
          fecha_reserva: fecha,
          bloque_horario: bloque,
          motivo_uso: motivo,
          acepto_requisitos: 1
        })
      });
      const json = await resp.json();
      if (!json.success) {
        mostrarToast('error', 'Validación MySQL', json.message);
        return;
      }
      if (json.data && json.data.estado_global) {
        aplicarEstadoDesdeServidor(json.data.estado_global);
      }
      cerrarModalNuevaSolicitudApp();
      cambiarModulo('mod1');
      mostrarToast('success', 'Solicitud Recibida desde App Móvil', json.message);
      return;
    } catch (e) {
      console.warn('Insertando nueva solicitud en modo local:', e);
    }
  }

  const lab = appState.laboratorios.find(l => Number(l.id_laboratorio) === idLab);
  const nuevoId = appState.reservaciones.reduce((max, r) => Math.max(max, Number(r.id_reservacion || 0)), 0) + 1;

  appState.reservaciones.unshift({
    id_reservacion: nuevoId,
    folio: null,
    matricula_estudiante: matricula,
    nombre_estudiante: nombre,
    carrera,
    id_laboratorio: idLab,
    nombre_laboratorio: lab ? lab.nombre : 'Laboratorio UTVM',
    edificio: lab ? lab.edificio : 'Edificio K',
    planta: lab ? lab.planta : 'Planta Alta',
    fecha_reserva: fecha,
    bloque_horario: bloque,
    motivo_uso: motivo,
    acepto_requisitos: 1,
    estado: 'Pendiente',
    motivo_cancelacion: null,
    codigo_qr_hash: null,
    fecha_solicitud: obtenerFechaHoraActualSQL()
  });

  guardarEstadoLocal();
  cerrarModalNuevaSolicitudApp();
  cambiarModulo('mod1');
  mostrarToast(
    'success',
    'Nueva Solicitud Sincronizada desde App Móvil',
    `Solicitud #${nuevoId} de ${nombre} (${matricula}) registrada en estado Pendiente.`
  );
}

// Panel de Infraestructura XAMPP / MySQL
function abrirModalXAMPP() {
  const modal = document.getElementById('modal-xampp-panel');
  if (modal) {
    modal.classList.remove('hidden');
    actualizarIndicadorConexionUI();
  }
}

function cerrarModalXAMPP() {
  const modal = document.getElementById('modal-xampp-panel');
  if (modal) modal.classList.add('hidden');
}

async function restaurarDatosSemillaEquipo4() {
  if (appState.connectionMode === 'xampp' && appState.activeEndpoint) {
    try {
      const resp = await fetch(`${appState.activeEndpoint}?action=reset_demo`, {
        method: 'POST'
      });
      const json = await resp.json();
      if (json.success && json.data && json.data.estado_global) {
        aplicarEstadoDesdeServidor(json.data.estado_global);
      }
    } catch (e) {
      console.warn('Restaurando semilla en modo local:', e);
    }
  }
  restaurarSemillaLocal();
  appState.qrValidationResult = null;
  renderizarTodo();
  mostrarToast(
    'success',
    'Datos Semilla Restaurados (Equipo 4 - UTVM)',
    'Se restablecieron las reservaciones iniciales (Erick Pendiente para generar LAB-2026-9812, Jonathan, Diana, Misael y Daniel).'
  );
}

function descargarScriptSQL() {
  // Intentar descarga directa o generar el archivo SQL completo en el navegador
  const link = document.createElement('a');
  link.href = './database/utvm_reservas_labs.sql';
  link.download = 'utvm_reservas_labs.sql';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  mostrarToast('info', 'Descargando utvm_reservas_labs.sql', 'Importe este archivo directamente en http://localhost/phpmyadmin');
}

function copiarCodigoSQLPortapapeles() {
  const codeBlock = document.getElementById('xampp-sql-preview');
  if (!codeBlock) return;
  navigator.clipboard.writeText(codeBlock.innerText).then(() => {
    mostrarToast('success', 'Script SQL Copiado', 'Pegue el script en la pestaña SQL de phpMyAdmin (http://localhost/phpmyadmin).');
  });
}

// =====================================================================================
// 10. GENERADOR DE CÓDIGO QR VISUAL (SVG) Y UTILIDADES UI (TOASTS)
// =====================================================================================

/**
 * Genera un Código QR visual determinista en formato SVG limpio y escaneable visualmente
 * a partir del hash de la reservación (sin depender de librerías externas).
 */
function generarCodigoQRVisualSVG(texto, size = 140) {
  const cells = 21;
  const matrix = Array.from({ length: cells }, () => Array(cells).fill(false));

  // Patrones de búsqueda (Finder Patterns 7x7 en las 3 esquinas)
  const drawFinder = (r0, c0) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
        const isInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        matrix[r0 + r][c0 + c] = isBorder || isInner;
      }
    }
  };
  drawFinder(0, 0);
  drawFinder(0, cells - 7);
  drawFinder(cells - 7, 0);

  // Líneas de sincronización
  for (let i = 8; i < cells - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  // Rellenar módulos de datos de forma determinista según el texto del folio/hash
  let seed = 2166136261;
  for (let i = 0; i < texto.length; i++) {
    seed ^= texto.charCodeAt(i);
    seed = Math.imul(seed, 16777619);
  }

  for (let r = 0; r < cells; r++) {
    for (let c = 0; c < cells; c++) {
      const inTopLeft = r < 8 && c < 8;
      const inTopRight = r < 8 && c >= cells - 8;
      const inBottomLeft = r >= cells - 8 && c < 8;
      if (inTopLeft || inTopRight || inBottomLeft || r === 6 || c === 6) continue;

      seed ^= (r * 31 + c * 17) + texto.charCodeAt((r + c) % texto.length);
      seed = Math.imul(seed, 16777619);
      matrix[r][c] = (Math.abs(seed) % 10) < 5;
    }
  }

  const rects = [];
  for (let r = 0; r < cells; r++) {
    for (let c = 0; c < cells; c++) {
      if (matrix[r][c]) {
        rects.push(`<rect x="${c + 1}" y="${r + 1}" width="1" height="1" fill="#0F172A"/>`);
      }
    }
  }

  return `
    <svg width="${size}" height="${size}" viewBox="0 0 ${cells + 2} ${cells + 2}" xmlns="http://www.w3.org/2000/svg" class="rounded-lg">
      <rect width="${cells + 2}" height="${cells + 2}" fill="#FFFFFF"/>
      ${rects.join('')}
    </svg>
  `;
}

/**
 * Muestra una notificación tipo Toast confirmando sincronización con MySQL y App Móvil.
 */
function mostrarToast(tipo, titulo, mensaje) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  let estilos = 'bg-emerald-950 text-white border-emerald-500';
  let icono = 'check-circle-2';

  if (tipo === 'error') {
    estilos = 'bg-rose-950 text-white border-rose-500';
    icono = 'alert-octagon';
  } else if (tipo === 'warning') {
    estilos = 'bg-amber-950 text-white border-amber-400';
    icono = 'alert-triangle';
  } else if (tipo === 'info') {
    estilos = 'bg-slate-900 text-white border-emerald-400';
    icono = 'smartphone';
  }

  toast.className = `flex items-start gap-3 p-4 rounded-2xl border-l-4 shadow-xl max-w-md w-full animate-modal ${estilos}`;
  toast.innerHTML = `
    <i data-lucide="${icono}" class="w-5 h-5 shrink-0 mt-0.5 text-emerald-300"></i>
    <div class="flex-1 text-xs">
      <div class="flex items-center justify-between gap-2">
        <p class="font-bold text-sm">${escapeHtml(titulo)}</p>
        <span class="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-emerald-200 font-mono">Sync App UTVM</span>
      </div>
      <p class="text-slate-200 mt-1 leading-relaxed">${escapeHtml(mensaje)}</p>
    </div>
    <button onclick="this.parentElement.remove()" class="text-slate-400 hover:text-white">
      <i data-lucide="x" class="w-4 h-4"></i>
    </button>
  `;

  container.appendChild(toast);
  if (window.lucide) window.lucide.createIcons();

  setTimeout(() => {
    if (toast.parentElement) toast.remove();
  }, 5500);
}

// Helpers DOM
function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function setValue(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val ?? '';
}

function getValue(id) {
  const el = document.getElementById(id);
  return el ? el.value : '';
}

function obtenerIniciales(nombre) {
  if (!nombre) return 'UT';
  const partes = nombre.trim().split(/\s+/);
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[1][0]).toUpperCase();
}

function obtenerFechaHoraActualSQL() {
  const d = new Date();
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
