# Sistema Administrador Web de Reservación de Laboratorios Académicos - UTVM

Sistema Administrador Web sincronizado con la App Móvil **"Reservas Labs UTVM"**, diseñado para ejecutarse en entorno local **XAMPP (Apache + MySQL + phpMyAdmin)** con **Modo Híbrido Inteligente** (MySQL en vivo + Fallback Local en `localStorage`).

---

## 🏛️ Datos Institucionales y Créditos (Equipo 4)

- **Institución:** Universidad Tecnológica del Valle del Mezquital (UTVM)
- **Asignatura:** Metodología No Code con IA
- **Docente:** Mtro. Omar Hernández Landeros
- **Grupo:** "C", Cuatrimestre 4, T.S.U. en Inteligencia Artificial
- **Integrantes del Equipo 4:**
  1. **Erick Francisco Ramírez Bautista** (`2530706`) — *Caso Principal Sección 5 (`LAB-2026-9812`)*
  2. **Jonathan Axel Rafael Reyes** (`2530701`) — *Folio `LAB-2026-9813`*
  3. **Diana** (`2530702`) — *Folio `LAB-2026-9814`*
  4. **Misael López Lucio** (`2530703`) — *Folio `LAB-2026-9810` (Check-in 08:32 hrs)*
  5. **Daniel Emiliano García Cardón** (`2530704`) — *Solicitud en Laboratorio de Desarrollo de Software (29/30)*

---

## 📁 Estructura del Proyecto

```text
utvm_reservas_labs/
├── index.html                        # Dashboard Web Principal (4 Módulos + Conmutador de Rol + Panel XAMPP)
├── desplegar_en_xampp.bat            # Script automático de despliegue a C:\xampp\htdocs\utvm_reservas_labs
├── database/
│   └── utvm_reservas_labs.sql        # Script SQL completo (CREATE DATABASE, 4 Tablas e INSERT INTO semilla)
├── api/
│   ├── conexion.php                  # Conexión PDO a MySQL en XAMPP (localhost:3306, root, "") + Auto-aprovisionamiento
│   └── endpoints.php                 # Endpoints REST (GET/POST) con las 5 reglas de validación obligatorias
└── assets/
    ├── css/
    │   └── styles.css                # Identidad visual Verde Institucional UTVM (#0F5132 / #047857) y estilos PDF
    └── js/
        └── app.js                    # Lógica Full-Stack, Modo Híbrido XAMPP/LocalStorage, Generador QR SVG y Gráficas
```

---

## 🚀 Despliegue en XAMPP (`Apache + MySQL + phpMyAdmin`)

### Opción A: Automática (1 Clic en Windows)
1. Ejecute el archivo **`desplegar_en_xampp.bat`** incluido en esta carpeta.
2. El script copiará automáticamente el proyecto a `C:\xampp\htdocs\utvm_reservas_labs` e importará `database/utvm_reservas_labs.sql` en el motor MySQL de XAMPP si está activo.
3. Abra en su navegador: **`http://localhost/utvm_reservas_labs/`**

### Opción B: Manual en XAMPP / phpMyAdmin
1. En el **Panel de Control de XAMPP**, inicie los servicios **Apache** y **MySQL** (Puerto `3306`).
2. Copie el contenido de este proyecto en `C:\xampp\htdocs\utvm_reservas_labs`.
3. Ingrese a `http://localhost/phpmyadmin` e importe el archivo `database/utvm_reservas_labs.sql` (o simplemente abra `http://localhost/utvm_reservas_labs/`; `api/conexion.php` creará e importará la base de datos `utvm_reservas_labs` automáticamente en el primer acceso).
4. También puede abrir `index.html` directamente sin iniciar XAMPP gracias al **Modo Híbrido Inteligente**.
