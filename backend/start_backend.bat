@echo off
cd /d "C:\inetpub\wwwroot\mpa-webapp-caf\backend"
call venv\Scripts\activate.bat
set PYTHONIOENCODING=utf-8
set PYTHONUTF8=1
chcp 65001 >nul
REM Sin --reload: lo ejecuta el servicio NSSM Backend-WebappCAF.
REM El deploy reinicia el servicio explicitamente (deploy_backend.py: nssm restart).
REM Para desarrollo local usa start_backend_dev.bat
uvicorn main:app --host 0.0.0.0 --port 8003