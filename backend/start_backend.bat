@echo off
cd /d "C:\inetpub\wwwroot\mpa-webapp-caf\backend"
call venv\Scripts\activate.bat
uvicorn main:app --host 0.0.0.0 --port 8003 --reload