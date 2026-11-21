@echo off
chcp 65001 >nul
echo ===============================================================================
echo   DESPLIEGUE AUTOMATICO EN XAMPP - SISTEMA RESERVAS LABS UTVM (EQUIPO 4)
echo ===============================================================================
echo.

set "DESTINO=C:\xampp\htdocs\utvm_reservas_labs"

if not exist "C:\xampp\htdocs" (
    echo [AVISO] No se encontro C:\xampp\htdocs en este equipo.
    echo Puede abrir index.html directamente en su navegador usando el Modo Hibrido.
    pause
    exit /b 1
)

echo [1/3] Copiando archivos del proyecto a %DESTINO% ...
if not exist "%DESTINO%" mkdir "%DESTINO%"
xcopy /E /I /Y "%~dp0*" "%DESTINO%\" >nul
echo       Archivos copiados correctamente.
echo.

if exist "C:\xampp\mysql\bin\mysql.exe" (
    echo [2/3] Importando base de datos utvm_reservas_labs en MySQL de XAMPP (Puerto 3306)...
    "C:\xampp\mysql\bin\mysql.exe" -u root --default-character-set=utf8mb4 < "%~dp0database\utvm_reservas_labs.sql" 2>nul
    if %ERRORLEVEL% EQU 0 (
        echo       Base de datos utvm_reservas_labs importada con exito en MySQL!
    ) else (
        echo       [NOTA] Asegurese de que el servicio MySQL este iniciado en el Panel de XAMPP.
        echo       La base de datos tambien se auto-importara al abrir el sistema en Apache.
    )
) else (
    echo [2/3] Puede importar database\utvm_reservas_labs.sql desde http://localhost/phpmyadmin
)

echo.
echo [3/3] Abriendo el Sistema Administrador en http://localhost/utvm_reservas_labs/ ...
start "" "http://localhost/utvm_reservas_labs/"
echo.
echo Despliegue finalizado con exito.
pause
