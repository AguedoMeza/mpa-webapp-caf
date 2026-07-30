@echo off
REM Arranque para desarrollo local: con --reload.
REM El servicio NSSM usa start_backend.bat, que NO lleva --reload.
cd /d "%~dp0"
call venv\Scripts\activate.bat
set PYTHONIOENCODING=utf-8
set PYTHONUTF8=1
chcp 65001 >nul
uvicorn main:app --host 0.0.0.0 --port 8003 --reload
