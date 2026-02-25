@echo off
cd /d "C:\inetpub\wwwroot\mpa-webapp-caf\backend"
call venv\Scripts\activate.bat
set PYTHONIOENCODING=utf-8
set PYTHONUTF8=1
chcp 65001 >nul
uvicorn main:app --host 0.0.0.0 --port 8003 --reload